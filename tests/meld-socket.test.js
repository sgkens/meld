import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { use, meldState } from '../src/meld.core.js';
import { MeldSocket } from '../src/plugins/meld-socket.js';

const tick = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

// Mock global WebSocket
class MockWebSocket {
  constructor(url, protocols) {
    this.url = url;
    this.protocols = protocols;
    this.readyState = 0; // CONNECTING
    this.sentData = [];
    MockWebSocket.lastInstance = this;

    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen();
    }, 10);
  }

  send(data) {
    this.sentData.push(data);
  }

  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose({ code: 1000, reason: 'Normal' });
  }
}

MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

describe('MeldSocket Plugin', () => {
  beforeEach(() => {
    global.WebSocket = MockWebSocket;
    MockWebSocket.lastInstance = null;
  });

  it('installs the useSocket helper on component API', () => {
    const api = { meldState, onDestroy: () => {} };
    MeldSocket.install(api);
    expect(api.useSocket).toBeDefined();
  });

  it('connects, updates status reactive state, and disconnects', async () => {
    const api = { meldState, onDestroy: () => {} };
    MeldSocket.install(api);

    const socket = api.useSocket({ url: 'ws://localhost:1234' });
    expect(socket.status).toBe('connecting');

    await tick(20);
    expect(socket.status).toBe('open');

    socket.disconnect();
    await tick(20);
    expect(socket.status).toBe('closed');
  });

  it('sends data and supports channel subscriptions', async () => {
    const api = { meldState, onDestroy: () => {} };
    MeldSocket.install(api);

    const socket = api.useSocket({ url: 'ws://localhost:1234' });
    await tick(20);

    // Test send
    await socket.send({ type: 'chat', data: { text: 'hello' } });
    const instance = MockWebSocket.lastInstance;
    expect(instance.sentData.length).toBe(1);
    expect(JSON.parse(instance.sentData[0])).toEqual({
      type: 'chat',
      data: { text: 'hello' }
    });

    // Test subscribe
    let received = null;
    socket.subscribe('chat', (data) => {
      received = data;
    });

    // Simulate inbound message
    instance.onmessage({
      data: JSON.stringify({
        type: 'chat',
        data: { text: 'reply' }
      })
    });

    await tick(20);

    expect(received).toEqual({ type: 'chat', data: { text: 'reply' } });
  });
});
