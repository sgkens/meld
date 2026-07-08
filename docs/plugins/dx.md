---
title: DX & Quality
parent: Plugin Ecosystem
nav_order: 5
excerpt: Developer experience and quality assurance plugins including meld-devtools for visual debugging, meld-logger, and meld-a11y for accessibility checks.
tags: [plugins, dx, developer-experience, devtools, logging, accessibility, testing]
category: Plugin Ecosystem
---

# DX & Quality Assurance

Tools to ensure your code is robust, accessible, and debuggable.

## 1. Meld Devtools (`meld-devtools`)
**Purpose:** Visual debugging aid.
* **Behavior:** When enabled, components will briefly flash (visual border) in the browser whenever they re-render. This helps identify unnecessary updates.
* **Usage:** Automatically enabled when running via `npx meld-artisan serve`.

---

## 2. Meld Logger (`meld-logger`)
**Purpose:** Structured logging with namespaces.

### Usage
```javascript
defineMeld('auth-service', (el, { useLog }) => {
  const log = useLog('AuthService');
  
  log.info('Initializing...');
  log.error('Connection failed', { retries: 3 });
});
````

-----

## 3\. Meld Test Utils (`meld-test-utils`)

**Purpose:** Utilities for unit testing components in Jest/Vitest.

### API Reference

  * `render(tagName, props)`: Mounts component to a temporary DOM.
  * `shadowQuery(selector)`: Finds elements inside the Shadow DOM (bypassing encapsulation for testing).

### Example Test

```javascript
test('Button emits click', () => {
  const { element, shadowQuery } = MeldTestUtils.render('my-button', { label: 'Go' });
  
  const btn = shadowQuery('button');
  expect(btn.textContent).toBe('Go');
  
  btn.click();
  // ... assert event emission ...
});
```

-----

## 4\. Meld A11y (`meld-a11y`)

**Purpose:** Accessibility helpers for WCAG compliance.

### API Reference

  * `announce(message)`: Updates a hidden `aria-live` region to read text to screen readers.
  * `trapFocus(element)`: Directive to keep keyboard tab focus inside a container (for modals).

### Example

```javascript
const save = () => {
  // Logic...
  announce("Changes saved successfully.");
};

return meldHtml`
  <div class="modal" ref="${trapFocus}">
    ...
  </div>
`;
```

-----

## 5\. Meld Versioning (`meld-versioning`)

**Purpose:** Deployment tracking for Micro-Frontends.

  *  **Behavior:** Automatically adds a `data-meld-version` attribute to every component host element based on the global build configuration.
  *  **Benefit:** Allows monitoring tools (like Sentry) to identify which version of a micro-frontend is causing errors in production.

-----

## 6\. Meld Hotkeys (`meld-hotkeys`)

**Purpose:** Reactive keyboard shortcuts manager that automatically handles key combos and lifecycle teardown.

### API Reference

  *   `useHotkeys(bindings, target?)`: Registers keydown event listeners on `target` (default: `window`). Automatically removes them when the component unmounts.

### Example

```javascript
defineMeld('task-manager', (el, { useHotkeys }) => {
  // Bind actions to key combos
  useHotkeys({
    'ctrl+s': () => saveTasks(),
    'escape': () => closeModal(),
    'n': () => createNewTask()
  });
});
```

> [!NOTE]
> Single character hotkeys (like `n` or `/`) are automatically ignored when the user is actively typing inside editable fields (`<input>`, `<textarea>`, or `contenteditable` elements) to prevent unintended side effects. Key combos with modifiers (like `ctrl+s`) remain active.