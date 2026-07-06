---
title: Inputs
parent: Components
nav_order: 2
excerpt: Technical reference for the Meld.js form and input components — m-button, m-input, m-select, and m-switch.
tags: [components, input, form, button, switch, select]
category: Components
---

# Form & Input Components

Interactive form controls designed to collect user input.

---

## 1. Button (`m-button`)

The standard button control. Supports different visual variants and custom disabled states.

### Markup Example

```html
<m-button variant="primary">Submit</m-button>
<m-button variant="secondary" disabled>Cancel</m-button>
```

### Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `string` | `'secondary'` | Visual style: `'primary'`, `'secondary'`, `'danger'`, or `'ghost'`. |
| `disabled` | `boolean` | `false` | Disables user interaction and applies muted opacity. |

---

## 2. Text Input (`m-input`)

A fully styled text input field supporting reactive labels and placeholders.

### Markup Example

```html
<m-input 
  label="Username" 
  placeholder="Enter username..." 
  value=""
></m-input>
```

### Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | `''` | Text displayed above the input. |
| `placeholder` | `string` | `''` | Shadow helper text inside the input. |
| `value` | `string` | `''` | Current text value. Emits `input` event on change. |
| `type` | `string` | `'text'` | Input type (e.g. `'text'`, `'password'`, `'email'`). |

---

## 3. Dropdown Select (`m-select`)

A native styled select field.

### Markup Example

```html
<m-select label="Choose Role">
  <option value="admin">Administrator</option>
  <option value="editor">Editor</option>
  <option value="user">Standard User</option>
</m-select>
```

### Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | `''` | Heading label for the select element. |
| `value` | `string` | `''` | Selected option value. |

---

## 4. Toggle Switch (`m-switch`)

A boolean switch checkbox.

### Markup Example

```html
<m-switch label="Enable notifications" checked></m-switch>
```

### Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | `''` | Label text positioned beside the switch. |
| `checked` | `boolean` | `false` | Reactive boolean state of the switch. |
