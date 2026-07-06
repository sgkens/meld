---
title: Data & Networking
parent: Plugin Ecosystem
nav_order: 2
excerpt: Plugins for API interaction and data persistence, including meld-query for reactive fetch and meld-local for localStorage management.
tags: [plugins, data, networking, fetch, api, local-storage, reactive]
category: Plugin Ecosystem
---

# Data & Networking Plugins

Tools for API interaction, data persistence, and storage management.

## 1. Meld Query (`meld-query`)

**Purpose:** A reactive wrapper for `fetch` that handles loading/error states automatically.

### API Reference

<section class="api-entry" id="useQuery" data-category="data">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-core-soft); color:var(--c-core);">data</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-core);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-core);">useQuery</span><span class="fn-punct">(</span><span class="fn-param">urlOrUrlFn</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">-></span>{ data, loading, error, refetch }</div>
  </div>
  <p class="api-entry-desc">A reactive fetch wrapper that resolves data asynchronously and manages loading and error states automatically. If the argument is a function that returns a URL, it will re-fetch automatically when any reactive dependencies accessed by the function change.</p>
  <div class="api-subhead">Parameters</div>
  <table class="api-params"><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>
    <tr><td class="pname">urlOrUrlFn</td><td class="ptype">string | Function</td><td class="pdesc">The target URL string, or a reactive getter function returning the URL.</td></tr>
  </tbody></table>
</section>

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
```

---

## 2. Meld Persist (`meld-persist`)

**Purpose:** Automatically saves state to `localStorage` (or `sessionStorage`).

### API Reference

<section class="api-entry" id="persist" data-category="data">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-core-soft); color:var(--c-core);">data</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-core);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-core);">persist</span><span class="fn-punct">(</span><span class="fn-param">stateProxy, storageKey, storageEngine?</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">-></span>Proxy</div>
  </div>
  <p class="api-entry-desc">Configures automatic state persistence. Any changes made to the reactive state proxy are automatically serialised and stored in the specified storage engine.</p>
  <div class="api-subhead">Parameters</div>
  <table class="api-params"><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>
    <tr><td class="pname">stateProxy</td><td class="ptype">Proxy</td><td class="pdesc">A reactive state proxy created via <code>meldState()</code>.</td></tr>
    <tr><td class="pname">storageKey</td><td class="ptype">string</td><td class="pdesc">The unique key to store state under.</td></tr>
    <tr><td class="pname">storageEngine</td><td class="ptype">Storage</td><td class="pdesc">Optional. Browser storage interface (defaults to <code>localStorage</code>).</td></tr>
  </tbody></table>
</section>

### Example

```javascript
// This state persists even if the user refreshes the browser
const preferences = persist(
  meldState({ volume: 50, darkMode: true }), 
  'user-prefs'
);
```

---

## 3. Meld Quiver (`meld-quiver`)

**Purpose:** Integration with the Quiver API client (or Axios) via dependency injection.

### Usage

**Setup (main.js):** 

```javascript
use(MeldQuiver, { baseURL: 'https://api.example.com' });
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

---

## 4. Meld Socket (`meld-socket`)

**Purpose:** Managed WebSocket connections with reactive status, reconnects, heartbeat, queued sends, message channels, and request-response correlation.

### API Reference

<section class="api-entry" id="useSocket-data" data-category="data">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-core-soft); color:var(--c-core);">data</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-core);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-core);">useSocket</span><span class="fn-punct">(</span><span class="fn-param">url | options</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">-></span>SocketHandle</div>
  </div>
  <p class="api-entry-desc">Managed WebSocket helper. See the full <a href="/plugins/meld-socket/">meld-socket API Reference</a> for complete details.</p>
</section>

### Example

```javascript
use(MeldSocket, { reconnect: true });

defineMeld('live-feed', (el, { useSocket }) => {
  const socket = useSocket('wss://api.example.com/ws');
  const state = meldState({ messages: [] });

  socket.subscribe('chat:message', (msg) => {
    state.messages = [...state.messages, msg.data];
  });
});
```
