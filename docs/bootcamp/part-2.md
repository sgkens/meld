---
title: Bootcamp Part 2 - The Kanban Board
nav_order: 4
parent: Bootcamp
excerpt: Part 2 of the Meld.js bootcamp — build Kanban board components using meld.list for efficient list rendering and meld-time for relative timestamps.
tags: [bootcamp, tutorial, kanban, list-rendering, meld-time, components]
category: Bootcamp
---

## Bootcamp Part 2: The Kanban Board

In this part, we will build the visual components for our TaskFlow app. We will learn how to render lists efficiently using `meld.list` and how to format data using the `meld-time` plugin.

**What you will build:** 
1.  A reusable `<task-card>` component.
2.  The Dashboard view (Active tasks).
3.  The Archive view (Completed tasks).

-----

### Step 1: Install the Time Plugin

We want our tasks to show a "Created 5 mins ago" label. Let's grab the official time plugin.

```bash
npx meld-artisan install:plugin time
```

Now, register it in your `components/app-root.js` (or a main entry file):

```javascript
// Add to imports
import { MeldTime } from '../src/plugins/meld-time.js';

// Add to usage
use(MeldTime);
```

-----

### Step 2: The Task Card Component

This component represents a single sticky note on our board. It needs to accept data and emit events when buttons are clicked.

1.  **Create the file:** `components/task-card.js`
2.  **Add the code:** 
<!-- end list -->

```javascript
import { defineMeld, meldHtml } from '../src/meld.core.js';

defineMeld('task-card', (el, { emit }) => {
  // 1. Data Access
  // We expect the parent to pass the 'task' object as a property
  const task = el.task;

  // 2. Actions
  const move = () => emit('move-task', task.id);
  const remove = () => emit('delete-task', task.id);

  return meldHtml`
    <style>
      :host { 
        display: block; background: white; padding: 15px; 
        border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); 
        margin-bottom: 10px; border-left: 4px solid #3498db;
      }
      :host([status="done"]) { border-left-color: #2ecc71; opacity: 0.7; }
      
      h4 { margin: 0 0 5px 0; }
      .meta { font-size: 0.8rem; color: #888; display: flex; justify-content: space-between; }
      
      button { background: none; border: none; cursor: pointer; font-size: 1.2rem; }
      button:hover { color: #e74c3c; }
    </style>

    <h4>${task.title}</h4>
    
    <div class="meta">
      <meld-time date="${new Date().toISOString()}" format="relative"></meld-time>
      
      <div class="actions">
        ${() => task.status === 'active' 
           ? meldHtml`<button onclick="${move}" title="Complete"></button>` 
           : meldHtml`<button onclick="${move}" title="Restore">↩</button>`
        }
        <button onclick="${remove}" title="Delete"></button>
      </div>
    </div>
  `;
});
```

-----

### Step 3: The Dashboard (Active Tasks)

Now we render the list. This is where we use **`meld.list`** to ensure that when we update tasks, the DOM doesn't flicker or lose state.

**Update `components/page-dashboard.js`:** 
```javascript
import { defineMeld, meldHtml, meld } from '../src/meld.core.js';
import { store } from '../src/store.js';
import './task-card.js'; // Import the child component

defineMeld('page-dashboard', () => {
  
  // 1. Computed Filter
  // We filter the global store for active tasks. 
  // Because 'store' is reactive, this function re-runs automatically when data changes.
  const activeTasks = () => store.tasks.filter(t => t.status === 'active');

  // 2. Handlers
  const completeTask = (e) => {
    const id = e.detail;
    const task = store.tasks.find(t => t.id === id);
    if (task) task.status = 'done'; // Reactivity updates the UI immediately
  };

  const deleteTask = (e) => {
    const id = e.detail;
    store.tasks = store.tasks.filter(t => t.id !== id);
  };

  return meldHtml`
    <h1>My Board</h1>
    
    <div class="board">
      ${meld.list(
        activeTasks,           // The Data
        (t) => t.id,           // The Key (Crucial!)
        (t) => meldHtml`       // The Template
          <task-card 
            .task="${t}" 
            onmove-task="${completeTask}" 
            ondelete-task="${deleteTask}"
          ></task-card>
        `
      )}
      
      ${() => activeTasks().length === 0 ? " No active tasks! Go relax." : ""}
    </div>
  `;
});
```

-----

### Step 4: The Archive (Completed Tasks)

This is nearly identical to the dashboard but filters for `'done'`.

**Update `components/page-archive.js`:** 
```javascript
import { defineMeld, meldHtml, meld } from '../src/meld.core.js';
import { store } from '../src/store.js';
import './task-card.js';

defineMeld('page-archive', () => {
  
  const doneTasks = () => store.tasks.filter(t => t.status === 'done');

  const restoreTask = (e) => {
    const task = store.tasks.find(t => t.id === e.detail);
    if (task) task.status = 'active';
  };

  return meldHtml`
    <h1>Archive</h1>
    
    <div class="list">
      ${meld.list(
        doneTasks,
        (t) => t.id,
        (t) => meldHtml`
          <task-card 
            .task="${t}" 
            status="done"
            onmove-task="${restoreTask}"
          ></task-card>
        `
      )}
    </div>
  `;
});
```

-----

### Step 5: Test the Flow

1.  Refresh your browser (`http://localhost:3000`).
2.  You should see the "Build TaskFlow" task on the Dashboard.
3.  Click the **Checkmark ()** on the card.
      * It disappears instantly\! (It moved to 'done').
4.  Click **Archive** in the sidebar.
      * The task is there\!
5.  Click the **Restore (↩)** button.
      * It disappears and moves back to the Dashboard.

**What just happened?** You manipulated Global State (`store.tasks`). Meld detected the change, re-ran the filters in both components, and `meld.list` surgically moved the DOM nodes between views.

**Next: [Part 3 - Forms & Portals]** *(Creating the "Add Task" Modal using `meld-forms` and `meld-portal`)*