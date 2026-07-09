---
title: Architectural Deep Dive
nav_order: 1
parent: Architecture
Description: A deep dive into the core architecture of Meld, including its reactivity model, Shadow DOM usage, and no-build philosophy.
excerpt: "An in-depth look at Meld.js core pillars: proxy-based reactivity, Shadow DOM encapsulation, and the no-build ESM architecture."
tags: [architecture, deep-dive, meld]
category: Architecture
---

# Architectural Deep Dive

Meld is a 2kb browser runtime built on four interlocking subsystems: a **Proxy-based reactivity engine**, a **Shadow DOM component model**, a **tagged-template engine**, and a **plugin system**. This page walks through each in detail, using actual source code from `src/meld.core.js`.

---

## 1. Proxy-Based Reactivity Engine

Meld uses a Proxy-based dependency tracking approach similar in intent to fine-grained signals, but without a compiler step. Everything is pure JavaScript evaluated at runtime in the browser.

### Global tracking variables

Three module-level variables coordinate the entire reactivity system:

```javascript
let activeEffect = null;    // The currently executing effect (if any)
const effectStack = [];     // Stack to handle nested effects
const effectQueue = new Set(); // Effects pending flush this microtask
let pendingTick = false;    // Whether a Promise.resolve flush is already queued
```

### `meldState()` — creating a reactive proxy

`meldState(initialObj)` wraps any plain object in a `Proxy`. The proxy intercepts both reads (`get`) and writes (`set`):

```javascript
export function meldState(initialObj) {
  const deps = new Map();           // prop -> Set<Effect>

  return new Proxy(initialObj, {
    get(target, prop) {
      if (activeEffect) {           // only track during an active effect
        if (!deps.has(prop)) deps.set(prop, new Set());
        const depSet = deps.get(prop);
        depSet.add(activeEffect);
        activeEffect.deps.add(depSet); // bidirectional link for cleanup
      }
      return target[prop];
    },
    set(target, prop, value) {
      if (target[prop] !== value) {
        target[prop] = value;
        if (deps.has(prop)) {
          [...deps.get(prop)].forEach(effect => queueEffect(effect));
        }
      }
      return true;
    }
  });
}
```

The `deps` map is **per-state-object** and keyed by property name. Every `set` operation triggers only the effects that previously read that specific property during their last run.

### `createEffect()` — subscribing to state changes

An _effect_ is an object with a `run()` function and a `deps` set tracking which dependency sets it belongs to. Effects automatically re-subscribe on every run (after cleanup), which means conditional access patterns are handled correctly.

```javascript
function createEffect(fn) {
  const effect = {
    active: true,
    run: () => {
      if (!effect.active) return;
      cleanupEffect(effect);   // clear stale subscriptions
      effectStack.push(effect);
      activeEffect = effect;   // set global tracker
      try {
        fn();                  // run: any state.prop reads are tracked
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1] || null;
      }
    },
    deps: new Set()
  };
  effect.run();                // run immediately for initial setup
  if (currentComponent) currentComponent.effects.push(effect);
}
```

The `effectStack` is an array (not a single variable) so nested effects (e.g. a computed inside a template) work correctly — `activeEffect` is always the innermost one.

### Microtask batching and `meld.flush()`

When a state property changes, `queueEffect` is called. It adds the effect to a `Set` (automatically deduplicating if the same effect is queued multiple times in one synchronous block) and schedules a microtask flush **once**:

```javascript
function queueEffect(effect) {
  effectQueue.add(effect);
  if (!pendingTick) {
    pendingTick = true;
    Promise.resolve().then(flushEffects); // schedule one flush
  }
}
```

`flushEffects()` runs all queued effects synchronously:

```javascript
function flushEffects() {
  pendingTick = false;
  const queue = Array.from(effectQueue);
  effectQueue.clear();
  queue.forEach(effect => {
    if (effect.active) effect.run();
  });
}
```

**Multiple synchronous state writes coalesce into a single DOM update.** If you write `state.a = 1; state.b = 2` in the same function call, the DOM only updates once on the next microtask tick.

