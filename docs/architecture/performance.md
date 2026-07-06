---
title: Performance & Benchmarks
nav_order: 3
parent: Architecture
description: Live in-browser benchmarks, framework comparison charts, and a deep-dive into how Meld.js achieves maximum rendering performance.
excerpt: Live browser benchmarks and technical analysis of Meld.js rendering performance — no Virtual DOM, no diffing, O(1) targeted DOM updates.
tags: [performance, benchmarks, rendering]
category: Architecture
---

# Performance & Benchmarks

Meld.js achieves **maximum rendering performance** by eliminating every abstraction layer that larger frameworks rely on: no Virtual DOM, no compiler, no diffing tree. Every reactive update targets exactly the DOM node that changed — in `O(1)` relative to the update, not `O(N)` relative to the component tree.

---

## Live Benchmark Harness

Run the benchmark directly in your browser. The harness performs **four independent stress tests** and reports mean, median, and p95 timings. The framework race includes configurable row/update counts for local and Docker runs.

<div class="bench-callout">
  <i data-lucide="flask-conical"></i>
  <div>
    <strong>How it works</strong> — Each test loop uses <code>requestAnimationFrame</code> to let the browser flush the paint queue between iterations, giving accurate real-world measurements rather than synthetic microbenchmarks.
  </div>
</div>

<div data-bench-target></div>
<script type="module" src="/assets/meld-bench.js" data-bench-autorun></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js" defer></script>

---

## Bundle Size Comparison

A lighter runtime means faster first-paint, lower parse cost, and smaller network budgets across every deployment target.

| Framework | Core Size (min+gz) | Runtime Model | Build Step |
| :--- | :--- | :--- | :--- |
| **Meld.js** | **~2.1 kb** | Proxy-reactive, no VDOM | ❌ None |
| Preact | ~4.0 kb | VDOM diffing | ✅ Required |
| Solid.js | ~6.4 kb | Fine-grained, compiled | ✅ Required |
| Svelte (runtime) | ~10.5 kb | Compiled components | ✅ Required |
| Vue 3 | ~34 kb | VDOM + compiler | ✅ Optional |
| React + ReactDOM | ~42 kb | VDOM + Fiber reconciler | ✅ Required |

---

## Benchmark Descriptions

### 1 — Mount Storm

Rapidly mounts and unmounts `N` Meld custom elements (`defineMeld()`), exercising the browser's custom element registry and shadow DOM attachment paths.

**What it measures:** `connectedCallback` → shadow root attach → effect registration → `disconnectedCallback` → effect cleanup, for each element.

```javascript
// Each element under test looks like this
defineMeld('bench-item', () => {
  const state = meldState({ n: 0 });
  return meldHtml`<span>${() => state.n}</span>`;
});
```

**Typical result:** < 20 ms for 200 elements (Chrome stable). The bottleneck is shadow DOM attachment, not Meld's setup code.

---

### 2 — Reactive State Churn

Fires thousands of `meldState()` proxy writes in tight succession and measures how quickly the reactivity engine processes them, including any effect re-runs that read from the changed state.

**What it measures:** Proxy `set` → dependency notification → effect re-run cycle latency at scale.

```javascript
const state = meldState({ count: 0 });

// Rapid-fire 5,000 state mutations
for (let i = 0; i < 5000; i++) {
  state.count = i;   // O(1) — notifies only bound effects
}
```

**Key insight:** Because Meld tracks which effects depend on which state properties at the granularity of individual keys, unrelated effects are never re-run. This keeps churn cost proportional to the number of *affected* bindings, not the total number of effects.

---

### 3 — Pixel-Heavy Render Loop

Mounts a `500-item` keyed list (`meld.list()`) and repeatedly shuffles the data, cycling all items through key reuse and label mutation.

**What it measures:** Key lookup → DOM node reuse vs. creation → `requestAnimationFrame` flush → paint time for a viewport-filling list.

```javascript
const state = meldState({ items: [] });

// meld.list provides keyed identity — existing nodes are reused
return meldHtml`
  <ul>
    ${() => meld.list(
      () => state.items,
      (item) => item.id,          // key function
      (item) => {
        const li = document.createElement('li');
        li.textContent = item.label;
        return li;
      }
    )}
  </ul>
`;
```

**Key insight:** `meld.list()` avoids destroying and recreating DOM nodes when the same key appears in the new list. For a 500-item shuffle with 50% key overlap, ~250 nodes are reused rather than destroyed and rebuilt.

---

### 4 — Framework Race

Compares Meld against Vue, React, and HTMX across the row/update counts selected in the benchmark panel:

