import { defineMeld, meldHtml } from '../../meld.core.js';

defineMeld('m-card', () => {
  return meldHtml`
    <style>
      :host { display: block; background: var(--mui-bg); border: 1px solid var(--mui-border); border-radius: var(--mui-radius-lg); overflow: hidden; box-shadow: var(--mui-shadow-sm); }
      .header { padding: 16px; border-bottom: 1px solid var(--mui-border); font-weight: 600; }
      .body { padding: 16px; }
      .footer { padding: 16px; border-top: 1px solid var(--mui-border); background: var(--mui-surface); }
    </style>
    <div class="header"><slot name="header"></slot></div>
    <div class="body"><slot></slot></div>
    <div class="footer"><slot name="footer"></slot></div>
  `;
});
