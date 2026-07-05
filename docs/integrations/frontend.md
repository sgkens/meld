---
title: Frontend Frameworks
parent: Integrations
nav_order: 1
---

# Integrating with Frontend Frameworks

Meld components are **Native Custom Elements**. This means they work in any framework that supports HTML standards.

## ***React*** React treats custom elements like standard DOM elements.

**Setup:** Import your Meld component in your main entry file (e.g., `App.jsx` or `index.js`).

```jsx
// src/App.jsx
import React from 'react';
import './components/meld-widget.js'; // Your Meld Component

function App() {
  return (
    <div className="App">
      <h1>React App</h1>
      
      {/* Usage */}
      <meld-widget title="Hello from React"></meld-widget>
    </div>
  );
}
```

> Note: React passes data as attributes (strings). If you need to pass complex objects (arrays/objects) to Meld, use a `ref` and set the property manually in a `useEffect`.



```jsx
// src/App.jsx
import React from 'react';
import './components/meld-widget.js'; // Your Meld Component

function App() {
  return (
    <div className="App">
      <h1>React App</h1>
      
      {/* Usage */}
      <meld-widget title="Hello from React"></meld-widget>
    </div>
  );
}
````

>  **Note:** React passes data as **attributes** (strings). If you need to pass complex objects (arrays/objects) to Meld, use a `ref` and set the property manually in a `useEffect`.


## ***Vue*** 
Vue has excellent support for Custom Elements, but you must tell the Vue compiler to ignore Meld tags (so it doesn't try to resolve them as Vue components).

**Config (`vite.config.js`):** 
```javascript
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat all tags with a hyphen as Custom Elements
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    })
  ]
})
```

**Usage:** 
```html
<template>
  <div class="vue-app">
    <meld-counter :count="count"></meld-counter>
  </div>
</template>

<script setup>
import '../components/meld-counter.js';
import { ref } from 'vue';

const count = ref(10);
</script>
```

-----

## ***Svelte*** 
Svelte supports custom elements natively with zero configuration.

```html
<script>
  import '../components/meld-ticker.js';
  let stock = "GOOG";
</script>

<h1>Svelte App</h1>
<meld-ticker symbol={stock}></meld-ticker>
```

-----

## ***SolidJS*** 
SolidJS was a major inspiration for Meld. They play perfectly together.

```jsx
import { createSignal } from "solid-js";
import '../components/meld-toggle.js';

function App() {
  const [active, setActive] = createSignal(false);

  return (
    <div>
      <meld-toggle 
        active={active()} 
        onchange={(e) => setActive(e.detail)}
      />
    </div>
  );
}
```