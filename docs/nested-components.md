---
title: Component Nesting & Communication
nav_order: 7
---

# Component Nesting & Communication

Components are designed to be freely nested using their custom element tags, creating complex UIs.

## 1. Simple Composition

To nest components, simply use the child component's tag inside the parent's `meldHtml` template.

```javascript
// --- CHILD: button-component.js ---
defineMeld('child-button', () => {
  return meldHtml`<button>Click Me</button>`;
});

// --- PARENT: app-layout.js ---
defineMeld('app-layout', () => {
  return meldHtml`
    <header>Site Header</header>
    <child-button></child-button>
  `;
});
```

## 2. Parent-to-Child Communication (Props)

Meld uses native HTML attributes to pass simple data (strings/numbers) down. Complex reactive data should be passed via the Context API (provide/inject).

```javascript
// PARENT passes attribute
defineMeld('user-list', () => {
  return meldHtml`<user-card username="Alice"></user-card>`;
});

// CHILD receives attribute in setup function
defineMeld('user-card', (el) => {
  // Read initial attribute value from the element
  const username = el.getAttribute('username') || 'Guest';

  return meldHtml`
    <div class="card">Name: ${username}</div>
  `;
});
```

## 3. Child-to-Parent Communication (Events)

Meld provides the emit helper for child components to send data outward. Parent components listen using standard on* attributes.

```javascript
// --- CHILD sends data (user-button.js) ---
defineMeld('user-button', (el, { emit }) => {
  const sendData = () => {
    // Emits a custom event that bubbles up the DOM tree
    emit('button-click', { status: 'confirmed', time: Date.now() });
  };

  return meldHtml`<button onclick="${sendData}">Confirm</button>`;
});

// --- PARENT listens (app-layout.js) ---
defineMeld('app-layout', () => {
  const state = meldState({ lastAction: 'None' });
  
  const handleEvent = (e) => {
    // The event listener receives the standard browser Event object
    state.lastAction = `Received: ${e.detail.status}`;
  };

  return meldHtml`
    <user-button onbutton-click="${handleEvent}"></user-button>
    <p>Last Activity: ${() => state.lastAction}</p>
  `;
});
```