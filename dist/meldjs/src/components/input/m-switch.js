import { defineMeld, meldHtml, meldState } from '../../meld.core.js';

defineMeld('m-switch', (el, { emit }) => {
  const state = meldState({ checked: el.hasAttribute('checked') });
  const toggle = () => { state.checked = !state.checked; emit('change', state.checked); };
  return meldHtml`
    <style>
      .switch { width: 44px; height: 24px; background: #ccc; border-radius: 12px; position: relative; cursor: pointer; transition: 0.2s; }
      .switch[checked] { background: var(--mui-primary); }
      .thumb { width: 20px; height: 20px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.2s; }
      .switch[checked] .thumb { left: 22px; }
    </style>
    <div class="switch" ?checked="${() => state.checked}" onclick="${toggle}">
      <div class="thumb"></div>
    </div>
  `;
});
