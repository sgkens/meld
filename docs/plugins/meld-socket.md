---
title: meld-socket
parent: Plugin Ecosystem
nav_order: 3
description: "Full-featured WebSocket plugin for Meld.js — auto-reconnect, heartbeat, message channels, presence tracking, and request-response pattern."
---

# meld-socket

`meld-socket` is the official WebSocket integration plugin for Meld.js. It wraps the browser `WebSocket` API with reactive state, automatic reconnection, structured message routing, and a full developer-experience layer.

<div class="api-filter-row">
  <div class="api-chip is-active" data-filter="all" style="background:var(--text-main); border-color:var(--text-main); color:var(--bg-main);">All</div>
  <div class="api-chip" data-filter="core"><span class="dot" style="background:var(--c-core)"></span>Core</div>
  <div class="api-chip" data-filter="dom"><span class="dot" style="background:var(--c-dom)"></span>Messaging</div>
  <div class="api-chip" data-filter="lifecycle"><span class="dot" style="background:var(--c-lifecycle)"></span>Lifecycle</div>
  <div class="api-chip" data-filter="context"><span class="dot" style="background:var(--c-context)"></span>Advanced</div>
</div>

---

## Installation

```javascript
import { use } from './meld.core.js';
import { MeldSocket } from './plugins/meld-socket.js';

use(MeldSocket, {
  url: 'wss://api.example.com/ws',
  reconnect: true,
  heartbeat: {
    enabled:  true,
    interval: 30_000,
    message:  { type: 'ping' },
    pongType: 'pong',
  },
  debug: true, // log all WS events to console
});
```

Once installed, `useSocket()` is available inside any component setup function.

---

## Quick Start

```javascript
defineMeld('live-feed', ({ el }, { useSocket }) => {
  const socket = useSocket('wss://api.example.com/ws');
  const messages = meldState({ items: [] });

  // Subscribe to a named channel
  socket.subscribe('chat:message', (msg) => {
    messages.items = [...messages.items, msg];
  });

  // Send a message
  const post = () => socket.send({ type: 'chat:message', text: 'Hello!' });

  return meldHtml`
    <div class="feed">
      <p>Status: ${() => socket.status}</p>
      <p>Latency: ${() => socket.latency ? socket.latency + 'ms' : '—'}</p>
      <ul>
        ${() => meld.list(
          () => messages.items,
          m => m.id,
          m => meldHtml`<li>${m.text}</li>`
        )}
      </ul>
      <button onclick="${post}">Post</button>
    </div>
  `;
});
```

---

## Configuration Reference

