import { defineMeld, meldHtml, meldState } from '../../meld.core.js';

defineMeld('m-tabs', (el, { emit }) => {
  const state = meldState({ active: 0 });
  const tabs = Array.from(el.querySelectorAll('[slot="tab"]'));
  return meldHtml`
    <style>
      .nav { display: flex; border-bottom: 1px solid var(--mui-border); gap: 20px; }
      .tab { padding: 10px 0; cursor: pointer; opacity: 0.6; position: relative; }
      .tab[active] { opacity: 1; color: var(--mui-primary); }
      .tab[active]::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: var(--mui-primary); }
    </style>
    <div class="nav">
      ${tabs.map((t, i) => meldHtml`
        <div class="tab" ?active="${() => state.active === i}" onclick="${() => { state.active = i; emit('change', i); }}">
          ${t.textContent}
        </div>
      `)}
    </div>
    <div class="content"><slot></slot></div>
  `;
});
