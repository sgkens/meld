import { defineMeld, meldHtml, meldState } from '../../meld.core.js';

defineMeld('m-alert', (el) => {
  const variant = el.getAttribute('variant') || 'info';
  return meldHtml`
    <style>
      :host { display: block; padding: 12px 16px; border-radius: var(--mui-radius-md); margin-bottom: 16px; border: 1px solid transparent; }
      .info { background: #eef2ff; border-color: #c7d2fe; color: #3730a3; }
      .success { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
      .danger { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
    </style>
    <div class="${variant}" role="alert">
      <slot></slot>
    </div>
  `;
});
