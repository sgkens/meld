import { defineMeld, meldHtml, onMount } from '../../../src/meld.core.js';

defineMeld('ui-modal', (el, { emit, trapFocus }) => {
  const close = () => emit('close');

  // Trap focus and close on Escape keypress
  onMount(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Call focus trap if helper is available
    let cleanupTrap = null;
    if (trapFocus) {
      const card = el.shadowRoot.querySelector('.modal-card');
      if (card) {
        cleanupTrap = trapFocus(card);
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (cleanupTrap) cleanupTrap();
    };
  });

  return meldHtml`
    <style>
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: grid;
        place-items: center;
        z-index: 1000;
        animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .modal-card {
        background: var(--mui-bg);
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-lg);
        width: 90%;
        max-width: 480px;
        box-shadow: var(--mui-shadow-md);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--mui-space-4);
        border-bottom: 1px solid var(--mui-border);
      }
      .modal-header h3 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--mui-fg);
        font-weight: 600;
      }
      .close-btn {
        background: transparent;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: var(--mui-space-1);
        border-radius: var(--mui-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-size: 1.25rem;
        line-height: 1;
      }
      .close-btn:hover {
        background: var(--mui-surface);
        color: var(--mui-fg);
      }
      .modal-body {
        padding: var(--mui-space-4);
        overflow-y: auto;
        max-height: 70vh;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(16px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>

    <div class="modal-overlay" onclick="${close}">
      <div class="modal-card" onclick="${(e) => e.stopPropagation()}">
        <div class="modal-header">
          <h3><slot name="title">Modal Dialog</slot></h3>
          <button class="close-btn" onclick="${close}" aria-label="Close dialog">×</button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  `;
});
