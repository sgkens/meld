---
title: Releases and Changelog
nav_order: 9
---

# Releases and Changelog

This page tracks the evolution of the Meld framework, including major features and patch fixes.

## Meld v1.4 (Current — Stable)
* **Status:** Stable
* **Date:** July 2026
* **Key Features:** Bypasses premature element lifecycle teardowns on DOM moves, hardens list rendering reconciliation against non-array values, and improves shadow root initialization safety.
* **Breaking Changes:** None.

## Meld v1.3 (Previous Stable)
* **Status:** Stable
* **Date:** June 2026
* **Key Features:** Introduced the full Testing and Quality Assurance layer. Implemented `meld-devtools` and finalized core patches for stability.
* **Breaking Changes:** None.

## Meld v1.2 (Stable)
* **Status:** Stable
* **Date:** May 2026
* **Key Fixes:** Implemented **Keyed List Reconciliation** (`meld.list`) to fix focus loss in interactive forms.
* **New Features:** Added `meld.theme()` (Global Styles) and `meld.raw()` (Unsafe HTML injection).

## Meld v1.1 (Initial Stable Release)
* **Status:** Stable
* **Date:** April 2026
* **Features:** Initial release of the core engine, `meldState`, `meldHtml`, and initial set of utilities (`computed`, `provide/inject`).

---

## Detailed Changelog

| Version   | Type    | Change                                                | Component             |
| :-------- | :------ | :---------------------------------------------------- | :-------------------- |
| **1.4.0** | ADDED   | Component move keep-alive in `connectedCallback`.     | Core                  |
| **1.4.0** | FIXED   | Hardened `meld.list` fallback iteration.              | Utility (`meld.list`) |
| **1.4.0** | FIXED   | Dynamic node insertion parent safety checks.          | Core                  |
| **1.3.0** | ADDED   | `meld-microbus` for decoupled messaging.              | Plugin                |
| **1.3.0** | ADDED   | `meld-a11y` (Trap Focus/Announce helpers).            | Plugin                |
| **1.2.1** | FIXED   | SVG namespace detection improved via `meld.raw`.      | Core                  |
| **1.2.0** | ADDED   | `meld.theme()` for global constructable stylesheets.  | Utility (`meld.theme`)|
| **1.2.0** | ADDED   | `meld.raw()` for trusted HTML injection.              | Utility (`meld.raw`)  |
| **1.2.0** | FIXED   | List reconciliation improved via node caching.        | Utility (`meld.list`) |
| **1.1.0** | ADDED   | `meldState`, `meldHtml`, core reactivity engine.      | Core                  |
| **1.1.0** | ADDED   | `computed`, `provide`, `inject` utilities.            | Core                  |