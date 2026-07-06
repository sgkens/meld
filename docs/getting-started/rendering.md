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

 Important: Always use meld.list for arrays. Using .map() directly will replace DOM nodes on every update, causing input focus loss.


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
<div class="${meld.css({ 
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