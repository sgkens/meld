---
title: HTMX + Meld Integration
nav_order: 5
parent: Stacks
excerpt: Combine HTMX for server-driven HTML navigation with Meld.js for reactive client-side state. Covers hx-boost with Meld, wiring HTMX events to Meld components, and re-registration after partial page swaps.
tags: [htmx, custom-elements, server-driven, reactive, integration, stack]
category: Stacks
---

# HTMX + Meld Integration

HTMX and Meld.js operate at different layers of the stack and complement each other without conflict. HTMX handles server-driven navigation and partial page replacement by issuing HTTP requests and swapping server-rendered HTML into the DOM. Meld handles reactive client-side state within individual components. Used together, the server controls routing and data, while Meld components manage the interactive behaviour of individual UI elements within those server-rendered pages.

---

## How They Differ

| Concern                  | HTMX                             | Meld.js                           |
| :----------------------- | :------------------------------- | :-------------------------------- |
| Rendering model          | Server renders HTML fragments    | Client renders reactive DOM       |
| Navigation               | `hx-get`, `hx-push-url`          | `meld-router` plugin              |
| State location           | Server session / database        | Client signals inside components  |
| Data binding             | None (static HTML)               | Fine-grained reactive signals     |
| Component definition     | None                             | `defineMeld()` + Custom Elements  |

---

## 1. Basic Setup

Include HTMX via script tag and load Meld components as ES modules. Both can coexist in the same HTML page.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>HTMX + Meld App</title>

  <!-- HTMX: handles server-driven requests and DOM swaps -->
  <script src="https://unpkg.com/htmx.org@1.9.12" defer></script>
</head>
<body>
  <nav>
    <!-- HTMX drives navigation; Meld components inside #main are hydrated after swap -->
    <a href="/dashboard" hx-get="/dashboard" hx-target="#main" hx-push-url="true">Dashboard</a>
    <a href="/settings" hx-get="/settings" hx-target="#main" hx-push-url="true">Settings</a>
  </nav>

  <main id="main">
    <!-- Server renders initial page content here -->
    <!-- Meld custom elements can live inside this swap target -->
    <meld-stat-panel />
  </main>

  <script type="module">
    import './meld/meld-stat-panel.js';
  </script>
</body>
</html>
```

---

## 2. hx-boost with Meld

`hx-boost="true"` converts anchor links and forms to HTMX requests, replacing the `<body>` with the server response body. Meld components in the new body must be re-registered or re-imported if they are not already in the browser's `CustomElementRegistry`.

Because `customElements.define()` persists for the lifetime of the page session, Meld components registered on the first load remain registered through all `hx-boost` navigations. The component definitions do not need to be re-imported.

```html
<body hx-boost="true">
  <nav>
    <a href="/reports">Reports</a>
    <a href="/users">Users</a>
  </nav>

  <main>
    <!-- After hx-boost swap, new Meld elements in <main> are already registered
         and will self-hydrate when the browser parses the swapped HTML. -->
    <meld-data-table />
  </main>

  <script type="module">
    // Imported once on first page load; registration persists across hx-boost swaps.
    import './meld/meld-data-table.js';
  </script>
</body>
```

> **Caveat:** If HTMX swaps an entire `<html>` document (full-page swap), the JS runtime is reset and Meld definitions must be re-executed. Avoid full-document swaps when using Meld. Target `<main>` or a specific container instead.

---

## 3. Re-hydrating Meld Components After HTMX Swaps

When HTMX swaps server-rendered HTML into the DOM, any Meld custom elements in the new fragment are already registered (from the initial page load). The browser will call the element's `connectedCallback` automatically when HTMX appends the element to the live DOM.

If a Meld component requires data from the server response (e.g., passed via an attribute), that attribute is present in the HTMX-swapped HTML:

```html
<!-- Server renders this HTML fragment in response to an HTMX request -->
<section id="report-section">
  <h2>Q3 Report</h2>
  <!-- Attribute value is rendered server-side -->
  <meld-bar-chart
    title="Q3 Revenue"
    currency="USD"
    data-endpoint="/api/report/q3"
  />
</section>
```

The Meld component reads `data-endpoint` after mount and fetches its own data:

```javascript
// meld/meld-bar-chart.js
import { defineMeld, meldHtml } from 'meldjs';

defineMeld('meld-bar-chart', (el, { signal, effect }) => {
  const chartData = signal(null);
  const loading = signal(true);

  effect(async () => {
    const endpoint = el.dataset.endpoint;
    if (!endpoint) return;

    loading.set(true);
    const res = await fetch(endpoint);
    const json = await res.json();
    chartData.set(json);
    loading.set(false);
  });

  return meldHtml`
    <div class="chart-wrapper">
      <h3>${el.getAttribute('title')}</h3>
      ${() => loading.get() ? '<p>Loading...</p>' : renderChart(chartData.get())}
    </div>
  `;
});
```

---

## 4. Wiring HTMX Events to Meld Components

HTMX emits lifecycle events on the DOM (`htmx:afterSwap`, `htmx:beforeRequest`, `htmx:responseError`, etc.). Meld components can listen to these events to react to navigation and swap state.

```javascript
// meld/meld-loading-indicator.js
import { defineMeld, meldHtml } from 'meldjs';

