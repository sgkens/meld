---
title: Releases and Changelog
nav_order: 9
---

# Releases and Changelog

This page tracks the evolution of the Meld framework, including major features and patch fixes.

## Meld v1.3 (Current - Battle Tested)
* **Status:** Release Candidate (RC)
* **Date:** [Insert Current Date]
* **Key Features:** Introduced the full Testing and Quality Assurance layer. Implemented `meld-devtools` and finalized core patches for stability.
* **Breaking Changes:** None.

## Meld v1.2 (Robust Edition)
* **Key Fixes:** Implemented **Keyed List Reconciliation** (`meld.list`) to fix focus loss in interactive forms.
* **New Features:** Added `meld.theme()` (Global Styles) and `meld.raw()` (Unsafe HTML injection).

## Meld v1.1 (Initial Stable Release)
* **Features:** Initial release of the core engine, `meldState`, `meldHtml`, and initial set of utilities (`computed`, `provide/inject`).

---

## Detailed Changelog

| Version   | Change                                                | Component             |
| :-------- | :---------------------------------------------------- | :-------------------- |
| **1.3.0** | ADDED: `meld-microbus` for decoupled messaging.       | Plugin                |
| **1.3.0** | ADDED: `meld-a11y` (Trap Focus/Announce helpers).     | Plugin                |
| **1.2.1** | FIX: SVG namespace detection improved via `meld.raw`. | Core                  |
| **1.2.0** | FIX: List reconciliation improved via node caching.   | Utility (`meld.list`) |