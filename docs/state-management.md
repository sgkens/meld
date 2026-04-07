---
title: State Management
nav_order: 10
---

# 🧠 State Management in Meld

Meld uses a "Reactivity First" approach. You don't need a heavy external library; everything is built on standard JavaScript Proxies.

## 1. Local State (`meldState`)

Each component usually manages its own local state.

```javascript
defineMeld('my-counter', () => {
  const state = meldState({ count: 0 });
  return meldHtml`<button onclick="\${() => state.count++}">\${() => state.count}</button>`;
});
```

## 2. Shared Global State (`meld-store`)

For app-wide data (like User sessions), use the `meld-store` plugin.

### Setup
```javascript
// store.js
import { meldState } from './src/meld.core.js';
export const store = meldState({ user: null, theme: 'light' });

// app.js
import { store } from './store.js';
defineMeld('user-profile', () => {
  return meldHtml`<div>User: \${() => store.user?.name}</div>`;
});
```

## 3. Persistent State (`meld-persist`)

Automatically sync your state to LocalStorage.

```javascript
import { MeldPersist } from './src/plugins/meld-persist.js';
use(MeldPersist);

defineMeld('settings', (el, { persist }) => {
  const settings = persist(meldState({ darkMode: false }), 'my-settings');
  // ...
});
```

## 4. Cross-Tab Sync (`meld-broadcast`)

Keep state in sync across multiple browser tabs using the `meld-broadcast` plugin.

```javascript
import { MeldBroadcast } from './src/plugins/meld-broadcast.js';
use(MeldBroadcast);

// Inside setup:
useBroadcast('my-app', store, ['user', 'theme']);
```
