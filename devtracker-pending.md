# meldjs - Development Notes and Workflow Instructions

## **REPO INSTRUCTIONS**

Use this tracker as the local source of truth for release hardening, testing gaps, config drift, and AI-agent handoff work.

## **Tasklist**

### **Issues Remaining (priority-1)**

- [ ] 🔴🦀❓🔟 **Critical** - Fix local JavaScript toolchain availability: npm, npx, and node are not on PATH in the current shell, blocking npm test, npm run lint, and npm run build verification.
- [x] 🔴🪲✅🔟 **Critical** - Re-enable GitLab CI test stage and require npm test plus coverage artifacts before build/deploy/release jobs.

### **Enhancements (priority-2)**

- [x] 🟠🌟✅7️⃣ **Enhancement** - Add coverage enforcement to Jest config or npm test script so core and plugin regression tests cannot silently remain at one assertion before launch.

- [ ] 🟡🌟⏳6️⃣ **Enhancement** - Generate Meld custom data from current core, components, and plugins so LSP/VS Code completions stay aligned with the package instead of hardcoded CORE_DATA.
### **Features (priority-3)**

- [ ] 🔴🌟⏳🔟 **Feature** - Epic: Build core framework test matrix covering meldState dependency tracking, computed cleanup, nested effects, no-op same-value sets, attribute bindings, event bindings, raw HTML rendering, Node replacement, list keyed reuse, lifecycle cleanup, provide/inject bubbling, theme adoption, and custom element duplicate-definition handling.
- [ ] 🔴🌟⏳🔟 **Feature** - Epic: Build plugin test matrix for all src/plugins modules with isolated jsdom and mocked browser APIs for fetch, localStorage, cookies, BroadcastChannel, IntersectionObserver, WebAssembly, history/hash routing, document head mutations, file upload/download, and portal cleanup.

- [ ] 🟠🌟⏳8️⃣ **Feature** - Finish meld-lsp TypeScript server plugin: install dependencies, make tsc build pass, implement real meldHtml template completions, diagnostics, hover data, and plugin/custom-element metadata loading.
- [ ] 🟠🌟⏳8️⃣ **Feature** - Finish meld-vscode extension packaging: bundle or depend on meld-lsp, add VS Code package scripts, README, marketplace metadata, icon, license, vsce packaging, and extension smoke tests.
- [x] 🔴🌟✅🔟 **Feature** - Build release-ready Meld Eleventy/Nunjucks documentation site from docs/meld-11ty-nunchucks-theme-sot.html and move non-site legacy docs into an Eleventy ignored skipped folder.
### **Bug Fixes (priority-4)**

- [x] 🟠🪲✅9️⃣ **BugFix** - Audit vite.config.js against automator-devops/templates/javascript/vite.config.js after syntax fix; confirm four-file UMD/ESM output, copied package metadata, README, lockfile, and JSR config are correct for meldjs.
- [x] 🟠🪲✅9️⃣ **BugFix** - Replace copied logcad values in jsr.jsonc with meldjs package name, version, exports, publish includes, and runtime tasks before attempting JSR publish.
- [x] 🟠🪲✅9️⃣ **BugFix** - Investigate meldHtml dynamic function rendering: raw HTML and Node replacement currently mutate parent.innerHTML/replaceChildren, which can remove sibling dynamic anchors and break multiple reactive values in the same parent.
- [x] 🟠🪲✅8️⃣ **BugFix** - Investigate createEffect activeEffect restoration for nested computed/effects; current single global activeEffect can drop parent tracking when an effect is created during another effect.
- [x] 🟠🪲✅8️⃣ **BugFix** - Test and harden MeldA11y focusTrap: empty focusable lists currently index focusable[0] and focusable[-1], so modal/dialog edge cases need guards and tests.
- [x] 🟠🪲✅8️⃣ **BugFix** - Test and harden MeldPortal cleanup: current ref appends rendered nodes to document.body but does not prove disconnection removes the teleported DOM.
- [x] 🟠🪲✅8️⃣ **BugFix** - Test and harden network plugins MeldAI, MeldQuery, MeldQuiver, and MeldWasm for failed fetch, invalid JSON, stream absence, non-ok responses, and abort/error state propagation.

- [ ] 🟠🦀❓7️⃣ **BugFix** - Fix meld-vscode TypeScript server plugin contribution: current package references meld-lsp by name but does not ship the plugin inside the extension package.
### **Documentation (priority-5)**

- [x] 🟢🎨✅8️⃣ **Documentation** - Epic polish pass on 11ty docs site: full CSS overhaul (glassmorphism, premium tokens, animated backgrounds, copy-to-clipboard, heading anchors, keyboard shortcuts, view transitions), improved Nunjucks layouts (default.njk, landing.njk), enhanced JS (sidebar backdrop, Escape key, Ctrl+K search), refreshed logo SVG (elliptical orbital rings), and expanded landing page hero + 6-card grid.

### **Refactoring (priority-6)**

### **Refine Features (priority-7)**

### **Refine Documentation (priority-8)**

### **Backlog**
