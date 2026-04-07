import { defineMeld, meldHtml, meldState, onMount, onDestroy } from '../../meld.core.js';

defineMeld('m-modal', (el, { emit }) => {
  const state = meldState({ isOpen: el.hasAttribute('open') });

  const close = () => {
    state.isOpen = false;
    el.removeAttribute('open');
    emit('close');
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape' && state.isOpen) close();
  };

  onMount(() => {
    window.addEventListener('keydown', handleEscape);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleEscape);
  });

  return meldHtml`
    <style>
      :host { display: block; }
      .backdrop {
        position: fixed; inset: 0; background: rgba(0,0,0,0.4);
        backdrop-filter: blur(4px); display: grid; place-items: center;
        z-index: 1000; opacity: 0; pointer-events: none; transition: 0.3s;
      }
      .backdrop[active] { opacity: 1; pointer-events: auto; }
      .content {
        background: var(--mui-bg); padding: 24px; border-radius: var(--mui-radius-lg);
        box-shadow: var(--mui-shadow-md); max-width: 500px; width: 90%;
        transform: scale(0.9); transition: 0.3s var(--mui-ease);
      }
      .backdrop[active] .content { transform: scale(1); }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--mui-fg); opacity: 0.5; }
      .close-btn:hover { opacity: 1; }
    </style>

    <meld-portal>
      <div class="backdrop" ?active="${() => state.isOpen}" onclick="${(e) => e.target === e.currentTarget && close()}">
        <div class="content" ref="${trapFocus}">
          <div class="header">
            <slot name="title"><strong>Modal Title</strong></slot>
            <button class="close-btn" onclick="${close}">&times;</button>
          </div>
          <slot></slot>
          <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </meld-portal>
  `;
});
