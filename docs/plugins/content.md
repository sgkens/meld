---
title: Content & Forms
parent: Plugin Ecosystem
nav_order: 4
---

# Content & Formatting

Helpers for rendering text, time, and handling user input.

## 1. Meld Markdown (`meld-markdown`)
**Purpose:** Renders Markdown strings as HTML securely.

### Example
```html
<meld-markdown content="# Welcome\nThis is **bold** text."></meld-markdown>
````

-----

## 2\. Meld Time (`meld-time`)

**Purpose:** Lightweight date formatting using `Intl.DateTimeFormat`. 0kb alternative to Moment.js.

### API Reference

  * `api.time.format(date, style)`
      * `style`: `'short'`, `'medium'`, `'long'`, or `'relative'`.

### Example

```javascript
// Relative time (e.g., "5 mins ago")
<meld-time date="${post.createdAt}" format="relative"></meld-time>

// Standard date (e.g., "Jan 1, 2024")
<meld-time date="${post.createdAt}" format="medium"></meld-time>
```

-----

## 3\. Meld Forms (`meld-forms`)

**Purpose:** Hook for managing form state, validation, and submission.

### Usage

```javascript
defineMeld('login-form', (el, { useForm }) => {
  const { fields, errors, handleSubmit } = useForm(
    { email: '', password: '' }, // Initial State
    { email: ['required'], password: ['required'] } // Validation Rules
  );

  const onSubmit = (data) => {
    console.log("Valid Data:", data);
  };

  return meldHtml`
    <form onsubmit="${handleSubmit(onSubmit)}">
      <input 
        value="${() => fields.email}" 
        oninput="${(e) => fields.email = e.target.value}" 
        class="${() => errors.email ? 'invalid' : ''}"
      />
      <span class="error">${() => errors.email}</span>
      
      <button>Login</button>
    </form>
  `;
});
```