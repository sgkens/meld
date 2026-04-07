---
title: Core API Reference
nav_order: 3
---

# ⚙️ Core API Reference

The primary functions exported from `meld.core.js`.

---

## **1. Component Definition & State**

### **`defineMeld(tagName, setupFn)`**
Registers a new Custom Element, which forms the isolated boundary of your component.

```javascript
import { defineMeld, meldState, meldHtml } from './meld.core.js';

defineMeld('user-profile', (el, { emit }) => {
  const state = meldState({ username: 'Guest' });

  // Example: Using the emit helper
  const save = () => {
    emit('profile-saved', { user: state.username });
  };
  
  return meldHtml`
    <p>Hello, \${() => state.username}</p>
    <button onclick="\${save}">Save</button>
  `;
});
```

### **`meldState(initialObject)`**
Creates a deep reactive proxy. Changes to properties automatically trigger updates in the UI where the property is accessed.

### **`computed(getterFn)`**
Creates a derived, cached, read-only state. Useful for calculations based on `meldState`.

```javascript
const user = meldState({ first: 'Ada', last: 'Lovelace' });

const fullName = computed(() => {
  // This runs only when user.first or user.last changes
  return user.first + ' ' + user.last;
});

// Usage in template: <h1>\${fullName}</h1>
```

## **2. Rendering & Templating**

### **`meldHtml(strings, ...values)`**
The core template function. It parses HTML strings and establishes reactive bindings.

#### A. Binding Types (The `$` in `\${...}`)
| Type | Example | Result |
| :--- | :--- | :--- |
| **Reactive Text** | `\${() => state.count}` | Updates the specific text node when state.count changes. |
| **Static Text** | `\${someVariable}` | Renders once, does not update later. |
| **Events** | `onclick="\${handleClick}"` | Binds the function directly to the element. |
| **Raw HTML** | `\${meld.raw(content)}` | **Unsafe!** Injects unescaped HTML content. |

#### B. List Reconciliation (`meld.list`)
The keyed list helper that prevents focus loss in forms and optimizes DOM updates.

```javascript
// Example: Todo List
const todos = meldState([{id: 1, text: 'Meld Docs'}]);

// The KEY FUNCTION (item => item.id) is critical for performance and focus.
return meldHtml`
  <ul>
    \${meld.list(
      todos, 
      (item) => item.id,
      (item) => meldHtml`
        <li>
          <input oninput="\${(e) => item.text = e.target.value}" value="\${() => item.text}" />
        </li>
      `
    )}
  </ul>
`;
```

## **3. Styling & Utilities**

### **`meld.theme(cssString)`**
Global Styling Solution. Use this once in your main entry file to load styles (like Tailwind or a global reset) that should be available inside all Shadow DOM components.

```javascript
// In main.js (Entry file)
import { meld } from './meld.core.js';

// CSS is compiled into an Adopted Style Sheet for every component.
meld.theme(`
  :host { font-family: sans-serif; }
  .btn { padding: 10px; border-radius: 5px; }
`);
```

### **`meld.css(object)` & `meld.raw(htmlString)`**
Helpers for conditional styling and injecting content.

```javascript
const state = meldState({ isActive: true, postHTML: '<p>CMS Content</p>' });

return meldHtml`
  <button class="\${meld.css({ 
    'button': true, 
    'active': state.isActive, 
    'error': state.hasError 
  })}">
    Click Me
  </button>
  
  <div class="cms-output">
    \${() => meld.raw(state.postHTML)}
  </div>
`;
```