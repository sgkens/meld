---
title: Introduction
layout: default
nav_order: 1
---

# 🔗 Meld.js

**The 2kb Micro-Frontend Engine.**
*Reactive State. Native Components. No Build Step.*



**Meld** is a razor-thin JavaScript framework designed for building high-performance, isolated UI widgets and micro-frontends. It combines the fine-grained reactivity of **SolidJS** with the native interoperability of **Web Components**.

### **Why Choose Meld?**

| Feature | Description |
| :--- | :--- |
| **🚀 Zero Build Step** | Runs directly in the browser via ES Modules. No Webpack, no Vite required for development. |
| **⚡ Fine-Grained** | Uses **JavaScript Proxies** to update exact text nodes. Avoids Virtual DOM overhead entirely. |
| **🛡️ True Isolation** | Components are Native Custom Elements with **Shadow DOM** for guaranteed style encapsulation. |
| **🔗 Native Integration** | Works seamlessly inside any existing application (React, Vue, legacy jQuery) because it relies on web standards. |

### **Quick Start: The "No-Build" Way**

To start, you only need `index.html` and the `meld.core.js` file.

```html
<script type="module">
  import { defineMeld, meldState, meldHtml } from './src/meld.core.js';

  defineMeld('hello-world', () => {
    const state = meldState({ count: 0 });
    
    return meldHtml`
      <button onclick="\${() => state.count++}">
        Clicked \${() => state.count} times
      </button>
    `;
  });
</script>

<hello-world></hello-world>
```