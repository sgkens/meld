---
title: Roadmap and Future Development
nav_order: 60
---

# Roadmap and Future Development

Our goal is to keep Meld minimal and fast. Future development focuses on platform integration and performance optimizations.

## Completed in v1.4
* **Keep-Alive Component Moves:** Resolved template duplication and premature reactivity teardown when custom elements are moved.
* **Hardened List Rendering:** Graceful fallback defaults in `meld.list` to prevent crashes with empty or invalid array structures.
* **Parent Safety Assertions:** Robust parent-node validations during dynamic node insertion.

## Near-Term (v1.5 Focus)
* **SSR Pilot (Static Pre-rendering):** Develop the `meld-static` CLI tool to render component snapshots at build time for initial fast load (SSG approach).
* **Testing CLI Integration:** Finalize `meld-artisan test` command wrapper to execute tests using `meld-testing-library`.
* **Component Prop API:** Introduce simplified prop definition/typing integration for better DX.

## Mid-Term (v2.0 Focus)
* **Reactive Store API:** Formalize the global store pattern, possibly integrating with DevTools for visual state inspection.
* **Web Worker Support:** Explore delegating expensive computations (like complex searches) to Web Workers using a dedicated plugin (`meld-worker`).
* **Enhanced Animation:** Develop a minimal `meld-motion` plugin to easily manage CSS transitions on mount/unmount.
