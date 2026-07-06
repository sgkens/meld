---
title: Building Plugins
nav_order: 11
---

# Building Plugins: Extending Meld

The plugin system is simple and powerful. A plugin is just an object with an `install` method.

## The Plugin Contract

Your plugin object must export an `install` function that receives the core API context.

```javascript
export const MyCustomPlugin = {
  // Required property
  name: 'MyCustomPlugin', 
  
  /**    * @param {object} api - Contains all core functions (defineMeld, meldState, etc.)
   * @param {object} options - Configuration passed via use(Plugin, options)
   */
  install(api, options) {
    console.log('Plugin installed with options:', options);

    // 1. Extend the global namespace (e.g., add a utility)
    api.myCustomHelper = (data) => console.log('Processing:', data);
    
    // 2. Wrap a core function (e.g., adding logic to defineMeld)
    const originalDefine = api.defineMeld;
    api.defineMeld = (tagName, setupFn) => {
      // Add custom tracking here before calling the original function
      console.log(`Defining: ${tagName}`); 
      originalDefine(tagName, setupFn);
    };

    // 3. Define a new Component (e.g., a modal)
    api.defineMeld('my-modal', () => { /* ... */ });
  }
};
```

|Type|How it Hooks|Example|
|---|---|---|
|Utility|Extends the `api` context (e.g.,` api.myCustomHelper`).|`meld-a11y`, `meld-query`|
|Component|Uses `api.defineMeld` to introduce new reusable tags.| `meld-router` (`<meld-view>`), `<meld-portal>`.|
|Middleware|Overwrites and wraps a core function (e.g., `api.defineMeld = (old) => { ... }`).|***meld-versioning*** (wraps `defineMeld`).|