All options can be set globally via `use(MeldSocket, options)` or overridden per-connection in `useSocket(options)`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string \| () => string` | `null` | WebSocket endpoint URL. Can be a factory function that returns a dynamic URL. |
| `protocols` | `string[]` | `[]` | WebSocket sub-protocols list. |
| `reconnect` | `boolean` | `true` | Enable auto-reconnect on unexpected close. |
| `reconnectDelay` | `number` | `1000` | Base reconnect delay in ms. Doubles on each attempt. |
| `reconnectMax` | `number` | `30000` | Maximum reconnect backoff ceiling in ms. |
| `reconnectAttempts` | `number` | `Infinity` | Maximum number of reconnect attempts before giving up. |
| `heartbeat.enabled` | `boolean` | `false` | Enable ping-pong keep-alive. |
| `heartbeat.interval` | `number` | `30000` | Milliseconds between pings. |
| `heartbeat.timeout` | `number` | `10000` | Milliseconds to wait for pong before forcing reconnect. |
| `heartbeat.message` | `object` | `{ type: 'ping' }` | Payload sent as a ping. |
| `heartbeat.pongType` | `string` | `'pong'` | Value of the `type` field expected in the pong reply. |
| `serialize` | `Function` | `JSON.stringify` | Outbound serialiser. Replace for MessagePack or CBOR. |
| `deserialize` | `Function` | `JSON.parse` | Inbound deserialiser. |
| `typeField` | `string` | `'type'` | Field name used to route messages to named channels. |
| `idField` | `string` | `'id'` | Field name used for request-response correlation IDs. |
| `requestTimeout` | `number` | `10000` | Milliseconds before a `request()` call rejects. |
| `presence.enabled` | `boolean` | `false` | Enable presence tracking. |
| `presence.joinType` | `string` | `'presence:join'` | Message type for a peer joining. |
| `presence.leaveType` | `string` | `'presence:leave'` | Message type for a peer leaving. |
| `presence.listType` | `string` | `'presence:list'` | Message type carrying the full member list. |
| `onOpen` | `Function` | `null` | Callback fired when the connection opens. |
| `onClose` | `Function` | `null` | Callback fired when the connection closes. |
| `onError` | `Function` | `null` | Callback fired on WebSocket error. |
| `onMessage` | `Function` | `null` | Global raw message callback (fires after middleware). |
| `debug` | `boolean` | `false` | Log connection and message events to the browser console. |

---

<section class="api-entry" id="useSocket" data-category="core">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-core-soft); color:var(--c-core);">core</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-core);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-core);">useSocket</span><span class="fn-punct">(</span><span class="fn-param">urlOrOptions</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>SocketHandle</div>
  </div>
  <p class="api-entry-desc">Creates a managed WebSocket connection scoped to the calling component. The connection is automatically closed when the component is destroyed.</p>

  <div class="api-subhead">Parameters</div>
  <table class="api-params">
    <thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td class="pname">urlOrOptions</td><td class="ptype">string | object</td><td class="pdesc">Either a WebSocket URL string, or a full options object (same shape as the global plugin options).</td></tr>
    </tbody>
  </table>
</section>

<section class="api-entry" id="socket-send" data-category="dom">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-dom-soft); color:var(--c-dom);">messaging</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-dom);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-dom);">socket.send</span><span class="fn-punct">(</span><span class="fn-param">payload, options?</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>Promise&lt;void&gt;</div>
  </div>
  <p class="api-entry-desc">Sends a message through the outbound middleware pipeline. If the socket is not yet open, the message is queued and flushed automatically on reconnect.</p>

  <div class="api-subhead">Parameters</div>
  <table class="api-params">
    <thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td class="pname">payload</td><td class="ptype">object | ArrayBuffer | Blob</td><td class="pdesc">The message to send. Objects are serialised through <code>serialize</code> (default: <code>JSON.stringify</code>). Binary types are passed through directly.</td></tr>
      <tr><td class="pname">options.queue</td><td class="ptype">boolean</td><td class="pdesc">When <code>true</code> (default), messages sent while disconnected are buffered. Set to <code>false</code> to throw immediately if disconnected.</td></tr>
    </tbody>
  </table>
</section>

<section class="api-entry" id="socket-subscribe" data-category="dom">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-dom-soft); color:var(--c-dom);">messaging</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-dom);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-dom);">socket.subscribe</span><span class="fn-punct">(</span><span class="fn-param">type, handler</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>() =&gt; void</div>
  </div>
  <p class="api-entry-desc">Subscribes to a named message channel. The <code>handler</code> is called whenever an inbound message has a <code>type</code> field matching the given string. Returns an unsubscribe function.</p>

  <div class="api-subhead">Parameters</div>
  <table class="api-params">
    <thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td class="pname">type</td><td class="ptype">string</td><td class="pdesc">The message type to listen for (e.g. <code>'chat:message'</code>, <code>'order:update'</code>).</td></tr>
      <tr><td class="pname">handler</td><td class="ptype">Function</td><td class="pdesc">Callback receiving the full deserialized message object.</td></tr>
    </tbody>
  </table>

  <div class="api-subhead">Example</div>

```javascript
const unsub = socket.subscribe('order:update', (msg) => {
  state.order = msg.payload;
});

// On component cleanup, or conditionally:
unsub();
```
</section>

<section class="api-entry" id="socket-request" data-category="dom">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-dom-soft); color:var(--c-dom);">messaging</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-dom);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-dom);">socket.request</span><span class="fn-punct">(</span><span class="fn-param">payload, options?</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>Promise&lt;object&gt;</div>
  </div>
  <p class="api-entry-desc">Sends a message and waits for a correlated response from the server. Automatically injects a unique <code>id</code> field. The server must echo the same <code>id</code> in its reply. Rejects after <code>requestTimeout</code> ms.</p>

  <div class="api-subhead">Parameters</div>
  <table class="api-params">
    <thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td class="pname">payload</td><td class="ptype">object</td><td class="pdesc">Message to send. An <code>id</code> field is automatically merged in.</td></tr>
      <tr><td class="pname">options.timeout</td><td class="ptype">number</td><td class="pdesc">Override the global <code>requestTimeout</code> for this call (milliseconds).</td></tr>
    </tbody>
  </table>

  <div class="api-subhead">Example</div>

```javascript
try {
  const response = await socket.request({
    type: 'user:get',
    userId: 42,
  });
  state.user = response.data;
} catch (err) {
  state.error = err.message; // 'Request timed out: meld_5_abc12'
}
```
</section>

<section class="api-entry" id="socket-useInbound" data-category="context">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-context-soft); color:var(--c-context);">advanced</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-context);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-context);">socket.useInbound</span><span class="fn-punct">(</span><span class="fn-param">middleware</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>void</div>
  </div>
  <p class="api-entry-desc">Registers an inbound middleware function. Middleware receives each message after deserialization, before channel routing. Useful for authentication checks, decryption, or logging.</p>

  <div class="api-subhead">Parameters</div>
  <table class="api-params">
    <thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td class="pname">middleware</td><td class="ptype">async Function(msg, next)</td><td class="pdesc">Async function receiving the message and a <code>next(transformed?)</code> function. Call <code>next()</code> to pass through, <code>next(newMsg)</code> to transform, or return <code>false</code> to drop the message entirely.</td></tr>
    </tbody>
  </table>

  <div class="api-subhead">Example — Auth token injection</div>

```javascript
// Outbound: stamp every message with an auth token
socket.useOutbound(async (msg, next) => {
  return next({ ...msg, token: localStorage.getItem('auth_token') });
});

