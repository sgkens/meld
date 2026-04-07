---
title: The Plugin Ecosystem
nav_order: 4
---

# 🧩 Plugins & Extensions

Meld's core is tiny. Plugins add features like routing, global state, and persistence.

## 1. Meld Router (`meld-router`)
Enables client-side SPA routing using URL hashes.

### Example
```javascript
import { MeldRouter } from './plugins/meld-router.js';
// Define your components (home-page, about-page) before this block
use(MeldRouter, {
  routes: [
    { path: '/', component: 'home-page' },
    { path: '/settings', component: 'settings-page' }
  ]
});

// Template usage:
// <a href="#/settings">Go to Settings</a>
// <meld-view></meld-view>
```

## 2. Meld Query (`meld-query`)
Reactive wrapper for asynchronous data fetching. Solves the boilerplate of managing loading and error states.

### Example
```javascript
import { MeldQuery } from './plugins/meld-query.js';
use(MeldQuery);

defineMeld('fetch-data', (el, { useQuery }) => {
  // Triggers fetch immediately upon component mount
  const user = useQuery('https://jsonplaceholder.typicode.com/users/1');

  return meldHtml`
    <div style="min-height: 50px;">
      \${() => user.loading 
        ? '⏳ Fetching user data...' 
        : user.error 
          ? '❌ Error: Could not load user.'
          : meldHtml`
              <p>User: \${user.data.name} (\${user.data.email})</p>
            `
      }
    </div>
  `;
});
```

## 3. Meld Portal (`meld-portal`)
Teleports content (e.g., modals, tooltips) from inside the Shadow DOM to the main `document.body` to avoid z-index/clipping issues.

### Example
```javascript
// Must be defined globally:
import { MeldPortal } from './plugins/meld-portal.js';
use(MeldPortal);

defineMeld('app-modal', () => {
  const state = meldState({ isOpen: false });

  return meldHtml`
    <button onclick="\${() => state.isOpen = true}">Open Modal</button>

    \${() => state.isOpen ? meldHtml`
      <meld-portal>
        <div class="modal-backdrop">
          <div class="modal-content">
            <h3>Hello from the outside!</h3>
            <button onclick="\${() => state.isOpen = false}">Close Portal</button>
          </div>
        </div>
      </meld-portal>
    ` : ''}
  `;
});
```

## 4. Meld A11y (`meld-a11y`)
Adds crucial utilities for accessibility compliance.

### Example
```javascript
import { MeldA11y } from './plugins/meld-a11y.js';
use(MeldA11y);

defineMeld('a11y-demo', (el, { announce, trapFocus }) => {
  const status = meldState({ message: 'Ready' });

  const notify = () => {
    status.message = \`Notification at \${Date.now().toString().slice(-4)}\`;
    announce("Status updated!"); // Announce to screen readers
  };

  return meldHtml`
    <button onclick="\${notify}">Change Status</button>

    <div ref="\${trapFocus}" style="border: 1px solid red; padding: 10px;">
      <input /> <button>Trap</button>
    </div>
  `;
});
```