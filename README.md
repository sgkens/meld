<div align="center">
  <img width="128" src="logo.svg" alt="PWSL Logo">

  # MELDjs


 *`Meldjs` - Fusing simplicity with performance.* **--• Made with ❤️ by the Meldjs Team**

<img src="https://shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /> <img src="https://shields.io/badge/size-2kb-brightgreen.svg" alt="Size: 2kb" /> <img src="https://shields.io/badge/build-passing-brightgreen.svg" alt="Build: Passing" /> <img src="https://shields.io/badge/version-1.0.0-blue.svg" alt="Version: 1.0.0" />
  
  ---

  **The 2kb Micro-Frontend Engine.**
  *Reactive State. Native Components. No Build Step.*

  <span>
      <code>
      <a href="https://meldjs.dev">🌐 <i><b>Meldjs.dev</b></i></a>
      <a href="https://meldjs.dev/core-api">📒 <i>API Reference</i></a>
      <a href="https://www.npmjs.com/package/meldjs">📦 <i>NPM</i></a>
      <a href="https://jsr.io/@meldjs/meldjs">🧊 <i>JSR</i></a>
      <a href="https://github.com/meldjs/meldjs">⬛  <i>GitHub</i></a>
      </code>
  </span>
  <br>
  <br>

  ---

</div>

<details>
<summary><strong>📚Table of Contents</strong></summary>

- [MELDjs](#meldjs)
  - [**FrameWork Overview**](#framework-overview)
    - [**Why MELD?**](#why-meld)
  - [**Build**](#build)
  - [**Installation**](#installation)
  - [**Quick Start**](#quick-start)
  - [**Meld UI: The Reactive Catalog**](#meld-ui-the-reactive-catalog)
    - [**Included Components**](#included-components)
  - [**Artisan CLI**](#artisan-cli)
  - [**Ecosystem \& Plugins**](#ecosystem--plugins)
  - [**Documentation**](#documentation)
    - [Local Docs](#local-docs)
  - [**Contributing**](#contributing)
  - [**License**](#license)

</details>

## **FrameWork Overview**

**Meld.js** is a razor-thin JavaScript framework designed for building high-performance, isolated UI widgets and micro-frontends. It combines the fine-grained reactivity of modern engines with the native interoperability of **Web Components**.

### **Why MELD?**

| Feature | Description |
| :--- | :--- |
| **Zero Build Step** | Runs directly in the browser via ES Modules. |
| **Surgical Reactivity** | Uses JS Proxies to update exact text nodes. No VDOM overhead. |
| **True Isolation** | Native Custom Elements with **Shadow DOM** encapsulation. |
| **Framework Agnostic** | Works seamlessly inside React, Vue, Svelte, or legacy jQuery. |

---

## **Build** 

**Meld** is transpiled to `ES Modulesm`, `UMD`, and `IIFE` formats. exports are available for both **Node** and **Browser** environments. The build process is powered by `esbuild` for speed and efficiency, **BUN** is also supported for local development and production builds.

```bash
npm install
npm run test
npm run lint 
npm run build
npm run dev
npm run docs:build
npm run docs:serve
```

> You can also use the `npx meld-artisan` CLI tool to scaffold a complete project or KMEL stack. [**artisan-cli**](https://meldjs.dev/artisan-cli)

## **Installation**

Scaffold a complete project or KMEL stack using the [**artisan-cli**](https://meldjs.dev/artisan-cli).

```bash
# Basic Frontend App
npx meld-artisan init my-app

# Full KMEL Stack (Knex, Meld, Express, Lucia)
npx meld-artisan init:stack my-startup
```

---

## **Quick Start**

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

## **Meld UI: The Reactive Catalog**

Meld comes with a rich, pre-built component suite built entirely without external dependencies like *Tailwind*. Everything runs natively using our Design Token system.

### **Included Components**
* **Inputs & Actions:** `<m-button>`, `<m-input>`, `<m-switch>`, `<m-select>`
* **Layout:** `<m-stack>`, `<m-group>`, `<m-card>`, `<m-divider>`
* **Data Display:** `<m-table>` (sortable), `<m-badge>`, `<m-avatar>`, `<m-alert>`
* **Navigation:** `<m-tabs>`, `<m-breadcrumb>`, `<m-dropdown>`
* **Overlays:** `<m-modal>`, `<m-toast>` (with robust toast service)

---

## **Artisan CLI**

The Artisan tool provides a robust TUI (Terminal User Interface) for managing your development cycle.

* **Dashboard:** Interactive TUI with `npx meld-artisan dashboard`.
* **Scaffolding:** `init`, `init:stack`, and `make:component`.
* **Type Safety:** `types` command generates `meld-env.d.ts` recursively for full IDE IntelliSense.
* **Production:** `build:static` for SSG with Declarative Shadow DOM.

---

## **Ecosystem & Plugins**

Meld ships with 22 official plugins covering every enterprise need:

* **Infrastructure:** Router (with View Transitions), Store, Persist, Head, I18n.
* **Async:** Query, Quiver, gRPC, Streaming AI Hook.
* **UX:** Portal, Lazy, A11y, Skeleton, Markdown, Terminal, Motion.
* **Native Power:** Federation, WASM, Broadcast.

---

## **Documentation**

The full documentation is built with `11ty` and `Nunjucks` and hosted at `/docs`.

*   [**Core API Reference**](/docs/core-api.md)
*   [**Plugin Guide**](/docs/plugins.md)
*   [**KMEL Stack Architecture**](/docs/advanced-architecture.md)
*   [**Bootcamp: 30-Min Task Manager**](/docs/bootcamp.md)
*   [**Performance Benchmarks**](/docs/performance.md)

### Local Docs

```bash
npm install
npm run docs:serve
```

**11ty** serves the `/docs` with live reload at `http://localhost:8080` by default.
For a production build, run:

```bash
npm run docs:build
```

---

## **Contributing**

Contributions are welcome! Please ensure you adhere to the `build: patch|minor|major` semantic versioning convention when submitting pull requests. We welcome contributions from the community! If you would like to contribute, please follow these steps:  

1. Fork the repository and create a new branch for your feature or bug fix.
2. Make your changes and ensure that the code adheres to the project's coding standards.
3. Submit a pull request with a clear description of your changes and the problem they solve.


## **License** 

**Meldjs** is licensed under the [MIT License](https://gitlab.com/meldjs/meldjs/-/blob/main/LICENSE).