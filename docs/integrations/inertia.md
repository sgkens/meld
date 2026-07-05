---
title: Laravel Inertia Adapter
parent: Integrations
nav_order: 4
---

# Laravel Inertia Adapter

**Meld** can function as a client-side adapter for **Inertia.js**, replacing Vue or React. This allows you to build a classic monolith (Laravel controllers, server-side routing) but with a highly reactive, SPA-like frontend experience.

### How it Works
1.  **Laravel** handles routing and data fetching (`web.php`, Controllers).
2.  **Inertia** sends a JSON response with the component name and props.
3.  **Meld** dynamically imports the component file and renders it.

---

## 1. The Adapter Plugin

Since there is no official Meld adapter for Inertia, you must add this plugin to your project.

**File:** `src/plugins/meld-inertia.js`

```javascript
import { createInertiaApp } from '[https://esm.sh/@inertiajs/core@1.0.14](https://esm.sh/@inertiajs/core@1.0.14)';
import { defineMeld, meldHtml, meldState, onMount } from '../meld.core.js';

export const MeldInertia = {
  install(api, options) {
    // 1. Define the Root Container
    defineMeld('inertia-root', (el) => {
      const state = meldState({
        componentTag: null,
        props: {}
      });

      onMount(() => {
        createInertiaApp({
          resolve: name => {
            // Native Dynamic Import (No Build Step needed!)
            // Assumes your pages are stored in /js/Pages/
            return import(`../../js/Pages/${name}.js`);
          },
          setup({ el: rootEl, App, props, plugin }) {
            // Inertia passes the loaded module as 'App'
            // We expect the module to export the TAG NAME of the component
            state.componentTag = App.default; 
            state.props = props;
          },
        });
      });

      return meldHtml`
        <div id="inertia-page">
          ${() => state.componentTag 
            ? (() => {
                const page = document.createElement(state.componentTag);
                // Pass props as attributes (or properties for complex data)
                Object.keys(state.props).forEach(key => {
                  const val = state.props[key];
                  // If string, set attribute. If object, set prop directly.
                  if (typeof val === 'string') page.setAttribute(key, val);
                  else page[key] = val;
                });
                return page;
              })()
            : "Loading..."
          }
        </div>
      `;
    });
  }
};
````

-----

## 2\. Client Setup (`app.js`)

In your main entry file, initialize the plugin.

```javascript
import { use, defineMeld, meldHtml } from './src/meld.core.js';
import { MeldInertia } from './src/plugins/meld-inertia.js';

// Install the adapter
use(MeldInertia);

// Define the App Shell
defineMeld('app-shell', () => {
  return meldHtml`
    <nav>
        <a href="/">Home</a>
        <a href="/users">Users</a>
    </nav>
    <main>
        <inertia-root></inertia-root>
    </main>
  `;
});
```

-----

## 3\. Server Setup (Laravel)

Standard Inertia setup. No special Meld configuration required.

**Controller:** `app/Http/Controllers/UserController.php`

```php
public function show($id)
{
    // Inertia::render(ComponentName, Props)
    return Inertia::render('User/Profile', [
        'user' => User::find($id),
        'canEdit' => true
    ]);
}
```

-----

## 4\. Page Component

Create your page as a standard Meld JS file.

**File:** `public/js/Pages/User/Profile.js`

```javascript
import { defineMeld, meldHtml, meldState } from '../../../src/meld.core.js';

// 1. Define the component
defineMeld('user-profile-page', (el) => {
  // Access props passed from Laravel
  // Note: Complex objects (like 'user') are attached as properties, not attributes
  const user = el.user; 
  const canEdit = el.canEdit;

  return meldHtml`
    <h1>User Profile</h1>
    <div class="card">
      <h2>${user.name}</h2>
      <p>Email: ${user.email}</p>
      
      ${() => canEdit 
        ? meldHtml`<button>Edit Profile</button>` 
        : ''
      }
    </div>
  `;
});

// 2. IMPORTANT: Export the tag name as default
// This tells the Adapter which tag to render for this file
export default 'user-profile-page';
```

-----

## Pros & Cons

| Feature     | Pros                                                                | Cons                                                                                 |
| :---------- | :------------------------------------------------------------------ | :----------------------------------------------------------------------------------- |
| **Routing**| **Laravel-Driven:** Use `web.php` routes. No duplicate logic in JS. |  **Latency:** Every navigation requires a server roundtrip to fetch the JSON payload. |
| **Data**|  **Simple:** Pass Eloquent models directly to the view.              | **Type Safety:** You lose some type inference compared to `meld-query` + TypeScript. |
| **Auth**|  **Robust:** Uses standard Laravel Session/Cookies.                  |  **Coupling:** Frontend is tightly bound to the Laravel backend structure.            |

### When to use this?

Use this stack if you are a **Laravel Developer** who loves Blade/Inertia simplicity but wants to avoid the complexity of compiling `.vue` or `.jsx` files.