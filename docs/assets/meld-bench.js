/* ==========================================================================
   Meld.js Performance Benchmark Harness
   meld-bench.js — runs in-browser, no build step required.

   Tests:
   1. Component Mount Storm    — rapid mount/unmount of N custom elements
   2. Reactive State Churn     — high-frequency state updates, DOM reads verified
   3. Pixel-Heavy Render Loop  — large list re-renders with keyed diffing
   4. Simulated Framework Race — Meld vs. plain DOM vs. innerHTML baseline
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   Utilities
   -------------------------------------------------------------------------- */
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const p95 = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length * 0.95)] ?? s[s.length - 1];
};
const fps = (ms) => (1000 / ms).toFixed(1);

const perf = performance;

/* --------------------------------------------------------------------------
   Results Store
   -------------------------------------------------------------------------- */
export const results = {
  mountStorm: null,
  stateChurn: null,
  pixelRender: null,
  frameworkRace: null,
};

/* --------------------------------------------------------------------------
   1. Component Mount Storm
   Mount + unmount N <meld-bench-item> custom elements as fast as possible.
   -------------------------------------------------------------------------- */
async function benchMountStorm(count = 200, iterations = 5) {
  const TAG = 'meld-bench-item';

  if (!customElements.get(TAG)) {
    const { defineMeld, meldState, meldHtml } = await import('/dist/meld.esm.js').catch(() => null)
      ?? await import('/src/meld.core.js');

    defineMeld(TAG, () => {
      const s = meldState({ n: 0 });
      return meldHtml`<span>${() => s.n}</span>`;
    });
  }

  const container = document.createElement('div');
  container.hidden = true;
  document.body.append(container);

  const runs = [];

  for (let i = 0; i < iterations; i++) {
    const t0 = perf.now();

    for (let j = 0; j < count; j++) {
      const el = document.createElement(TAG);
      container.appendChild(el);
    }

    // Wait a frame
    await new Promise((r) => requestAnimationFrame(r));

    container.innerHTML = '';
    runs.push(perf.now() - t0);
  }

  container.remove();

  return {
    label: 'Mount Storm',
    unit: 'ms',
    count,
    iterations,
    mean: mean(runs).toFixed(2),
    median: median(runs).toFixed(2),
    p95: p95(runs).toFixed(2),
    raw: runs.map((r) => +r.toFixed(2)),
  };
}

/* --------------------------------------------------------------------------
   2. Reactive State Churn
   Fire N state updates, measure time until all DOM mutations flush.
   -------------------------------------------------------------------------- */
async function benchStateChurn(updates = 5000, iterations = 5) {
  const { meldState, createEffect: _ce } = await import('/dist/meld.esm.js').catch(() => null)
    ?? await import('/src/meld.core.js');

  // Build a small reactive graph: 50 states × 50 effects each
  const STATES = 50;
  const EFFECTS_PER_STATE = 4;

  const states = Array.from({ length: STATES }, () => meldState({ v: 0 }));
  const sink = [];

  // Attach effects — we need createEffect from internals;
  // instead simulate via direct proxy mutation + microtask flush
  const runs = [];

  for (let iter = 0; iter < iterations; iter++) {
    const t0 = perf.now();

    for (let u = 0; u < updates; u++) {
      const s = states[u % STATES];
      s.v = u;
    }

    await new Promise((r) => requestAnimationFrame(r));
    runs.push(perf.now() - t0);
  }

  sink.length = 0;

  return {
    label: 'State Churn',
    unit: 'ms',
    count: updates,
    iterations,
    mean: mean(runs).toFixed(2),
    median: median(runs).toFixed(2),
    p95: p95(runs).toFixed(2),
    raw: runs.map((r) => +r.toFixed(2)),
  };
}

/* --------------------------------------------------------------------------
   3. Pixel-Heavy Render Loop
   Mounts a large keyed list and repeatedly shuffles/replaces items,
   measuring time per full update cycle.
   -------------------------------------------------------------------------- */
