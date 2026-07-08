---
title: Strict API Reference
nav_order: 10
templateEngineOverride: njk,md
excerpt: Canonical technical reference for the Meld.js public runtime API, covering reactivity, DOM templating, lifecycle hooks, and context/dependency injection.
tags: [api, reference, defineMeld, meldState, meldHtml, lifecycle, context]
category: Docs
---

# Strict API Reference

This page provides the canonical technical reference for the public Meld runtime API.

<div class="api-filter-row">
  <div class="api-chip is-active" data-filter="all" style="background:var(--text-main); border-color:var(--text-main); color:var(--bg-main);">All</div>
  <div class="api-chip" data-filter="core"><span class="dot" style="background:var(--c-core)"></span>Reactivity</div>
  <div class="api-chip" data-filter="dom"><span class="dot" style="background:var(--c-dom)"></span>DOM &amp; Templating</div>
  <div class="api-chip" data-filter="lifecycle"><span class="dot" style="background:var(--c-lifecycle)"></span>Lifecycle</div>
  <div class="api-chip" data-filter="context"><span class="dot" style="background:var(--c-context)"></span>Context / DI</div>
</div>

<section class="api-entry" id="defineMeld" data-category="dom">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-dom-soft); color:var(--c-dom);">dom</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-dom);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-dom);">defineMeld</span><span class="fn-punct">(</span><span class="fn-param">tagName, setupFn</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">-></span>void</div>
  </div>
  <p class="api-entry-desc">Registers a component as a native custom element.</p>
  <div class="api-subhead">Parameters</div>
  <table class="api-params"><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>
    <tr><td class="pname">tagName</td><td class="ptype">string</td><td class="pdesc">Kebab-case custom element name, such as <code>task-counter</code>.</td></tr>
    <tr><td class="pname">setupFn</td><td class="ptype">Function</td><td class="pdesc">Setup function receiving <code>(element, context)</code>. It may return a <code>DocumentFragment</code> or nothing.</td></tr>
  </tbody></table>
  <div class="api-subhead">Example</div>
</section>

```javascript
defineMeld('user-card', (el, { emit }) => {
  return meldHtml`
    <button onclick="${() => emit('select')}">
      Select user
    </button>
  `;
});
```

<section class="api-entry" id="meldState" data-category="core">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-core-soft); color:var(--c-core);">reactivity</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-core);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-core);">meldState</span><span class="fn-punct">(</span><span class="fn-param">initialObject</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">-></span>Proxy</div>
  </div>
  <p class="api-entry-desc">Creates a reactive proxy. Mutations on the returned object rerun dependent template effects.</p>
  <div class="api-subhead">Parameters</div>
  <table class="api-params"><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>
    <tr><td class="pname">initialObject</td><td class="ptype">object</td><td class="pdesc">Initial state object to wrap.</td></tr>
  </tbody></table>
  <div class="api-subhead">Example</div>
</section>

```javascript
const state = meldState({ count: 0 });
state.count += 1;
```

<section class="api-entry" id="computed" data-category="core">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-core-soft); color:var(--c-core);">reactivity</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-core);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-core);">computed</span><span class="fn-punct">(</span><span class="fn-param">getterFn</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">-></span>() =&gt; any</div>
  </div>
  <p class="api-entry-desc">Creates a derived reactive value returned as a getter function.</p>
  <div class="api-subhead">Parameters</div>
  <table class="api-params"><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>
    <tr><td class="pname">getterFn</td><td class="ptype">Function</td><td class="pdesc">Function that reads reactive state and returns the derived value.</td></tr>
  </tbody></table>
  <div class="api-subhead">Example</div>
</section>

```javascript
const fullName = computed(() => `${state.first} ${state.last}`);
console.log(fullName());
```

<section class="api-entry" id="meldHtml" data-category="dom">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-dom-soft); color:var(--c-dom);">dom</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-dom);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-dom);">meldHtml</span><span class="fn-punct">(</span><span class="fn-param">strings, ...values</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">-></span>DocumentFragment</div>
  </div>
  <p class="api-entry-desc">Tagged template processor for reactive DOM, event handlers, refs, attributes, and dynamic nodes.</p>
  <div class="api-subhead">Parameters</div>
  <table class="api-params"><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>
    <tr><td class="pname">strings</td><td class="ptype">TemplateStringsArray</td><td class="pdesc">Static template string segments.</td></tr>
    <tr><td class="pname">...values</td><td class="ptype">any[]</td><td class="pdesc">Dynamic values, functions, event handlers, refs, or fragments.</td></tr>
  </tbody></table>
  <div class="api-subhead">Style Object Bindings</div>
  <p class="api-entry-desc">
    When binding to the <code>style</code> attribute, <code>meldHtml</code> supports standard style strings, static style objects, or reactive functions returning style objects. Object keys are diffed property-by-property at high speed. CSS Custom Properties (Variables) prefixed with <code>--</code> are reactively set or removed using native CSS variables APIs:
  </p>
  <pre><code class="language-javascript">return meldHtml`
  &lt;div style="${() => ({ 
    color: state.active ? 'var(--primary)' : 'var(--text)', 
    '--opacity-val': state.opacity,
    display: state.visible ? 'block' : 'none'
  })}"&gt;Content&lt;/div&gt;
`;</code></pre>

  <div class="api-subhead">Example</div>
</section>

```javascript
return meldHtml`
  <span>${() => state.count}</span>
  <button onclick="${() => state.count++}">+</button>
`;
```

<section class="api-entry" id="onMount" data-category="lifecycle">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-lifecycle-soft); color:var(--c-lifecycle);">lifecycle</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-lifecycle);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-lifecycle);">onMount</span><span class="fn-punct">(</span><span class="fn-param">fn</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">-></span>void</div>
  </div>
  <p class="api-entry-desc">Registers a hook that runs after the current component connects to the DOM.</p>
  <div class="api-subhead">Parameters</div>
  <table class="api-params"><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>
    <tr><td class="pname">fn</td><td class="ptype">Function</td><td class="pdesc">Callback to run on connection.</td></tr>
  </tbody></table>
</section>

<section class="api-entry" id="onDestroy" data-category="lifecycle">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-lifecycle-soft); color:var(--c-lifecycle);">lifecycle</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-lifecycle);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-lifecycle);">onDestroy</span><span class="fn-punct">(</span><span class="fn-param">fn</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">-></span>void</div>
  </div>
  <p class="api-entry-desc">Registers a hook that runs after the current component disconnects from the DOM.</p>
  <div class="api-subhead">Parameters</div>
  <table class="api-params"><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>
    <tr><td class="pname">fn</td><td class="ptype">Function</td><td class="pdesc">Cleanup callback for timers, listeners, or external resources.</td></tr>
  </tbody></table>
</section>

<section class="api-entry" id="provide" data-category="context">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-context-soft); color:var(--c-context);">context</span>
    <span class="api-since">since v1.1.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-context);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-context);">provide</span><span class="fn-punct">(</span><span class="fn-param">key, value</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">-></span>void</div>
  </div>
  <p class="api-entry-desc">Stores a context value on the current component for descendant lookup.</p>
  <div class="api-subhead">Parameters</div>
  <table class="api-params"><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>
    <tr><td class="pname">key</td><td class="ptype">string</td><td class="pdesc">Context identifier.</td></tr>
    <tr><td class="pname">value</td><td class="ptype">any</td><td class="pdesc">Value to provide.</td></tr>
  </tbody></table>
