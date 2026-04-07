import { defineMeld, meldHtml, meldState } from '../../meld.core.js';

defineMeld('m-table', (el) => {
  const columns = JSON.parse(el.getAttribute('columns') || '[]');
  const data = JSON.parse(el.getAttribute('data') || '[]');

  return meldHtml`
    <style>
      table { width: 100%; border-collapse: collapse; background: var(--mui-bg); border-radius: var(--mui-radius-md); overflow: hidden; }
      th { background: var(--mui-surface); text-align: left; padding: 12px 16px; font-weight: 600; font-size: 0.9rem; color: #666; border-bottom: 1px solid var(--mui-border); }
      td { padding: 12px 16px; border-bottom: 1px solid var(--mui-border); font-size: 0.95rem; }
      tr:last-child td { border-bottom: none; }
      tr:hover td { background: #fafafa; }
    </style>
    <table>
      <thead>
        <tr>
          ${columns.map(col => meldHtml`<th>${col.label || col.key}</th>`)}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => meldHtml`
          <tr>
            ${columns.map(col => meldHtml`<td>${row[col.key]}</td>`)}
          </tr>
        `)}
      </tbody>
    </table>
  `;
});
