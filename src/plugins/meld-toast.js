import { meldState } from '../meld.core.js';

const toastState = meldState({
  toasts: []
});

/**
 * Singleton Toast API object.
 */
export const toast = {
  show(message, type = 'info', duration = 3000) {
    const id = Date.now() + Math.random();
    toastState.toasts = [...toastState.toasts, { id, message, type }];
    setTimeout(() => {
      toastState.toasts = toastState.toasts.filter(t => t.id !== id);
    }, duration);
  },
  success(msg, dur) { this.show(msg, 'success', dur); },
  error(msg, dur) { this.show(msg, 'error', dur); },
  warning(msg, dur) { this.show(msg, 'warning', dur); },
  info(msg, dur) { this.show(msg, 'info', dur); }
};

/**
 * MeldToast plugin object.
 * Defines toast context injection, helper mapping, and auto-mounted overlay.
 */
export const MeldToast = {
  install(api) {
    window.addEventListener('meld-context-request', (e) => {
      if (e.detail.key === 'toast') {
        e.detail.callback(toast);
      }
    });

    api.defineMeld('m-toast-overlay', () => {
      return api.meldHtml`
        <style>
          .toast-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 9999;
          }
          .toast-item {
            padding: 12px 20px;
            border-radius: var(--mui-radius-md, 8px);
            color: white;
            font-size: 0.9rem;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            font-family: var(--mui-font, 'Outfit', sans-serif);
          }
          .toast-success { background: #10b981; }
          .toast-error { background: #ef4444; }
          .toast-warning { background: #f59e0b; }
          .toast-info { background: #3b82f6; }
          
          @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        </style>
        <div class="toast-container">
          ${() => toastState.toasts.map(t => api.meldHtml`
            <div class="toast-item toast-${t.type}">${t.message}</div>
          `)}
        </div>
      `;
    });

    if (!document.querySelector('m-toast-overlay')) {
      const overlay = document.createElement('m-toast-overlay');
      document.body.appendChild(overlay);
    }
  },
  setupHelpers(_api) {
    return { toast };
  }
};