`meld.flush()` lets you force that flush synchronously, which is essential in tests or before reading layout-dependent side effects:

```javascript
// In tests, after mutating state:
state.count = 5;
meld.flush(); // DOM is now up to date
assert(el.shadowRoot.textContent.includes('5'));
```

---

## 2. Shadow DOM Component Model

### `defineMeld()` — registering native Custom Elements

`defineMeld(tagName, setupFn, options?)` registers a native Custom Element via `customElements.define`. The class it creates extends `HTMLElement` directly.

```javascript
export function defineMeld(tagName, setupFn, options = {}) {
  if (customElements.get(tagName)) return; // idempotent
  customElements.define(tagName, class extends HTMLElement {
    // ...
  });
}
```

Guard against double-registration ensures that hot-reloading or multiple imports of the same module don't throw `NotSupportedError`.

### Constructor — Shadow root attachment

In the constructor, a Shadow Root is attached in `open` mode, and reactive attribute/property proxy objects are created:

```javascript
constructor() {
  super();
  if (this.shadowRoot) {
    this._isHydrating = true; // Declarative Shadow DOM already present
  } else {
    this.attachShadow({ mode: 'open' });
  }
  this.mountHooks  = [];
  this.destroyHooks = [];
  this.effects     = [];
  this._initialized = false;

  // Attributes become a reactive state object
  this._meldAttrs = meldState(attrsObj);
  // Declared properties become a reactive state object
  this._meldProps = meldState(propsObj);
}
```

### `connectedCallback` — component lifecycle entry point

`connectedCallback` is where Meld runs the developer-authored `setupFn`. The critical step is saving and restoring `currentComponent` so lifecycle hooks (`onMount`, `onDestroy`, `provide`) know which component they belong to:

```javascript
connectedCallback() {
  if (globalStyles.length > 0)
    this.shadowRoot.adoptedStyleSheets = [...globalStyles];

  if (this._initialized) return; // v1.4: guard against DOM move re-runs
  this._initialized = true;

  const previousComponent = currentComponent;
  currentComponent = this;           // set context for lifecycle hooks

  try {
    const template = setupFn(this, {
      emit,
      attrs: this._meldAttrs,
      props: this._meldProps,
      ...extensionContext             // merged plugin helpers
    });
    if (template && !this._isHydrating) {
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(template);
    }
    this.mountHooks.forEach(fn => fn()); // fire onMount callbacks
  } finally {
    currentComponent = previousComponent; // always restore
  }
}
```

The v1.4 `_initialized` guard is specifically to prevent a double-setup when a component is moved in the DOM (the browser fires `connectedCallback` again after a move).

### `disconnectedCallback` — teardown via microtask

Teardown is deferred by one microtask. This handles the DOM-move case: a component moved via `appendChild` fires `disconnectedCallback` and immediately `connectedCallback`. The microtask delay lets Meld check `this.isConnected` and skip teardown if the element reattached:

```javascript
disconnectedCallback() {
  Promise.resolve().then(() => {
    if (!this.isConnected) {
      this.effects.forEach(effect => {
        effect.active = false;
        cleanupEffect(effect);
      });
      this.destroyHooks.forEach(fn => fn());
      this._initialized = false;
    }
  });
}
```

---

## 3. Template Engine (`meldHtml`)

`meldHtml` is a tagged template literal function. It produces a `DocumentFragment` with reactive bindings wired to `createEffect`.

### Marker injection

Values in the template string are replaced with unique sentinel strings (`__meld_0__`, `__meld_1__`, etc.) before parsing:

```javascript
export function meldHtml(strings, ...values) {
  const markers = values.map((_, i) => `__meld_${i}__`);
  const htmlString = strings.reduce(
    (acc, str, i) => acc + str + (markers[i] || ''), ''
  );
  const template = document.createElement('template');
  template.innerHTML = htmlString; // parsed once by the browser
  const fragment = template.content.cloneNode(true);
  // ...
}
```

This approach means HTML is parsed exactly once by the browser's native parser, producing a real DOM tree. Meld then walks this tree to resolve each marker.