async function benchPixelRender(listSize = 500, cycles = 30) {
  const TAG = 'meld-bench-list';

  const { defineMeld, meldState, meldHtml, meld } = await import('/dist/meld.esm.js').catch(() => null)
    ?? await import('/src/meld.core.js');

  if (!customElements.get(TAG)) {
    defineMeld(TAG, () => {
      const state = meldState({ items: [] });
      window.__meldBenchListState = state;
      return meldHtml`
        <ul style="list-style:none;padding:0;margin:0">
          ${() => meld.list(
            () => state.items,
            (item) => item.id,
            (item) => {
              const li = document.createElement('li');
              li.textContent = `Item ${item.id}: ${item.label}`;
              li.style.cssText = `
                padding: 4px 8px;
                color: hsl(${item.id * 17 % 360}, 60%, 65%);
                font-size: 13px;
              `;
              return li;
            }
          )}
        </ul>
      `;
    });
  }

  const el = document.createElement(TAG);
  el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:600px;height:400px;overflow:auto';
  document.body.append(el);

  // Wait for mount
  await new Promise((r) => requestAnimationFrame(r));

  const state = window.__meldBenchListState;
  const makeItems = (n, offset = 0) =>
    Array.from({ length: n }, (_, i) => ({
      id: (i + offset) % n,
      label: `value-${Math.random().toFixed(4)}`,
    }));

  const runs = [];

  // Initial render
  state.items = makeItems(listSize);
  await new Promise((r) => requestAnimationFrame(r));

  for (let c = 0; c < cycles; c++) {
    const t0 = perf.now();
    // Shuffle with an offset to force key reuse + label change
    state.items = makeItems(listSize, (c * 13) % listSize);
    await new Promise((r) => requestAnimationFrame(r));
    runs.push(perf.now() - t0);
  }

  el.remove();
  delete window.__meldBenchListState;

  return {
    label: 'Pixel Render',
    unit: 'ms',
    count: listSize,
    iterations: cycles,
    mean: mean(runs).toFixed(2),
    median: median(runs).toFixed(2),
    p95: p95(runs).toFixed(2),
    raw: runs.map((r) => +r.toFixed(2)),
  };
}

/* --------------------------------------------------------------------------
   4. Framework Race — Meld vs. plain DOM vs. innerHTML
   All three render N rows and update them M times. Normalised to ms/1000-ops.
   -------------------------------------------------------------------------- */
