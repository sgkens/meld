---
title: Styling Components
nav_order: 11
---

# 🎨 Styling & Theming

Meld components use **Shadow DOM**, which provides perfect style isolation. This means your component's CSS will never leak out or be affected by outside styles.

## **1. Local Scoped Styles**

Place your styles directly inside the `meldHtml` template.

```javascript
defineMeld('red-box', () => {
  return meldHtml`
    <style>
      :host { display: block; }
      div { background: red; padding: 20px; }
    </style>
    <div>I am red!</div>
  `;
});
```

## **2. Global Theming (`meld.theme`)**

If you want shared variables (like brand colors) or base styles (like Tailwind) to work inside all components, use `meld.theme()`.

```javascript
import { meld } from './src/meld.core.js';

meld.theme(`
  :root { --brand: #D64045; }
  button { border-radius: 8px; font-family: sans-serif; }
`);
```

## **3. Dynamic Styling (`meld.css` & `meld.style`)**

Helpers for conditional classes and inline styles.

```javascript
const state = meldState({ active: true });

return meldHtml`
  <div class="\${meld.css({ 'btn': true, 'active': state.active })}"></div>
  <div style="\${meld.style({ color: state.active ? 'green' : 'red' })}"></div>
`;
```
