---
title: Vue + Meld Integration
nav_order: 2
parent: Stacks
excerpt: Use Meld.js custom elements inside a Vue 3 application. Covers Vite compiler config, import patterns, property passing, and shared reactive state between Vue and Meld.
tags: [vue, vite, custom-elements, integration, stack]
category: Stacks
---

# Vue + Meld Integration

Meld components are standards-compliant Custom Elements (Web Components). Vue 3 supports custom elements natively, but the Vue template compiler must be told which tags to treat as custom elements rather than attempting to resolve them as Vue component imports. This page covers the full setup for a Vue + Meld project.

---

## Prerequisites

- Node.js 18+
- A Vue 3 project scaffolded with Vite (`npm create vue@latest`)
- Meld.js installed in the same project or loaded as an ES module

```bash
npm install @meldjs/meld
```

---

## 1. Vite / Vue Compiler Configuration

Tell the Vue compiler to pass any hyphenated tag through to the DOM without treating it as a Vue component. Add the `isCustomElement` compiler option in `vite.config.js`:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // All tags containing a hyphen are treated as native custom elements.
          // Vue will not attempt to resolve them from the component registry.
          isCustomElement: (tag) => tag.includes('-'),
        },
      },
    }),
  ],
});
```

Without this config, Vue will emit a runtime warning for every unrecognised tag and may suppress attribute binding.

---

## 2. Registering Meld Components

Import the Meld component file in the Vue entry point or directly in the Single File Component (SFC) that uses it. The import executes `customElements.define()` as a side effect.

```javascript
// src/main.js
import { createApp } from 'vue';
import App from './App.vue';

// Import Meld component definitions before mounting Vue.
// Each import registers the custom element with the browser's CustomElementRegistry.
import './meld/meld-data-table.js';
import './meld/meld-status-badge.js';

createApp(App).mount('#app');
```

Alternatively, import inside an individual SFC `<script setup>` block when the component is only used in one place:

```html
<!-- src/components/ReportView.vue -->
<script setup>
import '../meld/meld-data-table.js';
import { ref, onMounted } from 'vue';

const rows = ref([]);

onMounted(async () => {
  const res = await fetch('/api/report');
  rows.value = await res.json();
});
</script>

<template>
  <section>
    <h2>Monthly Report</h2>
    <meld-data-table :rows="rows" />
  </section>
</template>
```

> **Note:** Vue binds object and array props with `:prop="value"` (v-bind). The Meld element receives the live JavaScript value, not a serialised string, because Vue sets the DOM property directly when the binding is an object type.

---

## 3. Passing Attributes vs. Properties

Vue distinguishes between HTML attributes (strings) and DOM properties (any JS value). The colon prefix (`:`) forces property binding.

| Binding syntax       | Meld receives        | Use when                        |
| :------------------- | :------------------- | :------------------------------ |
| `label="Static"`     | String attribute     | Primitive string values         |
| `:count="count"`     | JS number/ref value  | Reactive primitives             |
| `:items="itemsList"` | JS array reference   | Arrays and objects              |
| `@meld-change="fn"`  | DOM CustomEvent      | Listening to Meld-emitted events|

```html
<template>
  <meld-status-badge
    label="Connection"
    :status="connectionStatus"
    @meld-status-change="onStatusChange"
  />
</template>

<script setup>
import '../meld/meld-status-badge.js';
import { ref } from 'vue';

const connectionStatus = ref('idle');

function onStatusChange(event) {
  // event.detail contains the payload dispatched by the Meld component
  connectionStatus.value = event.detail.status;
}
</script>
```

---

## 4. Shared Reactive State

For state that must be shared between Vue components and Meld components without a full state library, use a plain reactive store exposed as an ES module singleton.

```javascript
// src/store/appState.js
import { reactive } from 'vue';

// Vue's reactive() creates a Proxy. Meld components can hold a reference
// to this object and read from it, but cannot use Vue's reactivity directly.
// Synchronise changes explicitly via events or watchers.
export const appState = reactive({
  currentUser: null,
  theme: 'light',
  notifications: [],
});
```

```javascript
// src/meld/meld-notification-bell.js
import { defineMeld, meldHtml } from '@meldjs/meld';

defineMeld('meld-notification-bell', (el, { signal, effect }) => {
  const count = signal(0);

  // Poll for updates pushed from the Vue store via a custom event
  el.addEventListener('update-count', (e) => {
    count.set(e.detail.count);
  });

  return meldHtml`
    <button class="bell">
      Notifications: ${count}
    </button>
  `;
});
```

```html
<!-- Vue SFC driving the Meld component -->
<script setup>
import '../meld/meld-notification-bell.js';
import { watch, ref } from 'vue';
import { appState } from '../store/appState.js';

const bellRef = ref(null);

// Keep the Meld component in sync by dispatching a DOM event when Vue state changes
watch(
  () => appState.notifications.length,
  (count) => {
    bellRef.value?.dispatchEvent(
      new CustomEvent('update-count', { detail: { count } })
    );
  }
);
</script>

<template>
  <meld-notification-bell ref="bellRef" />
</template>
```

---

## 5. Receiving Events from Meld Inside Vue

Meld components dispatch standard `CustomEvent` objects on the host element. Vue's `v-on` (`@`) directive listens to these directly:

```html
<template>
  <meld-data-table
    :rows="tableData"
    @row-selected="handleRowSelect"
    @sort-changed="handleSortChange"
  />
</template>

<script setup>
import '../meld/meld-data-table.js';
import { ref } from 'vue';

const tableData = ref([]);

function handleRowSelect(event) {
  console.log('Selected row:', event.detail.row);
}

function handleSortChange(event) {
  console.log('Sort column:', event.detail.column, 'Direction:', event.detail.direction);
}
</script>
```

---

## 6. Project Structure Reference

```text
/my-vue-meld-app
├── vite.config.js          # isCustomElement config required
├── src/
│   ├── main.js             # Global Meld imports
│   ├── App.vue
│   ├── meld/               # Meld component definitions
│   │   ├── meld-data-table.js
│   │   ├── meld-status-badge.js
│   │   └── meld-notification-bell.js
│   ├── components/         # Vue SFCs
│   │   └── ReportView.vue
│   └── store/
│       └── appState.js     # Shared reactive state
└── package.json
```

---

## Known Limitations

- Vue's `v-model` does not work on custom elements out of the box. Wire two-way binding manually using `:value` and `@input` (or equivalent Meld events).
- The Vue DevTools browser extension does not inspect Meld component internals. Use browser DevTools custom elements panel for Meld component inspection.
- SSR (Nuxt) requires Meld imports to be client-only. Wrap imports with `if (process.client)` or use Nuxt's `<ClientOnly>` component.
