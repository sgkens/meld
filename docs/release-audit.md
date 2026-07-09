---
title: Release Audit
nav_order: 99
eleventyExcludeFromCollections: true
layout: false
permalink: false
---

# Release Audit

This page tracks documentation, plugin coverage, and release-readiness checks for the Meld documentation site.

## Documentation Site Checks

| Area | Status | Notes |
| :--- | :--- | :--- |
| Eleventy layout | Complete | Landing and documentation layouts are split. |
| Navigation | Complete | Header navigation, grouped sidebar, breadcrumbs, page TOC, and previous/next links are wired. |
| Search | Complete | Header search filters documentation navigation on docs pages. |
| Theme | Complete | Light and dark theme toggle persists in `localStorage`. |
| Code highlighting | Complete | Highlight.js is loaded and styled with Meld red/orange syntax accents. |
| Diagrams | Complete | Mermaid fences render through `docs.js`. |
| Icons | Complete | UI chrome uses Lucide icons. |
| Emoji cleanup | Complete | Emoji glyphs were removed from docs, README, and source header comments. |
| Mobile layout | Complete | Sidebar becomes an off-canvas menu under tablet width. |
| Scrollbars | Complete | Scrollbars are thin and use the site background for their track. |

## Plugin Coverage

| Plugin | Source File | Documented | Smoke Test | Behavioral Test |
| :--- | :--- | :--- | :--- | :--- |
| `a11y` | `src/plugins/meld-a11y.js` | Yes | Yes | Yes |
| `ai` | `src/plugins/meld-ai.js` | Yes | Yes | Yes |
| `broadcast` | `src/plugins/meld-broadcast.js` | Yes | Yes | No |
| `cookie` | `src/plugins/meld-cookie.js` | Yes | Yes | No |
| `devtools` | `src/plugins/meld-devtools.js` | Yes | Yes | No |
| `diagnostics` | `src/plugins/meld-diagnostics.js` | Yes | Yes | No |
| `download` | `src/plugins/meld-download.js` | Yes | Yes | No |
| `federation` | `src/plugins/meld-federation.js` | Yes | Yes | No |
| `forms` | `src/plugins/meld-forms.js` | Yes | Yes | No |
| `grpc` | `src/plugins/meld-grpc.js` | Yes | Yes | No |
| `head` | `src/plugins/meld-head.js` | Yes | Yes | No |
| `i18n` | `src/plugins/meld-i18n.js` | Yes | Yes | No |
| `inertia` | `src/plugins/meld-inertia.js` | Yes | Yes | No |
| `lazy` | `src/plugins/meld-lazy.js` | Yes | Yes | No |
| `logger` | `src/plugins/meld-logger.js` | Yes | Yes | No |
| `markdown` | `src/plugins/meld-markdown.js` | Yes | Yes | No |
| `microbus` | `src/plugins/meld-microbus.js` | Yes | Yes | No |
| `motion` | `src/plugins/meld-motion.js` | Yes | Yes | No |
| `persist` | `src/plugins/meld-persist.js` | Yes | Yes | No |
| `portal` | `src/plugins/meld-portal.js` | Yes | Yes | Yes |
| `query` | `src/plugins/meld-query.js` | Yes | Yes | Yes |
| `quiver` | `src/plugins/meld-quiver.js` | Yes | Yes | Yes |
| `router` | `src/plugins/meld-router.js` | Yes | Yes | No |
| `skeleton` | `src/plugins/meld-skeleton.js` | Yes | Yes | No |
| `store` | `src/plugins/meld-store.js` | Yes | Yes | No |
| `terminal` | `src/plugins/meld-terminal.js` | Yes | Yes | No |
| `test-utils` | `src/plugins/meld-test-utils.js` | Yes | Yes | No |
| `time` | `src/plugins/meld-time.js` | Yes | Yes | No |
| `upload` | `src/plugins/meld-upload.js` | Yes | Yes | No |
| `versioning` | `src/plugins/meld-versioning.js` | Yes | Yes | No |
| `wasm` | `src/plugins/meld-wasm.js` | Yes | Yes | Yes |

## Required Before Release

1. Add behavioral unit tests for plugins marked `No` in the behavioral test column.
2. Run `npm run docs:build` in a Node environment and inspect `/`, `/architecture/`, `/plugins/`, and `/release-audit/`.
3. Run `npm test` after plugin tests are added.

## Verification Commands

```bash
npm run docs:build
npm run docs:serve
npm test
```
