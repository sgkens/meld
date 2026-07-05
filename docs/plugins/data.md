---
title: Data & Networking
parent: Plugin Ecosystem
nav_order: 2
---

# Data & Networking Plugins

Tools for API interaction, data persistence, and storage management.

## 1. Meld Query (`meld-query`)
**Purpose:** A reactive wrapper for `fetch` that handles loading/error states automatically.

### API Reference
* `useQuery(url | function)`: Returns `{ data, loading, error, refetch }`.

### Example
```javascript
defineMeld('user-list', (el, { useQuery }) => {
  // If the URL is a function, it re-fetches when dependencies change
  const query = useQuery(() => `/api/users?page=${state.page}`);

  return meldHtml`
    ${() => query.loading ? 'Loading...' : ''}
    ${() => query.error ? meldHtml`<div class="error">${query.error}</div>` : ''}
    
    <ul>
      ${meld.list(query.data || [], item => item.id, item => meldHtml`<li>${item.name}</li>`)}
    </ul>
  `;
});
````

-----

## 2\. Meld Persist (`meld-persist`)

**Purpose:** Automatically saves state to `localStorage` (or `sessionStorage`).

### API Reference

  * `persist(stateProxy, storageKey, [storageEngine])`

### Example

```javascript
// This state persists even if the user refreshes the browser
const preferences = persist(
  meldState({ volume: 50, darkMode: true }), 
  'user-prefs'
);
```

-----

## 3\. Meld Quiver (`meld-quiver`)

**Purpose:** Integration with the Quiver API client (or Axios) via dependency injection.

### Usage

**Setup (main.js):** 
```javascript
use(MeldQuiver, { baseURL: '[https://api.example.com](https://api.example.com)' });
```

**Component:** 
```javascript
defineMeld('dashboard-widget', (el, { useQuiver }) => {
  const api = useQuiver(); // Get the configured client instance
  
  const load = async () => {
    const data = await api.get('/stats');
    state.stats = data;
  };
});
```

-----

## 4\. Meld Socket (`meld-socket`)

**Purpose:** Managed WebSocket connections with reactive status, reconnects, heartbeat, queued sends, message channels, and request-response correlation.

### API Reference

  * `useSocket(url | options)`: Returns a socket handle with `{ state, send, subscribe, request, connect, disconnect, on }`.

### Example

```javascript
use(MeldSocket, { reconnect: true });

defineMeld('live-feed', (el, { useSocket }) => {
  const socket = useSocket('wss://api.example.com/ws');
  const state = meldState({ messages: [] });

  socket.subscribe('chat:message', (msg) => {
    state.messages = [...state.messages, msg];
  });

  const sendMessage = () => socket.send({
    type: 'chat:message',
    text: 'Hello'
  });
});
```

-----

## 5\. Meld Cookie (`meld-cookie`)

**Purpose:** Simple utility to read/write browser cookies.

### API Reference

  * `cookie.get(name)`: Returns string value.
  * `cookie.set(name, value, days)`: Sets a cookie.
  * `cookie.remove(name)`: Deletes a cookie.

### Example

```javascript
const token = cookie.get('auth_token');
if (!token) window.location.hash = '/login';
```
