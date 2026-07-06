---
title: Known Limitations & Fixes
nav_order: 7
---

# Known Limitations & Fixes (v1.2)

Meld's minimalist design comes with a few trade-offs. Version 1.2 includes native fixes for the biggest issues.

## 1. The List Focus Issue (FIXED)

**Issue:** In previous versions, typing in an input inside a list would cause focus to be lost instantly when the state updated.

**The Fix:** The **`meld.list`** utility now uses **Keyed Reconciliation (Node Caching)**. It maintains a memory map of all rendered DOM nodes and reuses them if the unique key (`item.id`) matches.

**Best Practice:** Always provide a unique key function to `meld.list` when dealing with interactive arrays.

## 2. Global Styling (FIXED)

**Issue:** Generic global CSS frameworks (like Tailwind or Bootstrap) do not work inside the isolated Shadow DOM.

**The Fix:** Use **`meld.theme(cssString)`** to inject shared stylesheets into the Shadow DOM using the efficient `adoptedStyleSheets` API.

## 3. Raw HTML Injection (FIXED)

**Issue:** Meld is secure by default (`createTextNode` escapes HTML), preventing simple rendering of CMS content or complex strings.

**The Fix:** Use **`meld.raw(htmlString)`** explicitly. This bypasses security escaping, allowing you to inject trusted HTML or SVG code.

## 4. No Server-Side Rendering (SSR)

**Limitation:** Meld is strictly a **Client-Side** framework. It cannot run on a Node.js server to generate HTML strings for initial load.

**Alternative:** Use the `meld-static` approach (planned for v1.2) to pre-render static HTML snapshots via a headless browser, achieving similar benefits without bloating the core runtime.
