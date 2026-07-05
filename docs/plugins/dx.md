---
title: DX & Quality
parent: Plugin Ecosystem
nav_order: 5
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