### The `walk()` resolver

A recursive `walk(node)` function visits every node in the fragment. For **element attributes** it checks for marker values and handles them by type:

| Attribute pattern | Behaviour |
| :--- | :--- |
| `ref="__meld_N__"` | Calls the value as `value(node)` to give ref access |
| `.propName="__meld_N__"` | Sets a DOM property; wraps in `createEffect` if a function |
| `on*="__meld_N__"` | Adds an event listener directly |
| `style="__meld_N__"` | Reactive style object diff or string; wraps in `createEffect` |
| any other `attr="__meld_N__"` | Reactive attribute set/remove; wraps in `createEffect` |

For **text nodes** containing a marker, the value determines the update strategy:

- **Reactive function** (`typeof value === 'function'`): Two sentinel text nodes bracket the dynamic region. A `createEffect` is used to clear and re-insert content on every state change.
- **Node or DocumentFragment**: Inserted directly.
- **`{ __raw: string }`**: Parsed as HTML via `<template>` and inserted.
- **Primitive**: Set as `node.nodeValue` once.

### Reactive attribute example

When you write:

```javascript
meldHtml`<button disabled="${() => state.loading}">Submit</button>`
```

Meld calls `createEffect(() => { ... })` for that attribute binding. Whenever `state.loading` changes, only that one `setAttribute`/`removeAttribute` call runs — there is no virtual DOM diffing, no component re-render.

---

## 4. Plugin Architecture

### The `use(plugin, options)` pattern

`use()` is the sole installation point for plugins. It passes the full Meld API object to `plugin.install`:

```javascript
export function use(plugin, options = {}) {
  if (installedPlugins.has(plugin)) return; // idempotent
  const api = {
    defineMeld, meldState, meldHtml, computed,
    provide, inject, onMount, onDestroy, meld
  };
  plugin.install(api, options);
  if (plugin.setupHelpers) {
    Object.assign(extensionContext, plugin.setupHelpers(api, options));
  }
  installedPlugins.add(plugin);
}
```

### `plugin.install(api, options)` — adding global behaviour

A plugin registers global things (routes, store, head manager) using `api.defineMeld` or direct DOM/module side effects. Example minimal plugin:

```javascript
// meld-logger.js
export const MeldLogger = {
  install(api, options = {}) {
    const prefix = options.prefix || '[meld]';
    // Patch meldState to log mutations
    const originalMeldState = api.meldState;
    api.meldState = (obj) => {
      console.log(`${prefix} meldState created`);
      return originalMeldState(obj);
    };
  }
};
```

### `plugin.setupHelpers(api, options)` — injecting per-component helpers

If a plugin returns an object from `setupHelpers`, those keys are merged into `extensionContext`, which is spread into **every** component setup function call:

```javascript
// meld-router.js (simplified)
export const MeldRouter = {
  install(api, options) { /* register <meld-view> etc */ },
  setupHelpers(api, options) {
    const router = createRouterInstance(options);
    return { router }; // available as (el, { router }) in every component
  }
};
```

After `use(MeldRouter, { routes })`, any component can do:

```javascript
defineMeld('my-page', (el, { router }) => {
  // router is available here
});
```

---

## 5. No-Build Architecture

Meld's `src/meld.core.js` uses only standard ES Module `export` statements. There is no JSX, no special file extension, no transform required. Components are plain `.js` files using standard tagged template literals.

In a browser with an [Import Map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap):

```html
<script type="importmap">
{
  "imports": {
    "@meldjs/meld": "https://unpkg.com/@meldjs/meld@1.4.0/dist/meld.core.esm.js"
  }
}
</script>

<script type="module">
  import { defineMeld, meldState, meldHtml } from '@meldjs/meld';

  defineMeld('hello-world', () => {
    const state = meldState({ name: 'World' });
    return meldHtml`<h1>Hello, ${() => state.name}!</h1>`;
  });
</script>
```

No bundler, no transpiler, no `node_modules` needed in the browser. DevTools show your exact source code because there is nothing to compile.
