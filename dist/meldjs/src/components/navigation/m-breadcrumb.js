import { defineMeld, meldHtml } from '../../meld.core.js';

defineMeld('m-breadcrumb', (el) => {
  return meldHtml`
    <style>
      :host { display: flex; gap: 8px; align-items: center; color: #666; font-size: 0.9rem; }
      ::slotted(a) { color: var(--mui-primary); text-decoration: none; }
      ::slotted(a:hover) { text-decoration: underline; }
      .sep { color: #ccc; }
    </style>
    <slot></slot>
  `;
});
// Note: In real impl, we'd inject separators between slots if possible, 
// but for standard slots we'll assume the user provides them or we use a clever CSS trick.
