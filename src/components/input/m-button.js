import { defineMeld, meldHtml } from '../../meld.core.js';

defineMeld('m-button', (el) => {
  const variant = el.getAttribute('variant') || 'primary';
  const size = el.getAttribute('size') || 'md';
  const loading = el.hasAttribute('loading');
  return meldHtml`
    <style>
      :host { display: inline-block; }
      button {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        width: 100%; border: none; cursor: pointer;
        font-family: var(--mui-font); font-weight: 500;
        border-radius: var(--mui-radius-md); transition: all 0.2s var(--mui-ease);
      }
      .sz-sm { padding: 6px 12px; font-size: 0.85rem; }
      .sz-md { padding: 10px 16px; font-size: 1rem; }
      .sz-lg { padding: 14px 24px; font-size: 1.1rem; }
      .var-primary { background: var(--mui-primary); color: var(--mui-primary-fg); }
      .var-outline { background: transparent; border: 1px solid var(--mui-border); color: var(--mui-fg); }
      .spinner { width: 1em; height: 1em; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
    <button class="var-${variant} sz-${size}" ?disabled="${loading}" onclick="${(e) => {
      const btn = e.currentTarget;
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.className = 'ripple';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }}">
      <style>
        button { position: relative; overflow: hidden; }
        .ripple {
          position: absolute; background: rgba(255,255,255,0.3);
          border-radius: 50%; transform: scale(0); animation: ripple 0.6s linear;
          pointer-events: none;
        }
        @keyframes ripple { to { transform: scale(4); opacity: 0; } }
      </style>
      ${loading ? meldHtml`<span class="spinner"></span>` : ''}
      <slot></slot>
    </button>
  `;
});
