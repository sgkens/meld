---
title: State Management
nav_order: 5
---

# State Management

Meld offers a tiered approach to state, from local component state to global application stores.

## Local State (`meldState`)
Used for data specific to a single component instance.

```javascript
defineMeld('toggle-btn', () => {
  const state = meldState({ on: false });
  // 'state' is isolated to this specific <toggle-btn>
});
```

## Derived State (computed)

Used when one value depends on others. Cached automatically.


```javascript
const cart = meldState({ items: [], tax: 0.1 });

const total = computed(() => {
  const sub = cart.items.reduce((a, b) => a + b.price, 0);
  return sub + (sub * cart.tax);
});
```

## Dependency Injection (provide / inject)

Used to share state down the tree without prop-drilling.

```javascript
// Ancestor
const theme = meldState({ color: 'dark' });
provide('theme', theme);

// Descendant (Any depth)
const theme = inject('theme');
```