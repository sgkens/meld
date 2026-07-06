---
title: Core API Reference
nav_order: 3
---

# Core API Reference: State, Components, & Lifecycle

This page details the foundational functions of Meld, exported from `meld.core.js`. Use the category filter chips below to show only specific modules of the runtime.

<div class="api-filter-row">
  <div class="api-chip is-active" data-filter="all" style="background:var(--text-main); border-color:var(--text-main); color:var(--bg-main);">All</div>
  <div class="api-chip" data-filter="core"><span class="dot" style="background:var(--c-core)"></span>Reactivity</div>
  <div class="api-chip" data-filter="dom"><span class="dot" style="background:var(--c-dom)"></span>DOM &amp; Templating</div>
  <div class="api-chip" data-filter="lifecycle"><span class="dot" style="background:var(--c-lifecycle)"></span>Lifecycle</div>
  <div class="api-chip" data-filter="context"><span class="dot" style="background:var(--c-context)"></span>Context / DI</div>
</div>

<!-- defineMeld -->
<section class="api-entry" id="defineMeld" data-category="dom">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-dom-soft); color:var(--c-dom);">dom</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-dom);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-dom);">defineMeld</span><span class="fn-punct">(</span><span class="fn-param">tagName, setupFn</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>void</div>
  </div>
  <p class="api-entry-desc">Registers a component as a native Custom Element (Web Component) in the global custom registry.</p>

  <div class="api-subhead">Parameters</div>
  <table class="api-params">
    <thead>
      <tr><th>Name</th><th>Type</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td class="pname">tagName</td><td class="ptype">string</td><td class="pdesc">The kebab-case name for the custom element (must contain a hyphen, e.g. <code>my-counter</code>).</td></tr>
      <tr><td class="pname">setupFn</td><td class="ptype">Function</td><td class="pdesc">The setup function execution logic. Receives <code>(element, { emit, inject })</code>. Returns the template literal fragment or element representation.</td></tr>
    </tbody>
  </table>

  <div class="api-subhead">Example</div>
  <pre class="language-javascript"><code class="language-javascript">defineMeld('user-card', (el, { emit }) => {
  return meldHtml`
    <div class="card">
      <button onclick="${() => emit('click')}">Click Me</button>
    </div>
  `;
});</code></pre>

  <div class="api-see-also">
    <a href="#onMount">onMount</a>
    <a href="#onDestroy">onDestroy</a>
  </div>
</section>

<!-- meldState -->
<section class="api-entry" id="meldState" data-category="core">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-core-soft); color:var(--c-core);">reactivity</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-core);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-core);">meldState</span><span class="fn-punct">(</span><span class="fn-param">initialObject</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>Proxy</div>
  </div>
  <p class="api-entry-desc">Creates the core reactive state object. Any mutations made to properties on the returned Proxy will automatically trigger updates to affected DOM nodes.</p>

  <div class="api-subhead">Parameters</div>
  <table class="api-params">
    <thead>
      <tr><th>Name</th><th>Type</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td class="pname">initialObject</td><td class="ptype">Object</td><td class="pdesc">A plain JavaScript object containing the properties that should be made reactive.</td></tr>
    </tbody>
  </table>

  <div class="api-subhead">Returns</div>
  <p class="api-entry-desc">A deep Proxy wrapping the initial object, enabling granular dependency tracking and reactivity.</p>

  <div class="api-subhead">Example</div>
  <pre class="language-javascript"><code class="language-javascript">const state = meldState({ count: 0, theme: 'dark' });

// Mutating state triggers reactives updates
state.count++;</code></pre>

  <div class="api-see-also">
    <a href="#computed">computed</a>
  </div>
</section>

<!-- computed -->
<section class="api-entry" id="computed" data-category="core">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-core-soft); color:var(--c-core);">reactivity</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-core);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-core);">computed</span><span class="fn-punct">(</span><span class="fn-param">getterFn</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>ReadonlySignal</div>
  </div>
  <p class="api-entry-desc">Creates a derived, cached, read-only value. The getter only recalculates if the reactive signals accessed within it undergo changes.</p>

  <div class="api-subhead">Parameters</div>
  <table class="api-params">
    <thead>
      <tr><th>Name</th><th>Type</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td class="pname">getterFn</td><td class="ptype">Function</td><td class="pdesc">A function returning the computed value. Any reactive state properties accessed during execution are tracked.</td></tr>
    </tbody>
  </table>

  <div class="api-subhead">Example</div>
  <pre class="language-javascript"><code class="language-javascript">const state = meldState({ firstName: 'Ada', lastName: 'Lovelace' });
const fullName = computed(() => `${state.firstName} ${state.lastName}`);

// Accessing fullName caches the result
console.log(fullName.value); // "Ada Lovelace"</code></pre>

  <div class="api-see-also">
    <a href="#meldState">meldState</a>
  </div>
</section>

<!-- onMount -->
<section class="api-entry" id="onMount" data-category="lifecycle">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-lifecycle-soft); color:var(--c-lifecycle);">lifecycle</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-lifecycle);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-lifecycle);">onMount</span><span class="fn-punct">(</span><span class="fn-param">fn</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>void</div>
  </div>
  <p class="api-entry-desc">Registers a lifecycle hook that executes immediately after the current component custom element is connected to the DOM.</p>

  <div class="api-subhead">Parameters</div>
  <table class="api-params">
    <thead>
      <tr><th>Name</th><th>Type</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td class="pname">fn</td><td class="ptype">Function</td><td class="pdesc">Callback logic containing setup steps (e.g., event listeners, timers).</td></tr>
    </tbody>
  </table>

  <div class="api-subhead">Example</div>
  <pre class="language-javascript"><code class="language-javascript">defineMeld('timer-widget', () => {
  onMount(() => {
    console.log('Timer element connected!');
  });
});</code></pre>

  <div class="api-see-also">
    <a href="#onDestroy">onDestroy</a>
  </div>
</section>

<!-- onDestroy -->
<section class="api-entry" id="onDestroy" data-category="lifecycle">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-lifecycle-soft); color:var(--c-lifecycle);">lifecycle</span>
    <span class="api-since">since v1.0.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-lifecycle);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-lifecycle);">onDestroy</span><span class="fn-punct">(</span><span class="fn-param">fn</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>void</div>
  </div>
  <p class="api-entry-desc">Registers a lifecycle hook that executes immediately after the current component is disconnected from the DOM. Use to release resources and prevent memory leaks.</p>

  <div class="api-subhead">Parameters</div>
  <table class="api-params">
    <thead>
      <tr><th>Name</th><th>Type</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td class="pname">fn</td><td class="ptype">Function</td><td class="pdesc">Callback containing cleanup logic (e.g., clearing intervals, removing global events).</td></tr>
    </tbody>
  </table>

  <div class="api-see-also">
    <a href="#onMount">onMount</a>
  </div>
