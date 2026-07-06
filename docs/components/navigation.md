---
title: Navigation
parent: Components
nav_order: 3
excerpt: Technical reference for the Meld.js navigation components — m-tabs, m-dropdown, and m-breadcrumb.
tags: [components, navigation, tabs, dropdown, breadcrumb]
category: Components
---

# Navigation Components

Wayfinding and layout controls designed to help users move through views.

---

## 1. Tabs Layout (`m-tabs`)

A tabbed interface control. Automatically toggles active panel contents.

### Markup Example

```html
<m-tabs>
  <div slot="tab" data-target="profile">Profile</div>
  <div slot="tab" data-target="settings">Settings</div>

  <div slot="panel" data-id="profile">
    <p>User profile information goes here.</p>
  </div>
  <div slot="panel" data-id="settings">
    <p>User preferences and configuration settings.</p>
  </div>
</m-tabs>
```

### Slots

| Slot Name | Description |
| :--- | :--- |
| `tab` | The clickable tab headers. Must have a `data-target` matching a panel's `data-id`. |
| `panel` | The contents of the tab panel. |

---

## 2. Breadcrumbs (`m-breadcrumb`)

Generates hierarchical paths for easy back-navigation.

### Markup Example

```html
<m-breadcrumb>
  <a href="/dashboard">Dashboard</a>
  <a href="/dashboard/settings">Settings</a>
  <span>Profile</span>
</m-breadcrumb>
```

---

## 3. Dropdown Menu (`m-dropdown`)

A button that reveals a floating popover action menu.

### Markup Example

```html
<m-dropdown label="Options">
  <a href="#edit">Edit Profile</a>
  <a href="#delete" style="color:var(--c-danger);">Delete Account</a>
</m-dropdown>
```

### Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | `''` | Trigger button text label. |
