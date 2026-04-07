# ![Meld Logo](logo.svg) 🔗 MELD.JS

**The 2kb Micro-Frontend Engine.**
*Reactive State. Native Components. No Build Step.*

---

## 💠 **Overview**

**Meld.js** is a razor-thin JavaScript framework designed for building high-performance, isolated UI widgets and micro-frontends. It combines the fine-grained reactivity of modern engines with the native interoperability of **Web Components**.

### **Why MELD?**

| Feature | Description |
| :--- | :--- |
| **🚀 Zero Build Step** | Runs directly in the browser via ES Modules. |
| **⚡ Surgical Reactivity** | Uses JS Proxies to update exact text nodes. No VDOM overhead. |
| **🛡️ True Isolation** | Native Custom Elements with **Shadow DOM** encapsulation. |
| **🔗 Framework Agnostic** | Works seamlessly inside React, Vue, Svelte, or legacy jQuery. |

---

## 📦 **Installation**

Scaffold a complete project or KMEL stack using the **Artisan CLI**.

```bash
# Basic Frontend App
npx meld-artisan init my-app

# Full KMEL Stack (Knex, Meld, Express, Lucia)
npx meld-artisan init:stack my-startup
```

---

## 🚀 **Quick Start**

Meld requires no build tools. Just import and define.

```javascript
import { defineMeld, meldState, meldHtml } from './src/meld.core.js';

defineMeld('hello-meld', (el) => {
  const state = meldState({ count: 0 });
  
  return meldHtml`
    <button onclick="${() => state.count++}">
      Count is: ${() => state.count}
    </button>
  `;
});
```

---

## 🎨 **Meld UI: The Premium Catalog**

Meld comes with a rich, pre-built component suite built entirely without external dependencies like Tailwind. Everything runs natively using our Design Token system.

### **Included Components**
*   **Inputs & Actions:** `<m-button>`, `<m-input>`, `<m-switch>`, `<m-select>`
*   **Layout:** `<m-stack>`, `<m-group>`, `<m-card>`, `<m-divider>`
*   **Data Display:** `<m-table>` (sortable), `<m-badge>`, `<m-avatar>`, `<m-alert>`
*   **Navigation:** `<m-tabs>`, `<m-breadcrumb>`, `<m-dropdown>`
*   **Overlays:** `<m-modal>`, `<m-toast>` (with robust toast service)

---

## 🛠️ **Artisan CLI v2.2**

The Artisan tool provides a robust TUI (Terminal User Interface) for managing your development cycle.

*   **🟦 Dashboard:** Interactive TUI with `npx meld-artisan dashboard`.
*   **🟩 Scaffolding:** `init`, `init:stack`, and `make:component`.
*   **💠 Type Safety:** `types` command generates `meld-env.d.ts` recursively for full IDE IntelliSense.
*   **🔄 Production:** `build:static` for SSG with Declarative Shadow DOM.

---

## 🧩 **Ecosystem & Plugins**

Meld ships with 22 official plugins covering every enterprise need:

*   **Infrastructure:** Router (with View Transitions), Store, Persist, Head, I18n.
*   **Async:** Query, Quiver, gRPC, Streaming AI Hook.
*   **UX:** Portal, Lazy, A11y, Skeleton, Markdown, Terminal, Motion.
*   **Native Power:** Federation, WASM, Broadcast.

---

## 📜 **Documentation**

The full documentation is built with Meld.js and hosted at `/docs`.

*   [**Core API Reference**](/docs/core-api.md)
*   [**Plugin Guide**](/docs/plugins.md)
*   [**KMEL Stack Architecture**](/docs/advanced-architecture.md)
*   [**Bootcamp: 30-Min Task Manager**](/docs/bootcamp.md)
*   [**Performance Benchmarks**](/docs/performance.md)

---

## 🤝 **Contributing**

Contributions are welcome! Please ensure you adhere to the `build: patch|minor|major` semantic versioning convention when submitting pull requests.

---

## 🔄 **Release Status**

**Version:** `v1.0.0` (Stable)
**Status:** Battle-Tested. Production Ready.

---

🔹 *Meld.js - Fusing simplicity with performance.*