import { defineMeld, meldHtml } from '../../meld.core.js';

defineMeld('m-badge', (el) => {
  const variant = el.getAttribute('variant') || 'default';
  return meldHtml`
    <style>
      :host { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: var(--mui-surface); color: var(--mui-fg); }
      :host([variant="success"]) { background: #e6fffa; color: #047481; }
      :host([variant="danger"]) { background: #fff5f5; color: #c53030; }
    </style>
    <slot></slot>
  `;
});
