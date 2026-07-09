---
title: Rendering & Templating
nav_order: 4
parent: getting-started
tags: [rendering, templating, meldHtml, meld.list, meld.css]
category: getting-started
excerpt: A guide to rendering templates and using the `meldHtml` tag for reactive UI updates in Meld.js.
---

# Rendering with `meldHtml`

The `meldHtml` tag is the heart of the framework. It parses your template string and establishes reactive bindings.

## Basic Syntax

```javascript
return meldHtml`
  <div class="card">
    <h1>${() => state.title}</h1>
  </div>
`;
```

| Syntax            | Description                                               | Example                  |
| ----------------- | --------------------------------------------------------- | ------------------------ |
| **Reactive Function** | Pass a function returning a value. Updates automatically. | `${() => state.count}`     |
| **Static Value** | Pass a string/number directly. Renders once.              | `${"Static Title"}`        |
| **Event Listener** | Pass a function to an `on*` attribute.                      | `onclick="${handleClick}"` |
| **Boolean Attribute** | If value is `false/null`, attribute is removed.             | `disabled="${() => state.loading}"` |


## Control Flow (Loops & Ifs)

Meld uses JavaScript for logic, not template DSLs like v-if or ng-for.

### Conditionals (Ternary)

```javascript
${() => state.isLoggedIn 
  ? meldHtml`<button onclick="${logout}">Logout</button>`
  : meldHtml`<button onclick="${login}">Login</button>`
}
```

## Loops (The `meld.list` Helper)

> **Important:** Always use `meld.list()` for reactive lists. Using `.map()` directly replaces DOM nodes on every update, causing input focus loss.


```javascript
${meld.list(
  state.items, 
  (item) => item.id, // Unique Key (Critical!)
  (item) => meldHtml`<li>${item.text}</li>`
)}
```

## Styling

### Conditional Classes

Use the meld.css helper to toggle classes cleanly.


```javascript
<div class="${() => meld.css({ 
  'btn': true, 
  'btn-active': state.isActive,
  'btn-disabled': !state.isEnabled 
})}">
  Click Me
</div>
```

### Global Styles

Inject shared styles (Tailwind, Reset) into the Shadow DOM.

```javascript
// In your main entry file
meld.theme(`
  :host { font-family: sans-serif; }
  * { box-sizing: border-box; }
`);
```

---

## 🆚 Framework Comparisons & Code Parity

To understand where **Meld.js** fits in the modern web landscape, it helps to see how the same reactive component (a simple Counter button) is written in different libraries.

### Code Comparison

````carousel
```javascript
// --- MELD.js (2kb, Native Web Component, Zero Build) ---
import { defineMeld, meldState, meldHtml } from 'meld';

defineMeld('reactive-counter', () => {
  const state = meldState({ count: 0 });
  return meldHtml`
    <button onclick="${() => state.count++}">
      Count is: ${() => state.count}
    </button>
  `;
});
```
<!-- slide -->
```javascript
// --- SOLIDJS (6kb, Reactive JSX, Needs Build Step) ---
import { createSignal } from 'solid-js';

function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <button onClick={() => setCount(count() + 1)}>
      Count is: {count()}
    </button>
  );
}
```
<!-- slide -->
```html
<!-- --- SVELTE (4kb, Compiled Templates, Needs Build Step) --- -->
<script>
  let count = 0;
</script>

<button on:click={() => count++}>
  Count is: {count}
</button>
```
<!-- slide -->
```javascript
// --- REACT (significantly larger runtime, ~130kb+ with ReactDOM, Virtual DOM Hooks, Needs Build Step) ---
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count is: {count}
    </button>
  );
}
```
````

### Honest Framework Comparison

When deciding whether to use Meld or another framework, here is an honest assessment of the pros, cons, and appropriate use cases:

#### 1. React vs. Meld
*   **Use React if:** You are building an expansive single-page app (SPA) with a massive developer team, complex client-side state, or need access to a huge ecosystem of pre-existing packages (UI component libraries, charts, forms).
*   **Avoid React (and use Meld) if:** You are embedding interactive widgets inside a CMS (WordPress, Drupal) or server-rendered site, or building micro-frontends. React's heavy runtime overhead, Virtual DOM reconciliation, and hooks lifecycle are overkill for isolated widgets.

#### 2. SolidJS vs. Meld
*   **Use SolidJS if:** You love reactive state (proxies/signals) but want to build a complete, large-scale application using JSX and have a bundler-based build pipeline (Vite, Rollup) in place.
*   **Use Meld if:** You want the same fine-grained reactivity but require **zero build tools**. Meld runs natively in any browser via ES Modules, making it ideal for rapid prototyping or drop-in scripts.

#### 3. Svelte vs. Meld
*   **Use Svelte if:** You prefer compiler-guaranteed optimal performance and a clean, HTML-like single-file-component (SFC) style for your standalone applications.
*   **Use Meld if:** You do not want a compilation step. Svelte is useless without its compiler; Meld works natively directly in standard HTML/JS files.

#### 4. Angular vs. Meld
*   **Use Angular if:** You are building massive enterprise-level portals with strict modular architectures, built-in dependency injection, and strict TypeScript patterns.
*   **Use Meld if:** You want a lightweight element that doesn't drag a multi-megabyte framework along with it.

---

## 🌐 Next.js, SvelteKit, Remix, and Astro Integration

Meld does not compete with full-stack meta-frameworks. Instead, it serves as an **isolated client-side widget provider**.

| Meta-Framework | Role of Meld.js | How to use |
| :--- | :--- | :--- |
| **Astro** | Perfect for interactive "islands" | Embed Meld elements inside Astro templates; use Declarative Shadow DOM (DSD) for hydration. |
| **Next.js** | Client-side micro-widget | Import Meld components inside client components (`"use client"`) using dynamic imports to bypass Node SSR environment errors. |
| **SvelteKit / Remix** | Isolated dashboard widget | Embed as custom elements, leveraging Meld's context-isolation to prevent style/state pollution. |