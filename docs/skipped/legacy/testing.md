---
title: Testing & Quality
nav_order: 7
---

# Testing & Quality Assurance

Meld v1.3 introduces a complete testing layer to ensure your micro-frontends are stable.

## 1. Testing Components
We use `meld-test-utils` to handle Shadow DOM complexity.

**Example Test (Jest/Vitest):** ```javascript
import { MeldTestUtils } from '../src/plugins/meld-test-utils.js';

test('User Card renders name', () => {
  // Render component into a clean DOM
  const { shadowQuery, unmount } = MeldTestUtils.render('user-card', { name: 'Alice' });
  
  // Query inside Shadow DOM
  const h1 = shadowQuery('h1');
  
  expect(h1.textContent).toBe('Alice');
  
  unmount();
});
````

## 2\. Debugging

Use the `meld-devtools` plugin during development to visualize updates.

  * **Visual Flash:** Components flash when updated.
  *  **Console:** Run `MeldDiagnostics.getComponentMap()` to see all active instances.

## 3\. Style Guide

Because Meld uses raw JavaScript, we recommend **ESLint**+ **Prettier** with standard JS rules. No special plugins required.