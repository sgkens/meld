---
title: Component Library
nav_order: 1
excerpt: Introduction to the official Meld.js Component Library — 18 lightweight, native custom elements built directly into the core.
tags: [components, library, ui, controls, design-system]
category: Components
---

# Component Library

Meld.js includes **18 lightweight, native custom elements** directly in the core. Built using standard browser APIs, these components provide reactive states, slot-based nesting, and automatic theme adoption without any runtime dependency.

---

## Component Categorization

The library is organized into four modules:

| Module | Components | Description |
| :--- | :--- | :--- |
| **[Inputs](/components/inputs/)** | `m-button`, `m-input`, `m-select`, `m-switch` | Interactive form inputs and controllers. |
| **[Navigation](/components/navigation/)** | `m-tabs`, `m-dropdown`, `m-breadcrumb` | Wayfinding, tabs, and select dropdown overlays. |
| **[Layout](/components/layout/)** | `m-group`, `m-stack`, `m-divider`, `m-card`, `m-modal`, `m-drawer` | Flexbox alignments, grids, cards, and modal dialogs. |
| **[Data Display](/components/data/)** | `m-toast`, `m-avatar`, `m-table`, `m-badge`, `m-alert` | Lists, tables, profile icons, and system alerts. |

---

## 1. Zero-Compile Custom Elements

All Meld components are native Custom Elements. This means you do not need a compilation step (like JSX or Svelte templates) to use them. They can be parsed directly by any web browser:

```html
<m-stack gap="md">
  <m-card>
    <h3>User Login</h3>
    <m-input label="Email Address" type="email" placeholder="email@example.com"></m-input>
    <m-button variant="primary">Sign In</m-button>
  </m-card>
</m-stack>
```

---

## 2. Active Theme Integration

Components automatically inherit design tokens defined in the global stylesheet or `src/theme.js`. They read system variables such as:

* `--color-primary` & `--color-primary-hover`
* `--bg-panel` & `--bg-hover`
* `--border-color`
* `--font-sans` & `--font-mono`
* `--space-sm`, `--space-md`, `--space-lg`

To change the theme of all components globally, simply redefine these CSS variables on the `:root` element.
