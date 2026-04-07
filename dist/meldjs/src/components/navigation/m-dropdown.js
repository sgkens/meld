import { defineMeld, meldHtml, meldState, onMount, onDestroy } from '../../meld.core.js';

defineMeld('m-dropdown', (el) => {
  const state = meldState({ isOpen: false });
  const toggle = () => state.isOpen = !state.isOpen;
  const close = () => state.isOpen = false;

  onMount(() => {
    window.addEventListener('click', close);
  });
  onDestroy(() => {
    window.removeEventListener('click', close);
  });

  return meldHtml`
    <style>
      :host { display: inline-block; position: relative; }
      .trigger { cursor: pointer; }
      .menu {
        position: absolute; top: 100%; left: 0; margin-top: 8px;
        min-width: 160px; background: var(--mui-bg); border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-md); box-shadow: var(--mui-shadow-md);
        z-index: 100; opacity: 0; transform: translateY(-10px); pointer-events: none; transition: 0.2s;
      }
      .menu[active] { opacity: 1; transform: translateY(0); pointer-events: auto; }
      ::slotted([slot="item"]) { padding: 10px 16px; cursor: pointer; display: block; text-decoration: none; color: inherit; }
      ::slotted([slot="item"]:hover) { background: var(--mui-surface); }
    </style>
    <div class="trigger" onclick="${(e) => { e.stopPropagation(); toggle(); }}">
      <slot name="trigger"></slot>
    </div>
    <div class="menu" ?active="${() => state.isOpen}">
      <slot name="item"></slot>
    </div>
  `;
});