| Contestant | Strategy |
| :--- | :--- |
| **Meld.js** | `meld.list()` keyed reactive list, surgical node reuse |
| Vue 3 | Reactive keyed render function mounted with `createApp()` |
| React 18 | Keyed Fiber render through `createRoot()` |
| HTMX 2 | HTML fragment replacement followed by `htmx.process()` |

**What it measures:** Total time in milliseconds for all 30 update cycles, and normalised cost per 1,000 operations.

> [!TIP]
> The comparison frameworks are loaded from public CDN URLs when the benchmark runs. For repeatable results, run the docs locally or in Docker with a warm cache and a stable CPU profile.

---

## Why Meld Is Fast: Three Pillars

### Pillar 1 — Surgical Reactivity

```javascript
// Meld's dependency graph is key-granular, not component-granular
const state = meldState({ count: 0, name: 'Alice' });

// This effect ONLY re-runs when state.count changes.
// Mutating state.name never triggers it.
createEffect(() => {
  span.textContent = state.count;
});
```

When `state.count` changes:
1. The Proxy `set` trap fires
2. Only effects subscribed to `count` are notified (via `WeakSet`)
3. Each effect re-runs exactly once — no batching or reconciliation queue

### Pillar 2 — Anchor-Based DOM Updates

Rather than diffing a component tree, `meldHtml` plants **anchor text nodes** around dynamic positions:

```
[start] <— anchor
  "42"  <— current dynamic value
[end]   <— anchor
```

When the value changes, only the nodes between `start` and `end` are replaced. Adjacent siblings are never touched.

### Pillar 3 — Native Custom Element Lifecycle

Meld components *are* browser custom elements. Their instantiation and destruction follows the browser's internal C++ lifecycle management — the same path used by `<video>`, `<canvas>`, and `<input>`. This means:

- Zero framework overhead on attach/detach
- Automatic memory cleanup via `disconnectedCallback`
- Composable with any HTML, any server renderer, any CMS

---

## Testing Methodology

### Automated Perf Regression (Puppeteer)

The `meld-bench.js` harness can be driven headlessly from CI using Puppeteer, which ships in the repo's `devDependencies`:

```javascript
// tools/perf-ci.js — run with: node tools/perf-ci.js
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('http://localhost:8081/performance/');

// Inject harness and collect results
const results = await page.evaluate(async () => {
  const { runBenchmarks } = await import('/assets/meld-bench.js');
  return runBenchmarks();
});

console.table(results);
await browser.close();
```

### What to Watch For

| Signal | Healthy | Investigate |
| :--- | :--- | :--- |
| Mount storm mean | < 25 ms / 200 els | > 60 ms |
| State churn p95 | < 80 ms / 5k writes | > 200 ms |
| Pixel render median | < 16 ms / cycle | > 33 ms (drops below 30 fps) |
| Race: Meld vs Vue/React/HTMX | Same order of magnitude | Consistently slower by > 3× |

> [!NOTE]
> All timings are measured on the Chrome Stable engine. Firefox and Safari show different absolute numbers but the same relative ordering. Mobile devices will show roughly 3–5× higher latency; the relative advantage of Meld's keyed list grows on constrained hardware.

---

## Profiling Meld in Chrome DevTools

1. Open **DevTools → Performance** tab
2. Start recording
3. Click **Run Benchmarks** on this page
4. Stop recording and look for:
   - **Long tasks** (> 50 ms) — these indicate effects doing too much work per update
   - **Layout thrash** — caused by reading layout properties (e.g. `offsetHeight`) inside effects
   - **Shadow DOM recalc** — appears as `Update Layer Tree` in the flame chart

```javascript
// Anti-pattern: layout thrash inside an effect
createEffect(() => {
  const h = container.offsetHeight; // ← forces synchronous layout
  state.height = h;                 // ← triggers another effect cycle
});

// Fix: read outside the effect, or use ResizeObserver
const ro = new ResizeObserver(([entry]) => {
  state.height = entry.contentRect.height;
});
ro.observe(container);
```

---

## Optimisation Checklist

- [ ] Use `meld.list()` with a **key function** for all repeating lists — prevents DOM destruction on shuffle
- [ ] Keep effect functions **pure** — no DOM reads inside effects
- [ ] Use `computed()` to **memoize derived values** — avoids re-computing in multiple effects
- [ ] Avoid `meld.raw()` in tight loops — it triggers `innerHTML` which forces full re-parse
- [ ] Split large component trees into **nested custom elements** — each is an independent reactive scope
- [ ] Use `onDestroy()` to cancel `setInterval`/`setTimeout` and abort fetch in long-lived components
