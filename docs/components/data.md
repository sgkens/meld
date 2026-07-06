---
title: Data Display
parent: Components
nav_order: 5
excerpt: Technical reference for the Meld.js data components — m-table, m-toast, m-badge, m-avatar, and m-alert.
tags: [components, data, table, toast, alert, badge, avatar]
category: Components
---

# Data Display Components

Components designed to present complex datasets, notifications, and statuses.

---

## 1. Data Table (`m-table`)

A reactive data grid supporting auto-sorting and slot-based custom headers.

### Markup Example

```html
<m-table id="users-table"></m-table>

<script>
  const table = document.getElementById('users-table');
  table.columns = [
    { key: 'name', label: 'Full Name', sortable: true },
    { key: 'role', label: 'User Role' }
  ];
  table.data = [
    { id: 1, name: 'Alice Smith', role: 'Administrator' },
    { id: 2, name: 'Bob Johnson', role: 'Editor' }
  ];
</script>
```

### Attributes/Properties

| Field / Property | Type | Description |
| :--- | :--- | :--- |
| `columns` | `Array` | List of column definitions with schema: `{ key, label, sortable }`. |
| `data` | `Array` | Data array to render in table rows. |

---

## 2. Status Badge (`m-badge`)

A small pill-shaped chip indicating categories or statuses.

### Markup Example

```html
<m-badge variant="success">Active</m-badge>
<m-badge variant="warning">Pending</m-badge>
<m-badge variant="danger">Inactive</m-badge>
```

### Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `string` | `'info'` | Theme variant: `'success'`, `'warning'`, `'danger'`, or `'info'`. |

---

## 3. Alerts (`m-alert`)

Banner messages for highlighting inline notices or system warnings.

### Markup Example

```html
<m-alert variant="warning">
  You have unsaved changes. Please save before closing.
</m-alert>
```

### Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `string` | `'info'` | Theme variant: `'success'`, `'warning'`, `'danger'`, or `'info'`. |

---

## 4. Toast Controller (`m-toast`)

Fires non-blocking notification popups in the corner of the viewport.

### Markup Example

```html
<m-toast id="toast-manager"></m-toast>

<script>
  document.getElementById('toast-manager').show({
    message: 'Profile saved successfully!',
    variant: 'success',
    duration: 3000
  });
</script>
```
