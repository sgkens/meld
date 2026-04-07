import { defineMeld, meldHtml } from '../../meld.core.js';

defineMeld('m-divider', (el) => {
  return meldHtml`
    <style>
      :host { display: block; height: 1px; background: var(--mui-border); margin: 16px 0; }
    </style>
  `;
});
