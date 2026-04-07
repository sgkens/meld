---
title: Testing Guide
nav_order: 12
---

# 🧪 Testing Meld Components

Testing components with Shadow DOM can be tricky. Meld provides `meld-test-utils` to make it easy using Jest, Vitest, or Playwright.

## **1. Unit Testing (Vitest/Jest)**

Use the `render` helper to mount components into the document.

```javascript
import { MeldTestUtils } from './src/plugins/meld-test-utils.js';
import './components/my-button.js';

test('increments on click', async () => {
  const { element, shadowQuery } = MeldTestUtils.render('my-button');
  
  const btn = shadowQuery('button');
  btn.click();
  
  expect(btn.textContent).toBe('1');
});
```

## **2. E2E Testing (Playwright)**

Since Meld components are standard Web Components, Playwright can find them easily using the `>>` shadow-piercing selector.

```javascript
await page.goto('http://localhost:3000');
await page.click('my-button >> button');
await expect(page.locator('my-button >> span')).toHaveText('1');
```
