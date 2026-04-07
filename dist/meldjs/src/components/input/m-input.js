import { defineMeld, meldHtml } from '../../meld.core.js';

defineMeld('m-input', (el) => {
  const label = el.getAttribute('label');
  const error = el.getAttribute('error');
  return meldHtml`
    <style>
      .group { display: flex; flex-direction: column; gap: 4px; }
      label { font-size: 0.9rem; font-weight: 500; }
      input { padding: 10px; border: 1px solid var(--mui-border); border-radius: var(--mui-radius-md); background: var(--mui-bg); color: var(--mui-fg); }
      .error { color: var(--mui-danger); font-size: 0.8rem; }
    </style>
    <div class="group">
      ${label ? meldHtml`<label>${label}</label>` : ''}
      <input type="${el.getAttribute('type') || 'text'}" value="${el.getAttribute('value') || ''}" placeholder="${el.getAttribute('placeholder') || ''}" />
      ${error ? meldHtml`<span class="error">${error}</span>` : ''}
    </div>
  `;
});
