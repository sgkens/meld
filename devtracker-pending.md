# meldjs - Development Notes and Workflow Instructions

## **REPO INSTRUCTIONS**

Use this tracker as the local source of truth for release hardening, testing gaps, config drift, and AI-agent handoff work.

## **Tasklist**

### **Issues Remaining (priority-1)**
- [x] update all function plugins to have JSDoc fully documented inline with best practice + a little love on the top makes for a better DX
- [x] update the docs site to reference npm meldjs group name pace @meldjs/meld
- [x] Templaing and rendering page has broken sytax calling render to bleed have have a look and fix
- [x] **Critical** - sidebar sroll to view is off, active page should be near the top eleganly not to distract
- [x] **Critical** - Do a docs audit and make sure we are using the correct syntax for code blocks, some pages are broken namley astro, cli page as double yaml font matter in the page 
- [x] **creitcal** - lets use the api styling of the strict api page on other pages on meld docs make it uniform keep old style where makes sence.
- [x] lets auther and implement a new feature meld playground, this will be a playground for meld, give me a review on the component library
- [x] have we missed something critical here the meld components, i complete forgotten about this, i think i was going to keep the components in a sperate repo and have the paid, but im thinking i should maybe include theme.
- [x] we are building our docs site in 11ty, should web using our own frame work to do this will this simplyfy or complicate, we are build a powerfull micro framework, so cross routes, recarch into this for me, pros and cons
- [x] update banner is abit quirky, flickers even after cose, lets tie this to local storage, permanly hite when use clicks close, and only show when new version is available, also add a link to the release notes for the new version.

- [x] 🔴🦀❓🔟 **Critical** - Fix local JavaScript toolchain availability: npm, npx, and node are not on PATH in this shell, blocking npm test, npm run lint, and npm run build verification.
### **Enhancements (priority-2)**

- [ ] 🟡🌟⏳6️⃣ **Enhancement** - Generate Meld custom data from current core, components, and plugins so LSP/VS Code completions stay aligned with the package instead of hardcoded CORE_DATA.
### **Features (priority-3)**

- [ ] 🔴🌟⏳🔟 **Feature** - Epic: Build core framework test matrix covering meldState dependency tracking, computed cleanup, nested effects, no-op same-value sets, attribute bindings, event bindings, raw HTML rendering, Node replacement, list keyed reuse, lifecycle cleanup, provide/inject bubbling, theme adoption, and custom element duplicate-definition handling.
- [ ] 🔴🌟⏳🔟 **Feature** - Epic: Build plugin test matrix for all src/plugins modules with isolated jsdom and mocked browser APIs for fetch, localStorage, cookies, BroadcastChannel, IntersectionObserver, WebAssembly, history/hash routing, document head mutations, file upload/download, and portal cleanup.

- [x] 🟠🌟⏳8️⃣ **Feature** - Finish meld-lsp TypeScript server plugin: install dependencies, make tsc build pass, implement real meldHtml template completions, diagnostics, hover data, and plugin/custom-element metadata loading.
- [x] 🟠🌟⏳8️⃣ **Feature** - Finish meld-vscode extension packaging: bundle or depend on meld-lsp, add VS Code package scripts, README, marketplace metadata, icon, license, vsce packaging, and extension smoke tests.
- [x] 🟠🌟❓8️⃣ **Feature** - Finish meld-socket WebSocket plugin integration: runtime hardening, package exports, type declarations, smoke tests, and merge readiness with develop.
  - Runtime/export/docs integration is in place; final verification is blocked until node/npm/npx are available for lint, tests, and docs build.
- [x] 🟠🌟❓8️⃣ **Feature** - Consolidate Meld docs UI: smaller H1 scale, site-wide API reference styling, Mermaid theme alignment, dismissible release banner, and benchmark harness for Meld/Vue/React/HTMX.
  - Implementation is in place across docs templates, CSS, docs JS, benchmark harness, and performance docs; build/runtime verification is blocked until node/npm/npx are available.
### **Bug Fixes (priority-4)**

- [x] 🟠🦀❓7️⃣ **BugFix** - Fix meld-vscode TypeScript server plugin contribution: current package references meld-lsp by name but does not ship the plugin inside the extension package.
### **Documentation (priority-5)**

- [x] 🟠🌟✅7️⃣ **Docs** - Add docs collection index pages, fix collection breadcrumbs, and complete API reference links/highlighting
### **Refactoring (priority-6)**

- [x] 🟠🌟⏳7️⃣ **Refactoring** - Convert all 11ty theme templates (`default.njk`, `landing.njk`) into modular Nunjucks macro components. Extract: topbar, sidebar, TOC, footer, search-modal, breadcrumbs, doc-pager into `_includes/components/*.njk` macros so the theme is easy to develop, extend, and test in isolation. Follow skill fluent-ui-v1 SOT component approach.

### **Refine Features (priority-7)**

### **Refine Documentation (priority-8)**
 - [x] **Search Improvment** ive added the except, tags and descriptions, also catagory on getting started pages pleae update all other pages to have these fields so the search is more accurate and relevant, in the third colloum of the search we should use the exept and below the catagories and tags.
 - [x] We also need the ability to sort which collections go where, i would like the ability make a collection or folder apear in the order i specify
 - [x] ive created new collection called stacks ive put the kelm stack, the frameworks collection we need to expand this will more examples because meld can work with anything.
 - [x] add more settings for the editor allowing coverage of more editors and IDEs, also add more information on how to configure the editor for meld development, 
 - [x] We should add addition information how the stacks individal stacks for docker/podman config for local postgres, and other databases, also add more information on how to configure the editor for meld development postgres is melds preferred database.
 - [x] improve the collection index to instead of showing the file, show the Excerpt and the catagory and tags, this will make it easier to find the right page.
 - [x] gitlab/github icons are collections need reversing 
 - [x] the splash page has lost some of its color please have a loog see where we lost it and re-add it.
 - [x] meld artisan cli docs page has a double up remnants of the recents change consolidate it
 - [x] shoud we use the api layout of the strict-api-reference for the api pages to display api related data.
 - [x] Styling parameteter table first column needs let padding to make it easier to read.
 - [x] lets add solidjs, svelte, and react examples to the rendering page, we should also add a comparison of the different frameworks and how meld compares to them., also sveltkit, angular, nextjs, astro, and remix, we should also add a comparison of the different frameworks and how meld compares to them or hw meld is used with theme, remember we are comparing not to complete to define where meld sits what it can do what it cant. profrossional and open i dont like hiddent caviats, prefre straight up heres the pros and cons no builshit, if you want to build this, use this instead of.
 - [x] the splash code block sytax highlighting is not working, please fix it
### **Backlog**
