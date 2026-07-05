# meldjs - Development Notes and Workflow Instructions

## **REPO INSTRUCTIONS**

Use this tracker as the local source of truth for release hardening, testing gaps, config drift, and AI-agent handoff work.

## **Tasklist**

### **Issues Remaining (priority-1)**

- [ ] 🔴🦀❓🔟 **Critical** - Fix local JavaScript toolchain availability: npm, npx, and node are not on PATH in this shell, blocking npm test, npm run lint, and npm run build verification.
### **Enhancements (priority-2)**

- [ ] 🟡🌟⏳6️⃣ **Enhancement** - Generate Meld custom data from current core, components, and plugins so LSP/VS Code completions stay aligned with the package instead of hardcoded CORE_DATA.
### **Features (priority-3)**

- [ ] 🔴🌟⏳🔟 **Feature** - Epic: Build core framework test matrix covering meldState dependency tracking, computed cleanup, nested effects, no-op same-value sets, attribute bindings, event bindings, raw HTML rendering, Node replacement, list keyed reuse, lifecycle cleanup, provide/inject bubbling, theme adoption, and custom element duplicate-definition handling.
- [ ] 🔴🌟⏳🔟 **Feature** - Epic: Build plugin test matrix for all src/plugins modules with isolated jsdom and mocked browser APIs for fetch, localStorage, cookies, BroadcastChannel, IntersectionObserver, WebAssembly, history/hash routing, document head mutations, file upload/download, and portal cleanup.

- [ ] 🟠🌟⏳8️⃣ **Feature** - Finish meld-lsp TypeScript server plugin: install dependencies, make tsc build pass, implement real meldHtml template completions, diagnostics, hover data, and plugin/custom-element metadata loading.
- [ ] 🟠🌟⏳8️⃣ **Feature** - Finish meld-vscode extension packaging: bundle or depend on meld-lsp, add VS Code package scripts, README, marketplace metadata, icon, license, vsce packaging, and extension smoke tests.
- [ ] 🟠🌟❓8️⃣ **Feature** - Finish meld-socket WebSocket plugin integration: runtime hardening, package exports, type declarations, smoke tests, and merge readiness with develop.
  - Runtime/export/docs integration is in place; final verification is blocked until node/npm/npx are available for lint, tests, and docs build.
- [ ] 🟠🌟❓8️⃣ **Feature** - Consolidate Meld docs UI: smaller H1 scale, site-wide API reference styling, Mermaid theme alignment, dismissible release banner, and benchmark harness for Meld/Vue/React/HTMX.
  - Implementation is in place across docs templates, CSS, docs JS, benchmark harness, and performance docs; build/runtime verification is blocked until node/npm/npx are available.
### **Bug Fixes (priority-4)**

- [ ] 🟠🦀❓7️⃣ **BugFix** - Fix meld-vscode TypeScript server plugin contribution: current package references meld-lsp by name but does not ship the plugin inside the extension package.
### **Documentation (priority-5)**

- [x] 🟠🌟✅7️⃣ **Docs** - Add docs collection index pages, fix collection breadcrumbs, and complete API reference links/highlighting
### **Refactoring (priority-6)**

- [ ] 🟠🌟⏳7️⃣ **Refactoring** - Convert all 11ty theme templates (`default.njk`, `landing.njk`) into modular Nunjucks macro components. Extract: topbar, sidebar, TOC, footer, search-modal, breadcrumbs, doc-pager into `_includes/components/*.njk` macros so the theme is easy to develop, extend, and test in isolation. Follow skill fluent-ui-v1 SOT component approach.

### **Refine Features (priority-7)**

### **Refine Documentation (priority-8)**

### **Backlog**
