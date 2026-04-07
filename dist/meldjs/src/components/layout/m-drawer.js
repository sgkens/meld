import { defineMeld, meldHtml, meldState } from '../../meld.core.js';

defineMeld('m-drawer', (el, { emit }) => {
  const state = meldState({ isOpen: el.hasAttribute('open') });
  const side = el.getAttribute('side') || 'right';

  const close = () => {
    state.isOpen = false;
    el.removeAttribute('open');
    emit('close');
  };

  return meldHtml`
    <style>
      .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1000; opacity: 0; pointer-events: none; transition: 0.3s; }
      .backdrop[active] { opacity: 1; pointer-events: auto; }
      .drawer {
        position: fixed; top: 0; bottom: 0; width: 300px; background: var(--mui-bg);
        z-index: 1001; transition: transform 0.3s var(--mui-ease);
        box-shadow: var(--mui-shadow-md);
      }
      .side-right { right: 0; transform: translateX(100%); }
      .side-left { left: 0; transform: translateX(-100%); }
      .backdrop[active] .drawer { transform: translateX(0); }
      .content { padding: 24px; }
    </style>
    <meld-portal>
      <div class="backdrop" ?active="${() => state.isOpen}" onclick="${close}">
        <div class="drawer side-${side}" onclick="${(e) => e.stopPropagation()}">
          <div class="content">
            <slot></slot>
          </div>
        </div>
      </div>
    </meld-portal>
  `;
});