</section>

<!-- provide -->
<section class="api-entry" id="provide" data-category="context">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-context-soft); color:var(--c-context);">context</span>
    <span class="api-since">since v1.1.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-context);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-context);">provide</span><span class="fn-punct">(</span><span class="fn-param">key, value</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>void</div>
  </div>
  <p class="api-entry-desc">Shares a dependency value down the component tree. Any descendant component can retrieve this value via <code>inject</code> using the matching key.</p>

  <div class="api-subhead">Parameters</div>
  <table class="api-params">
    <thead>
      <tr><th>Name</th><th>Type</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td class="pname">key</td><td class="ptype">string | Symbol</td><td class="pdesc">Identifier for the dependency.</td></tr>
      <tr><td class="pname">value</td><td class="ptype">any</td><td class="pdesc">The value or reactive state to distribute.</td></tr>
    </tbody>
  </table>

  <div class="api-subhead">Example</div>
  <pre class="language-javascript"><code class="language-javascript">defineMeld('theme-provider', () => {
  const config = meldState({ theme: 'blue' });
  provide('theme-config', config);
});</code></pre>

  <div class="api-see-also">
    <a href="#inject">inject</a>
  </div>
</section>

<!-- inject -->
<section class="api-entry" id="inject" data-category="context">
  <div class="api-entry-tags">
    <span class="api-tag-pill" style="background:var(--c-context-soft); color:var(--c-context);">context</span>
    <span class="api-since">since v1.1.0</span>
  </div>
  <div class="api-signature" style="border-left: 4px solid var(--c-context);">
    <div class="api-signature-call"><span class="fn-name" style="color:var(--c-context);">inject</span><span class="fn-punct">(</span><span class="fn-param">key, defaultValue?</span><span class="fn-punct">)</span></div>
    <div class="api-return-pill"><span class="arrow">→</span>any</div>
  </div>
  <p class="api-entry-desc">Injects a dependency provided by an ancestor component. If the key is not found, the optional default value is returned.</p>

  <div class="api-subhead">Parameters</div>
  <table class="api-params">
    <thead>
      <tr><th>Name</th><th>Type</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td class="pname">key</td><td class="ptype">string | Symbol</td><td class="pdesc">Identifier of the provided value.</td></tr>
      <tr><td class="pname">defaultValue<span class="api-optional-flag">?</span></td><td class="ptype">any</td><td class="pdesc">Fallback value if the provider was not found up the tree.</td></tr>
    </tbody>
  </table>

  <div class="api-subhead">Example</div>
  <pre class="language-javascript"><code class="language-javascript">defineMeld('themed-button', (el, { inject }) => {
  const theme = inject('theme-config', { theme: 'gray' });
  return meldHtml`<button style="color: ${() => theme.theme}">Styled Button</button>`;
});</code></pre>

  <div class="api-see-also">
    <a href="#provide">provide</a>
  </div>
</section>
