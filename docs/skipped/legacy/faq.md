---
title: Frequently Asked Questions
nav_order: 12
---

# Frequently Asked Questions

Common questions about Meld's architecture and usage.

### `Q`: Why is there no `v-if` or `v-for`?

***Awnser***: Meld relies on native JavaScript features. You should use standard JavaScript ternary operators for conditionals and array methods (like `Array.prototype.map()`) combined with `meld.list` for loops.
```javascript
// Conditional Rendering
${() => state.user ? meldHtml`<h1>Welcome</h1>` : ''}

// Loop Rendering
${meld.list(array, keyFn, renderFn)}

```

### `Q`: Why does my component lose focus when I type?

***Awnser***: You are likely using JavaScript's .map() inside the template. This replaces the DOM element. Fix: Always wrap array rendering in meld.list(array, keyFn, renderFn). This utility ensures the existing input element is reused, preserving focus.


### `Q`: Can I use TypeScript with Meld?

***Awnser***: Yes. Since Meld uses pure JavaScript, TypeScript can be used for type checking the logic within your setupFn and meldState objects. Type definitions (.d.ts files) are planned for the v2.0 roadmap.

### `Q`: How do I manage external CSS like Tailwind?

***Awnser***: Use the meld.theme(cssString) utility in your main application entry file. This efficiently injects the global styles directly into the Shadow DOM of all components using adoptedStyleSheets.
### `Q`: Is Meld faster than React?

***Awnser***: Yes, in many contexts. Meld avoids the constant overhead of creating and comparing a Virtual DOM tree. When surgical updates are needed (which is most of the time), Meld is typically faster and requires far less memory than VDOM frameworks.