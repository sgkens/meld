/**
 * @fileoverview MeldSocket — WebSocket plugin for Meld.js
 * @plugin MeldSocket
 * @version 1.0.0
 *
 * Features:
 *   ■ Reactive connection state  (status, latency, error)
 *   ■ Auto-reconnect with exponential backoff + jitter
 *   ■ Heartbeat / ping-pong keep-alive
 *   ■ Offline message queue — messages sent while disconnected
 *     are flushed automatically on reconnect
 *   ■ Named channels / topics (subscribe pattern)
 *   ■ JSON  and raw binary (ArrayBuffer / Blob) transports
 *   ■ Request-Response pattern with per-message correlation IDs
 *   ■ Middleware pipeline for inbound and outbound messages
 *   ■ Presence tracking (who else is connected)
 *   ■ Connection lifecycle hooks (onConnect, onDisconnect, onError)
 *   ■ Devtools integration (window.__MELD_SOCKET__ diagnostic handle)
 *   ■ Graceful teardown on component destroy
 *
 * Usage:
 *   import { use } from './meld.core.js';
 *   import { MeldSocket } from './plugins/meld-socket.js';
 *
 *   use(MeldSocket, {
 *     url: 'wss://api.example.com/ws',
 *     reconnect: true,
 *     heartbeat: { interval: 30_000, message: { type: 'ping' } }
 *   });
 *
 *   // Inside a defineMeld setup:
 *   const { status, send, subscribe, request } = useSocket();
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const SOCKET_STATUS = {
  CONNECTING:   'connecting',
  OPEN:         'open',
  CLOSING:      'closing',
  CLOSED:       'closed',
  RECONNECTING: 'reconnecting',
};

const DEFAULT_OPTIONS = {
  // Connection
  url:              null,       // string | () => string  — required
  protocols:        [],         // WebSocket sub-protocols

  // Reconnect
  reconnect:        true,
  reconnectDelay:   1_000,      // ms — base delay (doubles each attempt)
  reconnectMax:     30_000,     // ms — max backoff ceiling
  reconnectAttempts: Infinity,  // how many times to try

  // Heartbeat
  heartbeat: {
    enabled:  false,
    interval: 30_000,           // ms between pings
    timeout:  10_000,           // ms to wait for pong before disconnect
    message:  { type: 'ping' }, // payload sent as ping
    pongType: 'pong',           // type string of expected pong reply
  },

  // Transport
  serialize:   JSON.stringify,  // outbound serialiser
  deserialize: JSON.parse,      // inbound deserialiser

  // Protocol: field used to route to named channels
  typeField:   'type',
  idField:     'id',

  // Request-Response
  requestTimeout: 10_000,       // ms before a request() promise rejects

  // Presence
  presence: {
    enabled: false,
    joinType: 'presence:join',
    leaveType: 'presence:leave',
    listType:  'presence:list',
  },

  // Lifecycle callbacks (also available via on('connect', fn))
  onOpen:    null,
  onClose:   null,
  onError:   null,
  onMessage: null,

  // DX
  debug: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _idSeq = 0;
const uid = () => `meld_${++_idSeq}_${Math.random().toString(36).slice(2, 7)}`;

const jitter = (base) => base * (0.8 + Math.random() * 0.4);

function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' &&
      target[key] !== null
    ) {
      out[key] = deepMerge(target[key], source[key]);
    } else if (source[key] !== undefined) {
      out[key] = source[key];
    }
  }
  return out;
}

// ─── Core Socket Manager ──────────────────────────────────────────────────────

function createSocketManager(meldState, onDestroyHook, opts) {
  const cfg = deepMerge(DEFAULT_OPTIONS, opts);

  // ── Reactive public state ────────────────────────────────────────────────
  const state = meldState({
    status:      SOCKET_STATUS.CLOSED,
    latency:     null,   // ms — round-trip time of last heartbeat
    error:       null,   // last error message
    attempts:    0,      // current reconnect attempt count
    sentCount:   0,      // total messages sent
    recvCount:   0,      // total messages received
    presence:    [],     // array of peer presence objects (if enabled)
  });

  // ── Internal state ───────────────────────────────────────────────────────
  let _ws            = null;
  let _reconnectTimer = null;
  let _heartbeatTimer = null;
  let _pongTimer      = null;
  let _pongPending    = false;
  let _queue          = [];          // offline message queue
  let _destroyed      = false;

  // Event listener registry  { eventName → Set<fn> }
  const _listeners    = new Map();
  // Channel subscriptions    { channelType → Set<fn> }
  const _channels     = new Map();
  // Pending request promises { correlationId → { resolve, reject, timer } }
  const _pending      = new Map();
  // Middleware pipeline arrays
  const _inMiddleware  = [];
  const _outMiddleware = [];

  // ── Logging ──────────────────────────────────────────────────────────────
  const log = cfg.debug
    ? (...args) => console.debug('[MeldSocket]', ...args)
    : () => {};

  // ── Internal event emitter ───────────────────────────────────────────────
  const emit = (event, ...args) => {
    const fns = _listeners.get(event);
    if (fns) fns.forEach(fn => { try { fn(...args); } catch (e) { console.warn('[MeldSocket] listener error', e); } });
  };

  const on = (event, fn) => {
    if (!_listeners.has(event)) _listeners.set(event, new Set());
    _listeners.get(event).add(fn);
    return () => _listeners.get(event)?.delete(fn);
  };

  // ── Middleware pipeline ──────────────────────────────────────────────────
  /**
   * Run message through a pipeline of middleware fns.
   * Each fn receives (message, next) where next() calls the next middleware.
   * If any middleware returns false the message is dropped.
   * @returns {object|null} transformed message, or null if dropped
   */
  const runPipeline = async (pipeline, message) => {
    let idx = 0;
    let current = message;
    const run = async () => {
      if (idx >= pipeline.length) return current;
      const mw = pipeline[idx++];
      const result = await mw(current, (transformed) => {
        if (transformed !== undefined) current = transformed;
        return run();
      });
      if (result === false) return null;
      if (result !== undefined) current = result;
      return current;
    };
    return run();
  };

  // ── URL resolver ─────────────────────────────────────────────────────────
  const resolveUrl = () =>
    typeof cfg.url === 'function' ? cfg.url() : cfg.url;

  // ── Heartbeat ────────────────────────────────────────────────────────────
  const stopHeartbeat = () => {
    clearTimeout(_heartbeatTimer);
    clearTimeout(_pongTimer);
    _heartbeatTimer = null;
    _pongTimer      = null;
    _pongPending    = false;
  };

  const startHeartbeat = () => {
    if (!cfg.heartbeat.enabled) return;
    stopHeartbeat();
    _heartbeatTimer = setInterval(() => {
      if (state.status !== SOCKET_STATUS.OPEN) return;
      const pingStart = Date.now();
      _pongPending = true;
      sendRaw(cfg.heartbeat.message);
      log('ping sent');

      _pongTimer = setTimeout(() => {
        if (_pongPending) {
          log('pong timeout — forcing reconnect');
          state.error = 'Heartbeat timeout';
          _ws?.close(4000, 'heartbeat_timeout');
        }
      }, cfg.heartbeat.timeout);

      // If pong arrives, latency is updated in handleMessage
      // Store the ping start for latency calc
      _pongPendingStart = pingStart;
    }, cfg.heartbeat.interval);
  };
  let _pongPendingStart = 0;

  // ── Outbound send (raw — bypasses queue, no middleware) ──────────────────
  const sendRaw = (payload) => {
    if (typeof WebSocket === 'undefined' || !_ws || _ws.readyState !== WebSocket.OPEN) return false;
    try {
      const isBlob = typeof Blob !== 'undefined' && payload instanceof Blob;
      const data = payload instanceof ArrayBuffer || isBlob
        ? payload
        : cfg.serialize(payload);
      _ws.send(data);
      return true;
    } catch (e) {
      log('sendRaw error', e);
      return false;
    }
  };

  // ── Flush offline queue ──────────────────────────────────────────────────
  const flushQueue = () => {
    const toSend = _queue.splice(0);
    toSend.forEach(({ payload, resolve, reject }) => {
      if (sendRaw(payload)) {
        state.sentCount++;
        resolve?.();
      } else {
        reject?.(new Error('WebSocket not open'));
      }
    });
    log(`Flushed ${toSend.length} queued message(s)`);
  };

  // ── Inbound message router ───────────────────────────────────────────────
  const handleMessage = async (event) => {
    state.recvCount++;
    let msg;

    // Binary passthrough
    if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
      msg = event.data;
    } else {
      try { msg = cfg.deserialize(event.data); }
      catch { msg = event.data; } // raw string fallback
    }

    // Heartbeat pong
    if (
      cfg.heartbeat.enabled &&
      _pongPending &&
      typeof msg === 'object' &&
      msg !== null &&
      msg[cfg.typeField] === cfg.heartbeat.pongType
    ) {
      state.latency = Date.now() - _pongPendingStart;
      _pongPending  = false;
      clearTimeout(_pongTimer);
      log(`pong received, latency ${state.latency}ms`);
      return;
    }

    // Presence handling
    if (cfg.presence.enabled && typeof msg === 'object' && msg !== null) {
      const t = msg[cfg.typeField];
      if (t === cfg.presence.listType)  { state.presence = msg.members ?? []; return; }
      if (t === cfg.presence.joinType)  { state.presence = [...state.presence, msg.member]; return; }
      if (t === cfg.presence.leaveType) { state.presence = state.presence.filter(m => m.id !== msg.member?.id); return; }
    }

    // Request-Response correlation
    if (typeof msg === 'object' && msg !== null && msg[cfg.idField]) {
      const pending = _pending.get(msg[cfg.idField]);
      if (pending) {
        clearTimeout(pending.timer);
        _pending.delete(msg[cfg.idField]);
        pending.resolve(msg);
        return;
      }
    }

    // Run inbound middleware pipeline
    const processed = await runPipeline(_inMiddleware, msg);
    if (processed === null) return; // dropped by middleware

    // Route to channel subscribers
    if (typeof processed === 'object' && processed !== null && processed[cfg.typeField]) {
      const channelFns = _channels.get(processed[cfg.typeField]);
      if (channelFns) channelFns.forEach(fn => fn(processed));
    }

    // Global message callback and event
    cfg.onMessage?.(processed);
    emit('message', processed);
  };

  // ── WebSocket lifecycle ──────────────────────────────────────────────────
  const connect = () => {
    if (_destroyed) return;
    if (typeof WebSocket === 'undefined') {
      state.error = 'WebSocket is not available in this environment';
      state.status = SOCKET_STATUS.CLOSED;
      return;
    }
    if (_ws && (_ws.readyState === WebSocket.OPEN || _ws.readyState === WebSocket.CONNECTING)) return;

    const url = resolveUrl();
    if (!url) { log('No URL provided'); return; }

    log(`Connecting to ${url}`);
    state.status = state.attempts > 0 ? SOCKET_STATUS.RECONNECTING : SOCKET_STATUS.CONNECTING;
    state.error  = null;

    try {
      _ws = new WebSocket(url, cfg.protocols.length ? cfg.protocols : undefined);
      _ws.binaryType = 'arraybuffer';
    } catch (e) {
      state.error  = e.message;
      state.status = SOCKET_STATUS.CLOSED;
      log('WebSocket constructor error', e);
      scheduleReconnect();
      return;
    }

    _ws.onopen = () => {
      log('Connection open');
      state.status   = SOCKET_STATUS.OPEN;
      state.attempts = 0;
      state.error    = null;
      cfg.onOpen?.();
      emit('connect');
      flushQueue();
      startHeartbeat();
    };

    _ws.onclose = (event) => {
      log(`Connection closed: code=${event.code} reason=${event.reason}`);
      stopHeartbeat();
      state.status = SOCKET_STATUS.CLOSED;
      cfg.onClose?.(event);
      emit('disconnect', event);
      if (!_destroyed && cfg.reconnect && event.code !== 1000 && event.code !== 4001) {
        scheduleReconnect();
      }
    };

    _ws.onerror = (event) => {
      log('Connection error', event);
      state.error = 'WebSocket error';
      cfg.onError?.(event);
      emit('error', event);
    };

    _ws.onmessage = handleMessage;
  };

  const scheduleReconnect = () => {
    if (_destroyed || !cfg.reconnect) return;
    if (state.attempts >= cfg.reconnectAttempts) {
      log('Max reconnect attempts reached');
      emit('reconnect:exhausted');
      return;
    }
    state.attempts++;
    const baseDelay = Math.min(cfg.reconnectDelay * Math.pow(2, state.attempts - 1), cfg.reconnectMax);
    const delay     = Math.round(jitter(baseDelay));
    log(`Reconnecting in ${delay}ms (attempt ${state.attempts})`);
    emit('reconnect:attempt', { attempt: state.attempts, delay });
    _reconnectTimer = setTimeout(connect, delay);
  };

  const disconnect = (code = 1000, reason = 'client_close') => {
    clearTimeout(_reconnectTimer);
    stopHeartbeat();
    if (_ws) {
      state.status = SOCKET_STATUS.CLOSING;
      _ws.close(code, reason);
      _ws = null;
    }
  };

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Send a message through the middleware pipeline.
   * If the socket is closed and `queue` option truthy, buffers until reconnect.
   * Returns a Promise that resolves when the message is actually sent.
   */
  const send = async (payload, { queue = true } = {}) => {
    const processed = await runPipeline(_outMiddleware, payload);
    if (processed === null) return; // dropped by middleware

    if (state.status === SOCKET_STATUS.OPEN) {
      sendRaw(processed);
      state.sentCount++;
      return;
    }
    if (queue) {
      return new Promise((resolve, reject) => {
        _queue.push({ payload: processed, resolve, reject });
        log(`Queued message (queue size: ${_queue.length})`);
      });
    }
    throw new Error('WebSocket is not open');
  };

  /**
   * Subscribe to a named message type/channel.
   * Returns an unsubscribe function.
   */
  const subscribe = (type, fn) => {
    if (!_channels.has(type)) _channels.set(type, new Set());
    _channels.get(type).add(fn);
    return () => _channels.get(type)?.delete(fn);
  };

  /**
   * Send a message and await a correlated response.
   * Automatically injects an `id` field; server must echo the same `id`.
   */
  const request = (payload, { timeout = cfg.requestTimeout } = {}) => {
    const id = uid();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        _pending.delete(id);
        reject(new Error(`Request timed out: ${id}`));
      }, timeout);
      _pending.set(id, { resolve, reject, timer });
      send({ ...payload, [cfg.idField]: id }).catch(reject);
    });
  };

  /**
   * Register inbound middleware.
   * fn(message, next) — call next() or next(transformed) to continue pipeline.
   * Return false to drop the message.
   */
  const useInbound = (fn) => { _inMiddleware.push(fn); };

  /**
   * Register outbound middleware.
   * fn(message, next) — call next() or next(transformed) to continue.
   * Return false to drop.
   */
  const useOutbound = (fn) => { _outMiddleware.push(fn); };

  // ── Teardown ─────────────────────────────────────────────────────────────
  const destroy = () => {
    _destroyed = true;
    clearTimeout(_reconnectTimer);
    stopHeartbeat();
    // Reject all pending requests
    _pending.forEach(({ reject, timer }) => {
      clearTimeout(timer);
      reject(new Error('Socket destroyed'));
    });
    _pending.clear();
    // Reject queued messages
    _queue.forEach(({ reject }) => reject?.(new Error('Socket destroyed')));
    _queue = [];
    disconnect(4001, 'plugin_destroy');
  };

  // ── Devtools diagnostic handle ────────────────────────────────────────────
  if (typeof window !== 'undefined') {
    window.__MELD_SOCKET__ = {
      get status()    { return state.status; },
      get latency()   { return state.latency; },
      get queue()     { return _queue.length; },
      get pending()   { return _pending.size; },
      get channels()  { return [..._channels.keys()]; },
      send,
      connect,
      disconnect,
      destroy,
    };
  }

  // Auto-cleanup when the Meld component that called useSocket() is destroyed
  onDestroyHook?.(destroy);

  // Immediately connect on creation
  connect();

  return {
    // Reactive state (readonly references)
    state,
    get status()   { return state.status; },
    get latency()  { return state.latency; },
    get error()    { return state.error; },
    get presence() { return state.presence; },

    // Core operations
    send,
    subscribe,
    request,
    connect,
    disconnect,

    // Middleware
    useInbound,
    useOutbound,

    // Internal event bus
    on,
    emit,

    // Constants
    SOCKET_STATUS,
  };
}

// ─── Plugin Definition ────────────────────────────────────────────────────────

export const MeldSocket = {
  install(api, options = {}) {
    /**
     * Create a WebSocket connection scoped to the calling component.
     * Automatically disconnects when the component is destroyed.
     *
     * @param {object|string} urlOrOptions  URL string or full options object
     * @returns {SocketHandle}
     */
    api.useSocket = (urlOrOptions = {}) => {
      const opts = typeof urlOrOptions === 'string'
        ? { ...options, url: urlOrOptions }
        : { ...options, ...urlOrOptions };

      return createSocketManager(api.meldState, api.onDestroy, opts);
    };
  },

  setupHelpers(api, _options) {
    return { useSocket: api.useSocket };
  },
};

// ─── Named exports for direct use ────────────────────────────────────────────
export { SOCKET_STATUS };
