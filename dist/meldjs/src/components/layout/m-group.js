import { defineMeld, meldHtml } from '../../meld.core.js';

defineMeld('m-group', (el) => {
  return meldHtml`
    <style>
      :host { display: flex; align-items: center; }
      ::slotted(*) { border-radius: 0 !important; border-right-width: 0 !important; }
      ::slotted(*:first-child) { border-top-left-radius: var(--mui-radius-md) !important; border-bottom-left-radius: var(--mui-radius-md) !important; }
      ::slotted(*:last-child) { border-top-right-radius: var(--mui-radius-md) !important; border-bottom-right-radius: var(--mui-radius-md) !important; border-right-width: 1px !important; }
    </style>
    <slot></slot>
  `;
});