defineMeld('meld-loading-indicator', (el, { signal }) => {
  const active = signal(false);

  // Listen for HTMX request lifecycle events on the document
  const onRequest = () => active.set(true);
  const onSettle  = () => active.set(false);

  document.addEventListener('htmx:beforeRequest', onRequest);
  document.addEventListener('htmx:afterSettle',   onSettle);

  // Cleanup when the element is removed from the DOM
  el.addEventListener('disconnected', () => {
    document.removeEventListener('htmx:beforeRequest', onRequest);
    document.removeEventListener('htmx:afterSettle',   onSettle);
  });

  return meldHtml`
    <div class="indicator ${() => active.get() ? 'indicator--active' : ''}">
      Loading
    </div>
  `;
});
```

Place the indicator in the page layout, outside the HTMX swap target:

```html
<body>
  <meld-loading-indicator />  <!-- Outside #main; not replaced by swaps -->
  <main id="main" hx-boost="true">
    <!-- Server-rendered content -->
  </main>
</body>
```

---

## 5. Triggering HTMX Requests from Meld Components

Meld components can trigger HTMX requests programmatically by dispatching the `htmx:trigger` event or by calling `htmx.ajax()` directly.

```javascript
// meld/meld-filter-bar.js
import { defineMeld, meldHtml } from 'meldjs';

defineMeld('meld-filter-bar', (el, { signal }) => {
  const activeFilter = signal('all');

  function applyFilter(filter) {
    activeFilter.set(filter);

    // Use htmx.ajax() to trigger a server request from inside a Meld component
    // htmx is available globally when loaded via <script> tag
    if (typeof htmx !== 'undefined') {
      htmx.ajax('GET', `/api/items?filter=${filter}`, {
        target: '#item-list',
        swap: 'innerHTML',
      });
    }
  }

  return meldHtml`
    <div class="filter-bar">
      <button onclick=${() => applyFilter('all')}>All</button>
      <button onclick=${() => applyFilter('active')}>Active</button>
      <button onclick=${() => applyFilter('archived')}>Archived</button>
      <span>Current: ${activeFilter}</span>
    </div>
  `;
});
```

The HTMX response replaces `#item-list` with server-rendered HTML. Meld manages the filter state client-side; HTMX manages the data fetch and DOM swap.

---

## 6. Shared State Between HTMX Navigation and Meld

State that must persist across HTMX page swaps (since the swap replaces DOM nodes) should be stored outside of Meld component instances. Use a module-level singleton:

```javascript
// src/state/session.js
// Module singleton: persists for the lifetime of the JS session,
// surviving HTMX DOM swaps.
export const session = {
  user: null,
  theme: 'light',
  set(key, value) { this[key] = value; },
  get(key) { return this[key]; },
};
```

Meld components import and read from this singleton:

```javascript
import { session } from '../state/session.js';
import { defineMeld, meldHtml } from 'meldjs';

defineMeld('meld-user-avatar', (el) => {
  return meldHtml`
    <div class="avatar">
      ${session.user?.username ?? 'Guest'}
    </div>
  `;
});
```

---

## 7. Project Structure Reference

```text
/my-htmx-meld-app
├── server.js                   # Express / Fastify / any HTTP server
├── views/                      # Server-rendered HTML templates (Nunjucks, EJS, etc.)
│   ├── layout.html             # Contains Meld <script> imports and hx-boost
│   ├── dashboard.html          # HTMX partial fragment
│   └── reports.html            # HTMX partial fragment
├── public/
│   └── meld/                   # Meld component definitions (served as static files)
│       ├── meld-stat-panel.js
│       ├── meld-data-table.js
│       ├── meld-filter-bar.js
│       └── meld-loading-indicator.js
└── package.json
```

---

## Event Reference

| HTMX Event              | Fired when                                    | Meld use case                          |
| :---------------------- | :-------------------------------------------- | :------------------------------------- |
| `htmx:beforeRequest`    | Just before HTMX issues an HTTP request       | Show loading state in Meld component   |
| `htmx:afterSwap`        | After new HTML is swapped into the DOM        | Re-initialise Meld-driven data fetches |
| `htmx:afterSettle`      | After swap and any transitions complete       | Hide loading state                     |
| `htmx:responseError`    | When the server returns a non-2xx status      | Show error state in Meld component     |
| `htmx:historyRestore`   | When user navigates via browser back/forward  | Restore Meld component state           |
