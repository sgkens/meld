import { meldState, defineMeld, meldHtml, meld } from '../../meld.core.js';

const toastState = meldState({ messages: [] });

export const toast = {
  show: (msg, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).slice(2);
    toastState.messages = [...toastState.messages, { id, msg, type }];
    if (duration > 0) {
      setTimeout(() => {
        toastState.messages = toastState.messages.filter(m => m.id !== id);
      }, duration);
    }
    return id;
  },
  success: (msg) => toast.show(msg, 'success'),
  error: (msg) => toast.show(msg, 'error'),
  dismiss: (id) => {
    toastState.messages = toastState.messages.filter(m => m.id !== id);
  }
};

defineMeld('m-toast-provider', () => {
  return meldHtml`
    <style>
      .viewport {
        position: fixed; top: 20px; right: 20px;
        display: flex; flex-direction: column; gap: 10px;
        z-index: 9999; pointer-events: none;
      }
      .toast {
        pointer-events: auto; min-width: 200px;
        background: var(--mui-bg); border: 1px solid var(--mui-border);
        padding: 12px 16px; border-radius: var(--mui-radius-md);
        box-shadow: var(--mui-shadow-md); display: flex; align-items: center;
        gap: 10px; animation: slideIn 0.3s var(--mui-ease);
      }
      .toast-success { border-left: 4px solid var(--mui-success); }
      .toast-error { border-left: 4px solid var(--mui-danger); }
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } }
    </style>

    <meld-portal>
      <div class="viewport">
        ${meld.list(
          () => toastState.messages,
          (m) => m.id,
          (m) => meldHtml`
            <div class="toast toast-${m.type}">
              <span>${m.msg}</span>
            </div>
          `
        )}
      </div>
    </meld-portal>
  `;
});
