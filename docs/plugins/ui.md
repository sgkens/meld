---
title: UI Patterns
parent: Plugin Ecosystem
nav_order: 3
excerpt: UI pattern plugins for complex DOM rendering, including meld-portal for modals and tooltips and meld-animate for transitions.
tags: [plugins, ui, portal, modal, tooltip, animation, shadow-dom]
category: Plugin Ecosystem
---

# UI Patterns & Interaction

Components that solve complex DOM rendering challenges.

## 1. Meld Portal (`meld-portal`)
**Purpose:**"Teleports" content outside the component's Shadow DOM to `document.body`. Essential for **Modals**, **Tooltips**, and **Dropdowns** to avoid `z-index` clipping.

### Example
```javascript
return meldHtml`
  <button onclick="${openModal}">Open</button>

  ${() => state.isOpen ? meldHtml`
    <meld-portal>
      <div class="modal-overlay">
        <div class="modal-box">
          <h2>I am on top!</h2>
        </div>
      </div>
    </meld-portal>
  ` : ''}
`;
````

-----

## 2\. Meld Skeleton (`meld-skeleton`)

**Purpose:** Prevents Layout Shift (CLS) by rendering animated placeholders while data loads.

### Props

  * `width`: CSS width (e.g., "100%", "50px").
  * `height`: CSS height.
  * `circle`: If present, renders as a circle (for avatars).

### Example

```html
<div class="card">
  <meld-skeleton width="50px" height="50px" circle></meld-skeleton>
  <meld-skeleton width="80%" height="20px"></meld-skeleton>
</div>
```

-----

## 3\. Meld Lazy (`meld-lazy`)

**Purpose:** Async component loader. Fetches the JavaScript file only when the element scrolls into view.

### Example

```html
<meld-lazy src="./components/heavy-chart.js" tag="heavy-chart">
  <div slot="loading">Loading Chart...</div>
</meld-lazy>
```

-----

## 4\. Meld Upload (`meld-upload`)

**Purpose:** Drag-and-drop file upload zone.

### Events

  * `file-selected`: Emits the native `File` object.

### Example

```javascript
const handleFile = (e) => {
  const file = e.detail;
  console.log(`Uploading ${file.name} (${file.size} bytes)`);
};

return meldHtml`
  <meld-upload onfile-selected="${handleFile}"></meld-upload>
`;
```

-----

## 5\. Meld Terminal (`meld-terminal`)

**Purpose:** A console-like UI for displaying backend logs or executing commands.

### Methods

  * `el.pushLine(text)`: Adds a line to the display.

### Example

```javascript
const term = el.shadowRoot.querySelector('meld-terminal');
term.pushLine('> Connecting to server...');
```