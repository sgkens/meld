---
title: The Plugin Ecosystem
parent: Architecture
description: A deep dive into the plugin ecosystem of Meld, including routing, state management, and developer tools.
nav_order:  6
excerpt: Overview of Meld.js plugin architecture — a tiny core (<2kb) extended by opt-in plugins for routing, state, forms, WebSocket, and developer tooling.
tags: [plugins, architecture, ecosystem]
category: Architecture
---

# The Meld Ecosystem

Meld adheres to a "Core + Plugins" architecture. The core engine is tiny (<2kb), while plugins provide the specialized features needed for complex applications.

To use any plugin:
```javascript
import { use } from './meld.core.js';
import { MeldRouter } from './plugins/meld-router.js';

use(MeldRouter, { ...options });
````

-----

## 1\. Architecture & State

Essential tools for structuring Single Page Applications (SPAs).

### `meld-router`

**Client-Side Routing.** Enables hash-based routing (`#/about`) for SPAs.

  *  **Setup:** `use(MeldRouter, { routes: [{ path: '/', component: 'home-page' }] })`
  *  **Usage:** Place `<meld-view></meld-view>` where content should appear.

### `meld-store`

**Global State Management.** A centralized store pattern (Redux-lite) for app-wide data.

  *  **Usage:** Creates a singleton reactive state accessible via `import { store } from './store.js'`.

### `meld-microbus`

**Event Bus.** Decoupled Pub/Sub messaging for components that do not share a parent/child relationship.

  * **API:** `Microbus.publish('topic', data)` / `Microbus.subscribe('topic', fn)`

### `meld-head`

**SEO & Meta Management.** Manages `<title>` and `<meta>` tags dynamically.

  * **API:** `useHead(() => ({ title: 'My Page', meta: [...] }))`

-----

## 2\. Data & Networking

Tools for talking to servers, managing APIs, and persisting data.

### `meld-query`

**Reactive Data Fetching.** Standard wrapper for `fetch`. Handles `loading`, `error`, and `data` states automatically.

  * **API:** `const query = useQuery('/api/user')`

### `meld-quiver`

**Advanced API Manager.** A wrapper for the Quiver isomorphic client (or similar Axios/Ky instances) injected via Context.

  * **API:** `const api = useQuiver()` (Access global configured client).

### `meld-socket`

**Managed WebSocket Connections.** Provides reactive connection state, reconnects, heartbeat, channel subscriptions, queued sends, and request-response correlation.

  * **API:** `const socket = useSocket('wss://api.example.com/ws')`

### `meld-persist`

**Local Storage Sync.** Automatically saves reactive state to `localStorage` or `sessionStorage`.

  * **API:** `const state = persist(meldState({...}), 'storage-key')`

### `meld-cookie`

**Cookie Management.** Simple utility to read, write, and delete browser cookies reactive-style.

  * **API:** `cookie.set('token', '123')`, `cookie.get('token')`

-----

## 3\. UI Patterns & Interaction

Components that solve complex DOM challenges.

### `meld-portal`

**Teleportation.** Moves content out of the Shadow DOM to `document.body` (essential for Modals/Tooltips).

  *  **Usage:** `<meld-portal><div class="modal">...</div></meld-portal>`

### `meld-skeleton`

**Loading States.** Renders an animated shimmer effect to prevent Content Layout Shift (CLS) while data loads.

  *  **Usage:** `<meld-skeleton width="100%" height="20px"></meld-skeleton>`

### `meld-lazy`

**Code Splitting.** Loads a component's JavaScript file only when the element scrolls into view.

  *  **Usage:** `<meld-lazy src="./heavy-widget.js" tag="heavy-widget"></meld-lazy>`

### `meld-upload`

**File Management.** Drag-and-drop zone that emits standard `File` objects.

  *  **Usage:** `<meld-upload onfile-selected="${handleFile}"></meld-upload>`

### `meld-download`

**File Export.** Utility to trigger browser downloads from Blobs or Strings without DOM hacks.

  * **API:** `download(blob, 'report.pdf')`

### `meld-terminal`

**Backend UI.** A console-like component for streaming logs or executing commands (e.g., for SSH/Docker tools).

  *  **Usage:** `<meld-terminal oncommand="${sendToBackend}"></meld-terminal>`

-----

## 4\. Content & Formatting

Helpers for rendering text and data.

### `meld-markdown`

**Rich Text.** Renders Markdown strings into safe HTML.

  *  **Usage:** `<meld-markdown content="# Hello World"></meld-markdown>`

### `meld-time`

**Date Formatting.** Lightweight wrapper around `Intl.DateTimeFormat` (Day.js alternative).

  * **API:** `time.format(new Date(), 'relative')` ("2 mins ago")
  *  **Component:** `<meld-time date="..." format="short"></meld-time>`

### `meld-forms`

**Form Validation.** Hook for managing form state, dirty checking, and validation rules.

  * **API:** `const { fields, errors, handleSubmit } = useForm({ email: '' })`

-----

## 5\. Developer Experience (DX) & Quality

Tools to ensure your code is robust and debuggable.

### `meld-devtools`

**Visual Debugging.** Flashes components in the browser when they re-render. Logs lifecycle events to the console.

  *  **Usage:** Enabled automatically in `npx meld-artisan serve` development mode.

### `meld-logger`

**Structured Logging.**
A logging utility that supports namespaces and log levels. Can be hooked into external services.

  * **API:** `const log = useLog('AuthComponent'); log.info('Login success');`

### `meld-diagnostics`

**Diagnostics Initialization.**
Installs the diagnostics plugin and writes an initialization message to the console.

  * **Usage:** `use(MeldDiagnostics)`

### `meld-test-utils`

**Unit Testing.** Helpers to mount components and query Shadow DOM in Jest/Vitest environments.

  * **API:** `render(TagName, props)`, `shadowQuery(selector)`

### `meld-a11y`

**Accessibility.** Utilities for screen readers and keyboard navigation.

  * **API:** `trapFocus(el)`, `announce(message)`

### `meld-versioning`

**Deployment Tracking.** Tags every component instance with its version number in the DOM (`data-meld-version`).

  *  **Usage:** Automatic. Essential for debugging Micro-Frontend deployments.

-----

```
```
