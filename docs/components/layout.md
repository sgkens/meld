---
title: Layout
parent: Components
nav_order: 4
excerpt: Technical reference for the Meld.js layout components — m-stack, m-group, m-card, m-modal, m-drawer, and m-divider.
tags: [components, layout, flexbox, modal, drawer, grid]
category: Components
---

# Layout Components

Grid, flex box alignment helper systems, modal overlay panels, and drawer shells.

---

## 1. Stack Layout (`m-stack`)

Arranges children in a vertical column with uniform margins/gaps.

### Markup Example

```html
<m-stack gap="md">
  <div>Item One</div>
  <div>Item Two</div>
  <div>Item Three</div>
</m-stack>
```

### Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `gap` | `string` | `'sm'` | spacing size between child items: `'sm'`, `'md'`, or `'lg'`. |

---

## 2. Group Layout (`m-group`)

Arranges children horizontally in a flexbox row, wrapping automatically as necessary.

### Markup Example

```html
<m-group gap="sm">
  <m-button variant="primary">Accept</m-button>
  <m-button variant="secondary">Decline</m-button>
</m-group>
```

### Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `gap` | `string` | `'sm'` | spacing size between child items: `'sm'`, `'md'`, or `'lg'`. |

---

## 3. Card Element (`m-card`)

A bordered, elevated content panel with header and body areas.

### Markup Example

```html
<m-card>
  <span slot="header">Overview Card</span>
  <p>Standard descriptive card content goes here.</p>
</m-card>
```

---

## 4. Modal Overlay (`m-modal`)

A centered popup dialog that blocks background interactions.

### Markup Example

```html
<m-modal id="welcome-modal">
  <h3>Welcome Back</h3>
  <p>Click outside or click Close to dismiss.</p>
  <m-button onclick="document.getElementById('welcome-modal').close()">Close</m-button>
</m-modal>
```

---

## 5. Sidebar Drawer (`m-drawer`)

An overlay panel that slides in from the right or left edge of the screen.

### Markup Example

```html
<m-drawer id="cart-drawer" position="right">
  <h3>Shopping Cart</h3>
  <p>Items in cart:</p>
</m-drawer>
```

### Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `position` | `string` | `'right'` | Edge slide direction: `'left'` or `'right'`. |
| `open` | `boolean` | `false` | Visually opens the drawer. |
