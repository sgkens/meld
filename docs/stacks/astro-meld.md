---
title: Astro + Meld Integration
nav_order: 4
parent: Stacks
excerpt: Use Meld.js as a client-side island framework within Astro pages. Covers script imports, client-side hydration strategy, is:inline usage, and partial hydration patterns.
tags: [astro, islands, hydration, custom-elements, integration, stack]
category: Stacks
---

# Astro + Meld Integration

Astro ships zero JavaScript by default and hydrates only the components that explicitly opt into client-side rendering (the "Islands Architecture"). Meld.js is a natural fit for this model: Meld components are Custom Elements that self-register and hydrate on the client without any framework runtime overhead. This page describes how to load and use Meld components inside Astro pages and layouts.

---

## Prerequisites

- Node.js 18+
- An Astro project (`npm create astro@latest`)
- Meld.js installed

```bash
npm install @meldjs/meld
```

---

## 1. Importing Meld in an Astro Page

Astro's `<script>` tag inside a `.astro` file is processed by Vite and bundled for the client. Import Meld component definitions there. The Astro frontmatter (`---` fences) runs only on the server, so Meld imports must be placed in `<script>`, not in frontmatter.

```astro
---
// src/pages/index.astro
// Frontmatter: server-side only. Do NOT import Meld here.
const pageTitle = "Dashboard";
const apiData = await fetch('https://api.example.com/stats').then(r => r.json());
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{pageTitle}</title>
  </head>
  <body>
    <h1>{pageTitle}</h1>

    <!--
      Meld component used as a regular HTML custom element.
      Astro renders this tag as static HTML; Meld hydrates it client-side.
    -->
    <meld-stat-card label="Total Users" value={apiData.totalUsers} />

    <script>
      // Client-side bundle: registers the custom element.
      import '../meld/meld-stat-card.js';
    </script>
  </body>
</html>
```

Astro deduplicates and bundles `<script>` imports across the page. Importing the same Meld file in multiple components will not duplicate the bundle entry.

---

## 2. is:inline for Unprocessed Script Tags

When you need a script to run exactly as written without Astro/Vite processing (e.g., loading Meld from a CDN URL), use the `is:inline` directive. Vite bundling does not apply to inline scripts.

```astro
<script is:inline type="module">
  // Loaded directly by the browser, not processed by Vite.
  // Use for CDN imports or when you need to control script placement precisely.
  import { defineMeld, meldHtml } from 'https://cdn.example.com/meldjs/meld.core.js';

  defineMeld('meld-hello', (el) => {
    return meldHtml`<span>Hello from an inline Meld component</span>`;
  });
</script>
```

> **Prefer the bundled import** (without `is:inline`) for production projects. The bundled approach enables tree-shaking, cache fingerprinting, and module deduplication.

---

## 3. Partial Hydration Strategy

Astro's partial hydration directives (`client:load`, `client:idle`, `client:visible`, etc.) apply to Astro/framework components, not to native custom elements. Meld custom elements hydrate themselves when the browser parses the tag; no Astro directive is needed or supported.

To control *when* Meld components initialise, use the `<script>` placement strategy:

**Hydrate immediately (equivalent to `client:load`):**

Place the `<script>` import in `<head>` or at the top of `<body>`.

```astro
<head>
  <script>
    import '../meld/meld-nav-bar.js'; // Registers before body renders
  </script>
</head>
```

**Hydrate after page load (equivalent to `client:idle`):**

Use a standard `defer`-equivalent pattern by placing the `<script>` at the end of `<body>`, or defer initialisation inside the module:

```astro
<body>
  <!-- Page content -->
  <meld-analytics-panel />

  <script>
    // Placed at bottom of body: runs after HTML is parsed.
    // Further defer with requestIdleCallback for non-critical components.
    import('../meld/meld-analytics-panel.js').then(() => {
      // Component is now registered and will hydrate.
    });
  </script>
</body>
```

**Hydrate when visible (equivalent to `client:visible`):**

Use an `IntersectionObserver` to defer the import until the element scrolls into view:

```astro
<meld-heavy-chart id="revenue-chart" data-src="../meld/meld-heavy-chart.js" />

<script>
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const src = entry.target.dataset.src;
        import(src); // Dynamic import triggers registration
        observer.unobserve(entry.target);
      }
    }
  });

  document.querySelectorAll('[data-src]').forEach((el) => observer.observe(el));
</script>
```

---

## 4. Passing Server Data to Meld Components

Astro fetches data in frontmatter (server-side). To pass that data into a Meld component's properties, set the attribute in the template for primitives, or write an inline script for objects and arrays.

```astro
---
// Frontmatter runs on the server
const products = await fetch('/api/products').then(r => r.json());
---

<!-- Primitive: use template expression directly as attribute -->
<meld-product-count total={products.length} />

<!--
  Object/array: serialise to JSON and write a script that sets the property
  imperatively after the element is registered.
-->
<meld-product-grid id="product-grid" />

<script define:vars={{ products }}>
  // define:vars injects the server variable into the client script scope.
  import('../meld/meld-product-grid.js').then(() => {
    const el = document.getElementById('product-grid');
    if (el) {
      el.items = products; // Set the JS property, not an attribute
    }
  });
</script>
```

The `define:vars` directive serialises the variable to JSON and injects it into the script scope. Only JSON-serialisable values are supported.

---

## 5. Using Meld Inside Astro Components

Astro components (`.astro` files) can include Meld custom elements just like any HTML page. Extract reusable Astro + Meld combinations into Astro component files:

```astro
---
// src/components/DataCard.astro
interface Props {
  label: string;
  endpoint: string;
}
const { label, endpoint } = Astro.props;
---

<div class="data-card-wrapper">
  <meld-data-card
    id={`card-${label.replace(/\s/g, '-').toLowerCase()}`}
    label={label}
    data-endpoint={endpoint}
  />
</div>

<script>
  import '../meld/meld-data-card.js';

  // Wire up the endpoint from the data attribute after registration
  document.querySelectorAll('meld-data-card[data-endpoint]').forEach((el) => {
    el.endpoint = el.dataset.endpoint;
  });
</script>
```

Usage in a page:

```astro
---
import DataCard from '../components/DataCard.astro';
---

<DataCard label="Revenue" endpoint="/api/revenue" />
<DataCard label="Active Users" endpoint="/api/users/active" />
```

---

## 6. Project Structure Reference

```text
/my-astro-meld-app
├── astro.config.mjs
├── src/
│   ├── pages/
│   │   └── index.astro         # Page-level Meld imports in <script>
│   ├── components/
│   │   └── DataCard.astro      # Astro component wrapping Meld element
│   └── meld/                   # Meld component definitions
│       ├── meld-stat-card.js
│       ├── meld-data-card.js
│       ├── meld-product-grid.js
│       └── meld-analytics-panel.js
└── package.json
```

---

## Summary of Hydration Approaches

| Strategy            | Mechanism                               | When to use                           |
| :------------------ | :-------------------------------------- | :------------------------------------ |
| Eager (load)        | `<script>` in `<head>`                  | Navigation, critical UI elements      |
| Deferred (idle)     | `<script>` at end of `<body>`, dynamic import | Non-critical panels, analytics   |
| Lazy (visible)      | `IntersectionObserver` + dynamic import | Below-fold charts, heavy components   |
| Server-data bridge  | `define:vars` + imperative property set | Passing server-fetched arrays/objects |
