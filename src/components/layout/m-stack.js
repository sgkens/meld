import { defineMeld, meldHtml } from '../../meld.core.js';

defineMeld('m-stack', (el) => {
  const gap = el.getAttribute('gap') || '2';
  const dir = el.getAttribute('vertical') !== null ? 'column' : 'row';
  const align = el.getAttribute('align') || 'center';
  return meldHtml`
    <style>
      :host { display: flex; flex-direction: ${dir}; gap: var(--mui-space-${gap}); align-items: ${align}; }
    </style>
    <slot></slot>
  `;
});
