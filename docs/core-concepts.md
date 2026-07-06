---
title: Core Concepts
nav_order: 3
excerpt: "Fundamental concepts behind Meld.js: proxy-based reactivity, Native Custom Elements, Shadow DOM encapsulation, and the no-build architecture."
tags: [core-concepts, reactivity, proxy, custom-elements, shadow-dom, no-build]
category: Docs
---

# Core Concepts

To master Meld, you need to understand how it differs from React or Vue.

## 1. The Reactive Proxy
Meld does not use `setState()` (React) or a compiler (Svelte). It uses **JavaScript Proxies**.

* **Tracking:** When you access `state.count` inside `meldHtml`, the engine records a dependency.
* **Updating:** When you write `state.count++`, the engine is notified immediately.
* **Surgical Update:** The engine goes directly to the DOM Text Node associated with that dependency and updates `.data`. It does **not** re-render the component.



## 2. Components as Native Elements
Every Meld component is a standard **HTML Custom Element**.

* **Lifecycle:** Meld hooks into the browser's `connectedCallback` and `disconnectedCallback`.
* **Interoperability:** To a React app, a Meld component looks like a `<div>`. It takes attributes and emits standard DOM events.

## 3. Shadow DOM Isolation
Meld attaches a **Shadow Root** (`mode: 'open'`) to every component.

* **Styles are Scoped:** CSS defined inside `meldHtml` applies *only* to that component.
* **Zero Leakage:** Global styles (like Bootstrap) do not bleed in unless explicitly injected via `meld.theme()`.

---

## 4. The "No-Build" Reality
Meld files are just JavaScript (`.js`). 
* No `.jsx` or `.vue` extensions.
* No transpilation needed.
* **Benefit:** Browser DevTools show your actual code, line-for-line. Debugging is trivial.