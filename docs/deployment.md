---
title: Deployment & SSG
nav_order: 13
---

# 🚀 Deployment

Meld apps are just static files. You can host them anywhere (Vercel, Netlify, GitHub Pages, or a simple S3 bucket).

## **1. Static Hosting (SPA)**

Simply upload your `index.html`, `src/`, and `components/` folders.

## **2. Static Site Generation (SSG)**

For better SEO and instant loading (FCP), use the Artisan CLI to pre-render your app.

```bash
# 1. Start your dev server
npx meld-artisan serve

# 2. In another terminal, generate the static site
npx meld-artisan build:static dist
```

This creates a `dist/` folder where components are serialized using **Declarative Shadow DOM**.

## **3. Hydration**

When the browser loads the pre-rendered HTML, Meld v1.4+ automatically detects the existing Shadow Roots and "hydrates" them (attaching events and reactivity) without a layout shift.
