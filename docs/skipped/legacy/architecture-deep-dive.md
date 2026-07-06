---
title: Architectural Deep Dive
nav_order: 16
---

# 🏗️ **Architectural Deep Dive**

Meld is built on three fundamental pillars of modern web engineering.

## **1. Proxy-Based Reactivity**

Unlike frameworks that rely on "Dirty Checking" or "Signals," Meld uses a deep-proxy engine.
*   **The Trap:** Every `meldState` object is wrapped in a Proxy that intercepts `set` operations.
*   **The Dependency Map:** Meld tracks which "Effect" (template binding) accessed which property during the render phase.
*   **The Surgical Update:** When a property changes, only the effects that depend on that specific property are re-run.

## **2. Shadow DOM & Scoped Slots**

Meld treats the **Shadow DOM** as a first-class citizen, not a fallback.
*   **True Encapsulation:** CSS defined inside a component cannot leak, and global CSS cannot break the component (unless variables are explicitly shared).
*   **Composition:** We use native `<slot>` elements for high-performance content projection.

## **3. No Build Philosophy**

Meld is "Battle Tested" for environments where build pipelines are restricted or unwanted (e.g., legacy CMS, high-security financial portals, or rapid prototyping).
*   **Native ESM:** Uses standard `import` statements.
*   **Import Maps:** Leverages `meld-federation` to share code between micro-frontends without a shared build step.