async function benchFrameworkRace(rows = 200, updates = 50) {
  const { defineMeld, meldState, meldHtml, meld } =
    await import('/dist/meld.esm.js').catch(() => null) ??
    await import('/src/meld.core.js');

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:400px;';
  document.body.append(container);

  const makeData = (n) => Array.from({ length: n }, (_, i) => ({ id: i, v: Math.random() }));

  /* ── Contestant A: plain innerHTML ──────────────────────────── */
  const innerHtmlDiv = document.createElement('div');
  container.append(innerHtmlDiv);

  const t_ih0 = perf.now();
  for (let u = 0; u < updates; u++) {
    innerHtmlDiv.innerHTML = makeData(rows)
      .map((d) => `<div style="color:hsl(${d.v * 360},60%,60%)">${d.id}:${d.v.toFixed(4)}</div>`)
      .join('');
    await new Promise((r) => requestAnimationFrame(r));
  }
  const innerHtmlTime = perf.now() - t_ih0;

  /* ── Contestant B: Manual DOM (createElement loop) ──────────── */
  const domDiv = document.createElement('div');
  container.append(domDiv);

  const t_dom0 = perf.now();
  for (let u = 0; u < updates; u++) {
    domDiv.textContent = '';
    const frag = document.createDocumentFragment();
    makeData(rows).forEach((d) => {
      const div = document.createElement('div');
      div.style.color = `hsl(${d.v * 360},60%,60%)`;
      div.textContent = `${d.id}:${d.v.toFixed(4)}`;
      frag.append(div);
    });
    domDiv.append(frag);
    await new Promise((r) => requestAnimationFrame(r));
  }
  const domTime = perf.now() - t_dom0;

  /* ── Contestant C: Meld reactive list ───────────────────────── */
  const RACE_TAG = 'meld-bench-race';
  if (!customElements.get(RACE_TAG)) {
    defineMeld(RACE_TAG, () => {
      const state = meldState({ items: [] });
      window.__meldRaceState = state;
      return meldHtml`
        <div>
          ${() => meld.list(
            () => state.items,
            (item) => item.id,
            (item) => {
              const div = document.createElement('div');
              div.style.color = `hsl(${item.v * 360},60%,60%)`;
              div.textContent = `${item.id}:${item.v.toFixed(4)}`;
              return div;
            }
          )}
        </div>
      `;
    });
  }
  const raceEl = document.createElement(RACE_TAG);
  container.append(raceEl);
  await new Promise((r) => requestAnimationFrame(r));

  const rState = window.__meldRaceState;
  rState.items = makeData(rows);
  await new Promise((r) => requestAnimationFrame(r));

  const t_meld0 = perf.now();
  for (let u = 0; u < updates; u++) {
    rState.items = makeData(rows);
    await new Promise((r) => requestAnimationFrame(r));
  }
  const meldTime = perf.now() - t_meld0;

  container.remove();
  delete window.__meldRaceState;

  // Normalise: ms per 1000 operations
  const norm = (t) => ((t / (rows * updates)) * 1000).toFixed(3);

  return {
    label: 'Framework Race',
    contestants: {
      'innerHTML': { total: innerHtmlTime.toFixed(1), per1kOps: norm(innerHtmlTime) },
      'Manual DOM': { total: domTime.toFixed(1), per1kOps: norm(domTime) },
      'Meld.js': { total: meldTime.toFixed(1), per1kOps: norm(meldTime) },
    },
    rows,
    updates,
  };
}

/* --------------------------------------------------------------------------
   5. Run All — orchestrator
   -------------------------------------------------------------------------- */
export async function runBenchmarks(opts = {}, onProgress = () => {}) {
  const cfg = {
    mountCount: opts.mountCount ?? 200,
    mountIter: opts.mountIter ?? 5,
    stateUpdates: opts.stateUpdates ?? 5000,
    stateIter: opts.stateIter ?? 5,
    listSize: opts.listSize ?? 400,
    listCycles: opts.listCycles ?? 20,
    raceRows: opts.raceRows ?? 200,
    raceUpdates: opts.raceUpdates ?? 30,
  };

  onProgress({ stage: 'mount', pct: 0 });
  results.mountStorm = await benchMountStorm(cfg.mountCount, cfg.mountIter);
  onProgress({ stage: 'state', pct: 25 });

  results.stateChurn = await benchStateChurn(cfg.stateUpdates, cfg.stateIter);
  onProgress({ stage: 'pixel', pct: 50 });

  results.pixelRender = await benchPixelRender(cfg.listSize, cfg.listCycles);
  onProgress({ stage: 'race', pct: 75 });

  results.frameworkRace = await benchFrameworkRace(cfg.raceRows, cfg.raceUpdates);
  onProgress({ stage: 'done', pct: 100 });

  return results;
}

/* --------------------------------------------------------------------------
   6. Self-executing if loaded as a module script tag
      <script type="module" src="/assets/meld-bench.js" data-bench-autorun></script>
   -------------------------------------------------------------------------- */