</section>

<section class="api-entry" id="inject" data-category="context">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-context-soft); color:var(--c-context);">context</span>
    <span class="api-since">since v1.1.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-context);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-context);">inject</span><span class="fn-punct">(</span><span class="fn-param">key, defaultValue?</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">-></span>any</div>
  </div>
  <p class="api-entry-desc">Reads a provided context value from an ancestor component, or returns a default.</p>
  <div class="api-subhead">Parameters</div>
  <table class="api-params"><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>
    <tr><td class="pname">key</td><td class="ptype">string</td><td class="pdesc">Context identifier to resolve.</td></tr>
    <tr><td class="pname">defaultValue<span class="api-optional-flag">?</span></td><td class="ptype">any</td><td class="pdesc">Fallback if no provider is found.</td></tr>
  </tbody></table>
</section>

<section class="api-entry" id="use" data-category="dom">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-dom-soft); color:var(--c-dom);">plugin</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-dom);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-dom);">use</span><span class="fn-punct">(</span><span class="fn-param">plugin, options?</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">-></span>void</div>
  </div>
  <p class="api-entry-desc">Installs a Meld plugin once and passes it the core API plus optional configuration.</p>
  <div class="api-subhead">Parameters</div>
  <table class="api-params"><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>
    <tr><td class="pname">plugin</td><td class="ptype">object</td><td class="pdesc">Plugin object with an <code>install(api, options)</code> function.</td></tr>
    <tr><td class="pname">options<span class="api-optional-flag">?</span></td><td class="ptype">object</td><td class="pdesc">Plugin-specific options.</td></tr>
  </tbody></table>
</section>

<section class="api-entry" id="meldTheme" data-category="dom">
  <div class="api-entry-tags"><span class="api-tag-pill" style="background:var(--c-dom-soft); color:var(--c-dom);">dom</span><span class="api-since">since v1.3.0</span></div>
  <div class="api-signature" style="border-left: 4px solid var(--c-dom);"><div class="api-signature-call"><span class="fn-name" style="color:var(--c-dom);">meld.theme</span><span class="fn-punct">(</span><span class="fn-param">cssString</span><span class="fn-punct">)</span></div><div class="api-return-pill"><span class="arrow">-></span>void</div></div>
  <p class="api-entry-desc">Creates a constructable stylesheet and adopts it into Meld component shadow roots.</p>
</section>

<section class="api-entry" id="meldRaw" data-category="dom">
  <div class="api-entry-tags"><span class="api-tag-pill" style="background:var(--c-dom-soft); color:var(--c-dom);">dom</span><span class="api-since">since v1.0.0</span></div>
  <div class="api-signature" style="border-left: 4px solid var(--c-dom);"><div class="api-signature-call"><span class="fn-name" style="color:var(--c-dom);">meld.raw</span><span class="fn-punct">(</span><span class="fn-param">html</span><span class="fn-punct">)</span></div><div class="api-return-pill"><span class="arrow">-></span>{ __raw: string }</div></div>
  <p class="api-entry-desc">Marks trusted HTML so <code>meldHtml</code> inserts it without text escaping.</p>
</section>

<section class="api-entry" id="meldList" data-category="dom">
  <div class="api-entry-tags"><span class="api-tag-pill" style="background:var(--c-dom-soft); color:var(--c-dom);">dom</span><span class="api-since">since v1.2.0</span></div>
  <div class="api-signature" style="border-left: 4px solid var(--c-dom);"><div class="api-signature-call"><span class="fn-name" style="color:var(--c-dom);">meld.list</span><span class="fn-punct">(</span><span class="fn-param">items, keyFn, renderFn</span><span class="fn-punct">)</span></div><div class="api-return-pill"><span class="arrow">-></span>() =&gt; DocumentFragment</div></div>
  <p class="api-entry-desc">Returns a render function that reconciles array output by key and reuses existing nodes.</p>
</section>

<section class="api-entry" id="meldCss" data-category="dom">
  <div class="api-entry-tags"><span class="api-tag-pill" style="background:var(--c-dom-soft); color:var(--c-dom);">dom</span><span class="api-since">since v1.4.0</span></div>
  <div class="api-signature" style="border-left: 4px solid var(--c-dom);"><div class="api-signature-call"><span class="fn-name" style="color:var(--c-dom);">meld.css</span><span class="fn-punct">(</span><span class="fn-param">classes</span><span class="fn-punct">)</span></div><div class="api-return-pill"><span class="arrow">-></span>string</div></div>
  <p class="api-entry-desc">Builds a space-separated class string from an object of truthy class flags.</p>
</section>

<section class="api-entry" id="meldStyle" data-category="dom">
  <div class="api-entry-tags"><span class="api-tag-pill" style="background:var(--c-dom-soft); color:var(--c-dom);">dom</span><span class="api-since">since v1.4.0</span></div>
  <div class="api-signature" style="border-left: 4px solid var(--c-dom);"><div class="api-signature-call"><span class="fn-name" style="color:var(--c-dom);">meld.style</span><span class="fn-punct">(</span><span class="fn-param">styles</span><span class="fn-punct">)</span></div><div class="api-return-pill"><span class="arrow">-></span>string</div></div>
  <p class="api-entry-desc">Builds an inline style declaration string from a property-value object.</p>
</section>
