---
title: Bootcamp Part 3 - Forms and Portals
nav_order: 5
---

## Bootcamp Part 3: Forms & Portals

In this section, we will create the "Add Task" experience. We'll use the `meld-portal` plugin to render a modal overlay on top of our application, and `meld-forms` to handle input validation.

**What you will build:** 
1.  A reusable `<modal-dialog>` component.
2.  A `<task-form>` component with validation.
3.  The wiring to open/close the modal from the Dashboard.

-----

### Step 1: Install Dependencies

We need the Portal plugin (to break out of the Shadow DOM) and the Forms plugin (for state).

```bash
npx meld-artisan install:plugin portal
npx meld-artisan install:plugin forms
```

Update your `components/app-root.js` imports to include them:

```javascript
import { MeldPortal } from '../src/plugins/meld-portal.js';
import { MeldForms } from '../src/plugins/meld-forms.js';

// Install plugins
use(MeldPortal);
use(MeldForms);
```

-----

### Step 2: The Generic Modal Component

We want a reusable modal wrapper that handles the dark background overlay and centering.

1.   **Create:** `components/ui-modal.js`
2.  **Add Code:** 
<!-- end list -->

```javascript
import { defineMeld, meldHtml } from '../src/meld.core.js';

defineMeld('ui-modal', (el, { emit }) => {
  const close = () => emit('close');

  return meldHtml`
    <style>
      .overlay {
        position: fixed; inset: 0; 
        background: rgba(0,0,0,0.6); 
        display: grid; place-items: center; 
        z-index: 999;
      }
      .card {
        background: white; padding: 2rem; 
        border-radius: 8px; min-width: 300px; 
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      }
    </style>

    <meld-portal>
      <div class="overlay" onclick="${close}">
        <div class="card" onclick="${(e) => e.stopPropagation()}">
          <slot></slot> </div>
      </div>
    </meld-portal>
  `;
});
```

-----

### Step 3: The Task Form

Now we build the form logic using the `useForm` hook.

1.   **Create:** `components/task-form.js`
2.  **Add Code:** 
<!-- end list -->

```javascript
import { defineMeld, meldHtml } from '../src/meld.core.js';
import { actions } from '../src/store.js';

defineMeld('task-form', (el, { useForm, emit }) => {
  
  // 1. Initialize Form Hook
  const { fields, errors, handleSubmit } = useForm(
    { title: '' },               // Initial State
    { title: ['required'] }      // Validation Rules
  );

  // 2. Submit Logic
  const save = (data) => {
    actions.addTask(data.title); // Save to Global Store
    emit('success');             // Tell parent to close modal
  };

  return meldHtml`
    <style>
      input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; }
      .error { color: red; font-size: 0.8rem; }
      button { width: 100%; padding: 10px; background: #27ae60; color: white; border: none; cursor: pointer; }
    </style>

    <h3>New Task</h3>
    
    <form onsubmit="${handleSubmit(save)}">
      <input 
        value="${() => fields.title}" 
        oninput="${(e) => fields.title = e.target.value}" 
        placeholder="What needs doing?"
        autofocus
      />
      
      <div class="error">${() => errors.title || ''}</div>
      
      <button>Create Task</button>
    </form>
  `;
});
```

-----

### Step 4: Connecting it to the Dashboard

Finally, we update the dashboard to include a "New Task" button that opens our modal.

**Update `components/page-dashboard.js`:** 
```javascript
import { defineMeld, meldHtml, meldState, meld } from '../src/meld.core.js'; // Added meldState
import { store } from '../src/store.js';
import './task-card.js';
import './ui-modal.js';   // Import Modal
import './task-form.js';  // Import Form

defineMeld('page-dashboard', () => {
  // Local UI state for the modal visibility
  const ui = meldState({ showModal: false });
  
  const activeTasks = () => store.tasks.filter(t => t.status === 'active');

  // ... (previous handlers: completeTask, deleteTask) ...

  return meldHtml`
    <div style="display:flex; justify-content:space-between; align-items:center">
      <h1>My Board</h1>
      <button onclick="${() => ui.showModal = true}">+ New Task</button>
    </div>
    
    <div class="board">
      ${meld.list(/* ... */)}
    </div>

    ${() => ui.showModal 
      ? meldHtml`
          <ui-modal onclose="${() => ui.showModal = false}">
            <task-form onsuccess="${() => ui.showModal = false}"></task-form>
          </ui-modal>
        ` 
      : ''
    }
  `;
});
```

-----

### Step 5: Final Polish (CSS)

Add this to your `components/app-root.js` theme block or the dashboard styles to make the "New Task" button look good.

```css
button { padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; }
button:hover { background: #2980b9; }
```

### You Built TaskFlow\!

Run your app one last time: `npx meld-artisan serve`.

You have successfully built a full application featuring:

1.   **Architecture:** A robust Store/Router structure.
2.   **Performance:** Efficient List Rendering.
3.  **Advanced UI:** Portals and Modals.
4.  **Data Integrity:** Form Validation and Persistence.
