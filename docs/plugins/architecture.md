---
title: Architecture & State
parent: Plugin Ecosystem
nav_order: 1
excerpt: Plugins for structuring SPAs and managing global application state, including meld-router and meld-store.
tags: [plugins, architecture, state-management, router, store, spa]
category: Plugin Ecosystem
---

# Architecture & State Plugins

Tools for structuring Single Page Applications (SPAs) and managing global application flow.

## 1. Meld Router (`meld-router`)
**Purpose:** Client-side hash routing. Maps URLs to components.

### Usage
```javascript
import { MeldRouter } from '../src/plugins/meld-router.js';

use(MeldRouter, {
  routes: [
    { path: '/', component: 'home-page' },
    { path: '/users/:id', component: 'user-detail' } // Supports params in v1.3+
  ]
});
````

### Components

  * **`<meld-view>`**: The placeholder where the active route component is rendered.

### Accessing Route Data

```javascript
defineMeld('user-detail', (el, { inject }) => {
  const router = inject('router');
  // Access current path or params
  return meldHtml`<h1>User ID: ${router.params.id}</h1>`;
});
```

-----

## 2\. Meld Store (`meld-store`)

**Purpose:** Global, singleton state management (Redux-lite).

### Usage

Create a store file (`store.js`):

```javascript
import { meldState } from '../src/meld.core.js';

export const store = meldState({
  user: null,
  theme: 'light'
});

export const actions = {
  login(user) { store.user = user; },
  logout() { store.user = null; }
};
```

**In Components:** 
```javascript
import { store, actions } from '../store.js';

return meldHtml`
  <p>User: ${() => store.user ? store.user.name : 'Guest'}</p>
  <button onclick="${actions.logout}">Logout</button>
`;
```

-----

## 3\. Meld Microbus (`meld-microbus`)

**Purpose:** A global Event Bus for decoupled communication between components that do not share a parent-child relationship.

### API Reference

  * `Microbus.subscribe(topic, callback)`: Returns an unsubscribe function.
  * `Microbus.publish(topic, payload)`: Sends data to all subscribers.

### Example

**Sidebar.js (Publisher)** 
```javascript
const { Microbus } = api;
const collapse = () => Microbus.publish('sidebar-toggle', { open: false });
```

**Header.js (Subscriber)** 
```javascript
onMount(() => {
  const unsub = Microbus.subscribe('sidebar-toggle', (data) => {
    console.log('Sidebar is now:', data.open);
  });
  onDestroy(unsub); // Always cleanup!
});
```

-----

## 4\. Meld Head (`meld-head`)

**Purpose:** Manages `<title>` and `<meta>` tags dynamically for SEO.

### API Reference

  * `useHead(factoryFn)`: Accepts a function returning `{ title: string, meta: [] }`.

### Example

```javascript
defineMeld('blog-post', (el, { useHead }) => {
  useHead(() => ({
    title: `My Blog - ${state.postTitle}`,
    meta: [
      { name: 'description', content: state.excerpt },
      { property: 'og:title', content: state.postTitle }
    ]
  }));
});
```