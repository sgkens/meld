import { defineMeld, meldHtml, meldState } from '../../meld.core.js';

defineMeld('m-select', (el, { emit }) => {
  const options = JSON.parse(el.getAttribute('options') || '[]');
  const state = meldState({ isOpen: false, selected: el.getAttribute('value') || null });

  const select = (opt) => {
    state.selected = opt.value;
    state.isOpen = false;
    emit('change', opt.value);
  };

  return meldHtml`
    <style>
      :host { display: inline-block; position: relative; width: 200px; }
      .trigger { 
        padding: 10px; border: 1px solid var(--mui-border); border-radius: var(--mui-radius-md);
        background: var(--mui-bg); cursor: pointer; display: flex; justify-content: space-between;
      }
      .menu {
        position: absolute; top: 100%; left: 0; right: 0; background: var(--mui-bg);
        border: 1px solid var(--mui-border); border-radius: var(--mui-radius-md);
        margin-top: 4px; z-index: 100; box-shadow: var(--mui-shadow-md);
      }
      .item { padding: 8px 12px; cursor: pointer; }
      .item:hover { background: var(--mui-surface); }
    </style>
    <div class="trigger" onclick="${() => state.isOpen = !state.isOpen}">
      <span>${() => options.find(o => o.value === state.selected)?.label || 'Select...'}</span>
      <span>▼</span>
    </div>
    ${() => state.isOpen ? meldHtml`
      <meld-portal>
        <div class="menu">
          ${options.map(opt => meldHtml`
            <div class="item" onclick="${() => select(opt)}">${opt.label}</div>
          `)}
        </div>
      </meld-portal>
    ` : ''}
  `;
});
