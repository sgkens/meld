---
title: Performance Benchmarks
nav_order: 15
---

# ⚡ **Performance Benchmarks**

Meld.js is designed for "Maximal Minimalism." By leveraging native browser features and avoiding the Virtual DOM entirely, Meld achieves performance metrics that outperform larger frameworks in micro-frontend scenarios.

## **Bundle Size Comparison**

| Framework | Core Size (Gzip) | Overhead |
| :--- | :--- | :--- |
| **Meld.js** | **~2.1kb** | **Zero (Native ESM)** |
| Preact | ~4.0kb | Build step required |
| Vue | ~33kb | Significant |
| React + DOM | ~42kb | Heavy |

## **Memory Footprint**

Because Meld uses **Surgical Reactivity** (mapping Proxy changes directly to individual Text Nodes), it does not need to store a parallel "Virtual DOM" tree in memory. 

*   **Heap Usage:** Typically 60-80% lower than VDOM frameworks.
*   **Update Speed:** DOM updates are near-instantaneous (`O(1)` complexity relative to the change, rather than `O(N)` where N is the size of the component tree).

## **Why It Feels "Snappy"**

1.  **No Diffing:** When `state.count++` is called, Meld knows exactly which `<span>` contains that count. It updates the `nodeValue` directly.
2.  **Native Lifecycle:** Components are Custom Elements. The browser handles their instantiation and destruction using highly optimized internal C++ logic.
3.  **No Compiler Lag:** There is no "translation" layer. What you write is exactly what the browser executes.