// Inbound: reject server messages if 'ok' is false
socket.useInbound(async (msg, next) => {
  if (msg.ok === false) {
    console.warn('Server error:', msg.error);
    return false; // drop — no further processing
  }
  return next();
});
```
</section>

<section class="api-entry" id="socket-on" data-category="lifecycle">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-lifecycle-soft); color:var(--c-lifecycle);">lifecycle</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-lifecycle);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-lifecycle);">socket.on</span><span class="fn-punct">(</span><span class="fn-param">event, handler</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>() =&gt; void</div>
  </div>
  <p class="api-entry-desc">Registers a listener for internal socket lifecycle events. Returns an unsubscribe function.</p>

  <div class="api-subhead">Events</div>
  <table class="api-params">
    <thead><tr><th>Event</th><th>Payload</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td class="pname">connect</td><td class="ptype">—</td><td class="pdesc">Fired when the WebSocket opens successfully.</td></tr>
      <tr><td class="pname">disconnect</td><td class="ptype">CloseEvent</td><td class="pdesc">Fired when the WebSocket closes (cleanly or not).</td></tr>
      <tr><td class="pname">error</td><td class="ptype">Event</td><td class="pdesc">Fired on a WebSocket error.</td></tr>
      <tr><td class="pname">message</td><td class="ptype">any</td><td class="pdesc">Fired for every inbound message after middleware processing.</td></tr>
      <tr><td class="pname">reconnect:attempt</td><td class="ptype">{ attempt, delay }</td><td class="pdesc">Fired before each reconnection attempt.</td></tr>
      <tr><td class="pname">reconnect:exhausted</td><td class="ptype">—</td><td class="pdesc">Fired when all reconnect attempts are used up.</td></tr>
    </tbody>
  </table>
</section>

<section class="api-entry" id="socket-state" data-category="core">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-core-soft); color:var(--c-core);">core</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-core);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-core);">socket.state</span><span class="fn-punct"> — </span><span class="fn-param">Reactive state object</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>Proxy</div>
  </div>
  <p class="api-entry-desc">The reactive state proxy for the connection. All fields are observable by Meld's reactivity system — bind them directly in templates.</p>

  <div class="api-subhead">State Fields</div>
  <table class="api-params">
    <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td class="pname">status</td><td class="ptype">string</td><td class="pdesc"><code>'connecting'</code> | <code>'open'</code> | <code>'closing'</code> | <code>'closed'</code> | <code>'reconnecting'</code></td></tr>
      <tr><td class="pname">latency</td><td class="ptype">number | null</td><td class="pdesc">Round-trip latency of the last heartbeat ping in milliseconds. <code>null</code> if heartbeat is disabled or no ping has completed.</td></tr>
      <tr><td class="pname">error</td><td class="ptype">string | null</td><td class="pdesc">Last error message string, or <code>null</code>.</td></tr>
      <tr><td class="pname">attempts</td><td class="ptype">number</td><td class="pdesc">Current reconnect attempt count. Resets to <code>0</code> on a successful connection.</td></tr>
      <tr><td class="pname">sentCount</td><td class="ptype">number</td><td class="pdesc">Total messages sent during this session.</td></tr>
      <tr><td class="pname">recvCount</td><td class="ptype">number</td><td class="pdesc">Total messages received during this session.</td></tr>
      <tr><td class="pname">presence</td><td class="ptype">object[]</td><td class="pdesc">Live array of peer presence objects (only populated when <code>presence.enabled</code> is <code>true</code>).</td></tr>
    </tbody>
  </table>
</section>

---

## Patterns & Recipes

### Pattern 1 — Status indicator badge

```javascript
defineMeld('ws-status', (el, { useSocket }) => {
  const socket = useSocket({ url: 'wss://api.example.com/ws' });

  return meldHtml`
    <span class="badge" style="background: ${() =>
      socket.status === 'open'         ? '#10b981' :
      socket.status === 'reconnecting' ? '#f59e0b' : '#ef4444'
    }">
      ${() => socket.status}
      ${() => socket.latency ? ` · ${socket.latency}ms` : ''}
    </span>
  `;
});
```

---

### Pattern 2 — Offline-aware message queue

Messages sent while the socket is disconnected are queued automatically and flushed when the connection is restored — no additional code required.

```javascript
const socket = useSocket('wss://...');