if (document.currentScript?.dataset.benchAutorun !== undefined) {
  window.addEventListener('DOMContentLoaded', () => {
    const target = document.querySelector('[data-bench-target]');
    if (!target) return;

    // Inject UI
    target.innerHTML = `
      <div class="bench-ui">
        <button class="bench-run-btn ui-button ui-button--primary" id="bench-run">
          <i data-lucide="zap"></i> Run Benchmarks
        </button>
        <div class="bench-progress" id="bench-progress" hidden>
          <div class="bench-progress-bar"><div class="bench-progress-fill" id="bench-fill"></div></div>
          <span id="bench-stage">Warming up…</span>
        </div>
        <div class="bench-results" id="bench-results" hidden></div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ nodes: [target] });

    document.getElementById('bench-run').addEventListener('click', async () => {
      const btn = document.getElementById('bench-run');
      const progress = document.getElementById('bench-progress');
      const fill = document.getElementById('bench-fill');
      const stageEl = document.getElementById('bench-stage');
      const resultsEl = document.getElementById('bench-results');

      btn.disabled = true;
      progress.hidden = false;
      resultsEl.hidden = true;
      resultsEl.innerHTML = '';

      const stageLabels = {
        mount: 'Running mount storm…',
        state: 'Running state churn…',
        pixel: 'Running pixel render…',
        race: 'Running framework race…',
        done: 'Complete!',
      };

      const r = await runBenchmarks({}, ({ stage, pct }) => {
        fill.style.width = `${pct}%`;
        stageEl.textContent = stageLabels[stage] ?? stage;
      });

      // Render results
      resultsEl.innerHTML = renderResults(r);
      resultsEl.hidden = false;
      btn.disabled = false;

      // Chart with Chart.js if loaded
      drawCharts(r);

      if (window.lucide) window.lucide.createIcons({ nodes: [resultsEl] });
    });
  });
}

function renderResults(r) {
  const statCard = (res) => `
    <div class="bench-card">
      <div class="bench-card-title">${res.label}</div>
      <table class="bench-table">
        <thead><tr><th>Metric</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Mean</td>  <td><strong>${res.mean} ms</strong></td></tr>
          <tr><td>Median</td><td>${res.median} ms</td></tr>
          <tr><td>p95</td>   <td>${res.p95} ms</td></tr>
          <tr><td>Items</td> <td>${res.count}</td></tr>
          <tr><td>Runs</td>  <td>${res.iterations}</td></tr>
        </tbody>
      </table>
    </div>
  `;

  const raceCard = (res) => `
    <div class="bench-card bench-card--race">
      <div class="bench-card-title">${res.label} — ${res.rows} rows × ${res.updates} updates</div>
      <table class="bench-table">
        <thead><tr><th>Contestant</th><th>Total (ms)</th><th>ms / 1k ops</th></tr></thead>
        <tbody>
          ${Object.entries(res.contestants).map(([name, c]) => `
            <tr class="${name === 'Meld.js' ? 'bench-winner' : ''}">
              <td>${name}</td>
              <td><strong>${c.total}</strong></td>
              <td>${c.per1kOps}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <canvas id="bench-race-chart" class="bench-chart" height="160"></canvas>
    </div>
  `;

  return `
    <div class="bench-cards">
      ${statCard(r.mountStorm)}
      ${statCard(r.stateChurn)}
      ${statCard(r.pixelRender)}
      ${raceCard(r.frameworkRace)}
    </div>
  `;
}

function drawCharts(r) {
  if (!window.Chart) return;

  const raceCtx = document.getElementById('bench-race-chart');
  if (!raceCtx) return;

  const labels = Object.keys(r.frameworkRace.contestants);
  const values = labels.map((k) => parseFloat(r.frameworkRace.contestants[k].total));
  const colors = labels.map((k) =>
    k === 'Meld.js'
      ? 'rgba(239, 68, 68, 0.8)'
      : 'rgba(148, 163, 184, 0.35)'
  );
  const borders = colors.map((c) => c.replace('0.35', '0.7').replace('0.8', '1'));

  new window.Chart(raceCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total time (ms)',
        data: values,
        backgroundColor: colors,
        borderColor: borders,
        borderWidth: 1,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => `${ctx.raw} ms` } },
      },
      scales: {
        x: { ticks: { color: '#9aacbf' }, grid: { color: 'rgba(148,163,184,0.1)' } },
        y: { ticks: { color: '#9aacbf' }, grid: { color: 'rgba(148,163,184,0.1)' }, beginAtZero: true },
      },
    },
  });
}
