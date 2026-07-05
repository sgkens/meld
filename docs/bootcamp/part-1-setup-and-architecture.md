
---
title: Bootcamp Part 2 - Setup & Architecture
nav_order: 4
---

## Bootcamp Part 1: Setup & Architecture

In this tutorial series, we will build **TaskFlow**, a personal project management dashboard featuring boards, drag-and-drop tasks, and dark mode.

**What you will learn:** 
  * Scaffolding with **Meld Artisan**.
  * Managing Global State with **Meld Store**.
  * Creating a Single Page App (SPA) with **Meld Router**.
  * Persisting data to LocalStorage.

-----

### Step 1: Scaffold the Project

First, we use the Artisan CLI to generate our project structure. We'll start with a clean client-side template.

1.  **Open your terminal and run:** 
    ```bash
    npx meld-artisan init task-flow
    ```

2.  **Navigate into the directory:** 
    ```bash
    cd task-flow
    ```

3.  **Start the server** (just to verify it works):

    ```bash
    npx meld-artisan serve
    ```

    *Open `http://localhost:3000`. You should see the "Hello World" screen. Press `Ctrl+C` to stop the server.*

-----

### Step 2: Install the Ecosystem

TaskFlow needs routing and state management. Instead of manually creating files, we use Artisan to pull the official plugins.

Run the following commands:

```bash
# 1. Install the Router (for navigation)
npx meld-artisan install:plugin router

# 2. Install the Store (for global data)
npx meld-artisan install:plugin store

# 3. Install Persistence (to save tasks to LocalStorage)
npx meld-artisan install:plugin persist
```

*Check your `src/plugins/` folder. You will see `meld-router.js`, `meld-store.js`, and `meld-persist.js` ready to go.*

-----

### Step 3: Define the Global Store

We need a central place to store our Tasks and User Preferences.

1.  **Create a new file:** `src/store.js`.
2.  **Add the following code:** 
<!-- end list -->

```javascript
import { meldState, use } from './meld.core.js';
import { MeldPersist } from './plugins/meld-persist.js';

// Activate the persist plugin
use(MeldPersist);

// Define initial state
const initialState = {
  theme: 'light',
  tasks: [
    { id: 1, title: 'Install Meld', status: 'done' },
    { id: 2, title: 'Build TaskFlow', status: 'active' }
  ]
};

// Create and Persist the store
// 'taskflow-data' is the key used in browser LocalStorage
export const store = api.persist(meldState(initialState), 'taskflow-data');

// Actions (Helper functions to modify state)
export const actions = {
  addTask(title) {
    const newTask = { id: Date.now(), title, status: 'active' };
    store.tasks = [...store.tasks, newTask];
  },
  toggleTheme() {
    store.theme = store.theme === 'light' ? 'dark' : 'light';
  }
};
```

-----

### Step 4: Configure the Router

We need two "pages" for our app:

1.  **Dashboard** (Active tasks)

2.  **Archive** (Completed tasks)

3.  **Create the pages:** 
    ```bash
    npx meld-artisan make:component page-dashboard
    npx meld-artisan make:component page-archive
    ```

4.  **Create the Route Configuration:** `src/routes.js`.

<!-- end list -->

```javascript
import { MeldRouter } from './plugins/meld-router.js';

// Import our page components so they register with the browser
import '../components/page-dashboard.js';
import '../components/page-archive.js';

export const routerConfig = {
  routes: [
    { path: '/', component: 'page-dashboard' },
    { path: '/archive', component: 'page-archive' }
  ]
};
```

-----

### Step 5: The App Layout (The Shell)

Now we wire it all together in the main entry point. We will create a layout with a sidebar and a content area.

**Update `components/app-root.js`:** 
```javascript
import { defineMeld, meldHtml, use } from '../src/meld.core.js';
import { MeldRouter } from '../src/plugins/meld-router.js';
import { routerConfig } from '../src/routes.js';
import { store, actions } from '../src/store.js';

// 1. Install Router
use(MeldRouter, routerConfig);

defineMeld('app-root', () => {
  
  // Dynamic CSS classes for Dark Mode
  const layoutClass = () => store.theme === 'dark' ? 'app dark' : 'app';

  return meldHtml`
    <style>
      .app { display: flex; height: 100vh; font-family: sans-serif; }
      .app.dark { background: #222; color: #fff; }
      
      nav { width: 200px; padding: 20px; background: #f4f4f4; border-right: 1px solid #ddd; }
      .dark nav { background: #333; border-color: #444; }
      
      nav a { display: block; padding: 10px; text-decoration: none; color: inherit; }
      nav a:hover { background: rgba(0,0,0,0.05); }
      
      main { flex: 1; padding: 40px; }
    </style>

    <div class="${layoutClass}">
      <nav>
        <h3>TaskFlow</h3>
        <a href="#/"> Dashboard</a>
        <a href="#/archive"> Archive</a>
        <hr/>
        <button onclick="${actions.toggleTheme}">
          Toggle Theme
        </button>
      </nav>

      <main>
        <meld-view></meld-view>
      </main>
    </div>
  `;
});
```

-----

### Step 6: Test Drive

1.  Run `npx meld-artisan serve`.
2.  Go to `http://localhost:3000`.
3.  **Click "Toggle Theme":** The app should switch to dark mode instantly. Refresh the page—it should *stay* dark (Persist works\!).
4.  **Click Links:** The URL changes (`#/archive`), but the page does not reload (Router works\!).

**Congratulations\!** You have a persistent, routed Single Page Application architecture up and running.

**Next: [Part 2 - Building the Kanban Board]** *(Creating `task-card`, `task-list`, and using `meld.list`)*