// This works even if the socket isn't open yet:
socket.send({ type: 'chat:message', text: 'Will be delivered on connect' });
```

---

### Pattern 3 — Custom serialiser (MessagePack)

```javascript
import { encode, decode } from 'msgpack-lite';

use(MeldSocket, {
  url: 'wss://api.example.com/ws',
  protocols: ['msgpack'],
  serialize:   encode,
  deserialize: decode,
});
```

---

### Pattern 4 — Global socket via provide/inject

Install once at the application root and inject into any child component.

```javascript
// app-root.js
defineMeld('app-root', (el, { useSocket, provide }) => {
  const socket = useSocket('wss://api.example.com/ws');
  provide('socket', socket);
  return meldHtml`<slot></slot>`;
});

// any-child.js
defineMeld('any-child', (el, { inject }) => {
  const socket = inject('socket');
  socket.subscribe('notification', (msg) => { /* … */ });
  return meldHtml`<div>Child</div>`;
});
```

---

### Pattern 5 — Presence (who is online)

```javascript
use(MeldSocket, {
  url: 'wss://chat.example.com/ws',
  presence: { enabled: true },
});

defineMeld('user-list', (el, { useSocket }) => {
  const socket = useSocket();
  return meldHtml`
    <ul>
      ${() => meld.list(
        () => socket.presence,
        u => u.id,
        u => meldHtml`<li>${u.name}</li>`
      )}
    </ul>
  `;
});
```

---

## Devtools

When `debug: true`, all socket events are logged to the browser console under the `[MeldSocket]` namespace.

A diagnostic handle is always attached to `window.__MELD_SOCKET__` in development builds:

```javascript
// Browser console
window.__MELD_SOCKET__.status    // → 'open'
window.__MELD_SOCKET__.latency   // → 42 (ms)
window.__MELD_SOCKET__.queue     // → 0  (queued messages)
window.__MELD_SOCKET__.channels  // → ['chat:message', 'order:update']
window.__MELD_SOCKET__.disconnect() // force close
```

---

## SOCKET_STATUS Constants

```javascript
import { SOCKET_STATUS } from './plugins/meld-socket.js';

SOCKET_STATUS.CONNECTING   // 'connecting'
SOCKET_STATUS.OPEN         // 'open'
SOCKET_STATUS.CLOSING      // 'closing'
SOCKET_STATUS.CLOSED       // 'closed'
SOCKET_STATUS.RECONNECTING // 'reconnecting'
```

---

## API Quick-Reference

| Method / Property | Returns | Description |
|-------------------|---------|-------------|
| `useSocket(opts)` | `SocketHandle` | Create a managed connection |
| `socket.send(payload, opts?)` | `Promise<void>` | Send a message (queues if offline) |
| `socket.subscribe(type, fn)` | `() => void` | Subscribe to a named channel |
| `socket.request(payload, opts?)` | `Promise<object>` | Send and await a correlated reply |
| `socket.on(event, fn)` | `() => void` | Listen for lifecycle events |
| `socket.useInbound(fn)` | `void` | Register inbound middleware |
| `socket.useOutbound(fn)` | `void` | Register outbound middleware |
| `socket.connect()` | `void` | Manually initiate connection |
| `socket.disconnect(code?, reason?)` | `void` | Close the connection |
| `socket.state` | `Proxy` | Reactive state object |
| `socket.status` | `string` | Current connection status |
| `socket.latency` | `number \| null` | Last heartbeat round-trip (ms) |
| `socket.error` | `string \| null` | Last error message |
| `socket.presence` | `object[]` | Live peer presence list |
