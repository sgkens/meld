import { defineMeld, meldHtml, meldState } from '../../meld.core.js';

defineMeld('m-table', (el) => {
  const columns = JSON.parse(el.getAttribute('columns') || '[]');
  const initialData = JSON.parse(el.getAttribute('data') || '[]');
  const state = meldState({ data: initialData, sortKey: null, sortDir: 1 });

  const sort = (key) => {
    if (state.sortKey === key) state.sortDir *= -1;
    else { state.sortKey = key; state.sortDir = 1; }
    
    state.data = [...state.data].sort((a, b) => {
      if (a[key] < b[key]) return -1 * state.sortDir;
      if (a[key] > b[key]) return 1 * state.sortDir;
      return 0;
    });
  };

  return meldHtml`
    <style>
      table { width: 100%; border-collapse: collapse; background: var(--mui-bg); border-radius: var(--mui-radius-md); overflow: hidden; }
      th { background: var(--mui-surface); text-align: left; padding: 12px 16px; font-weight: 600; cursor: pointer; user-select: none; }
      th:hover { background: #eee; }
      td { padding: 12px 16px; border-bottom: 1px solid var(--mui-border); }
      tr:last-child td { border-bottom: none; }
      .sort-icon { margin-left: 8px; opacity: 0.5; }
    </style>
    <table>
      <thead>
        <tr>
          ${columns.map(col => meldHtml`
            <th onclick="${() => sort(col.key)}">
              ${col.label || col.key}
              <span class="sort-icon">${() => state.sortKey === col.key ? (state.sortDir === 1 ? '↑' : '↓') : '↕'}</span>
            </th>
          `)}
        </tr>
      </thead>
      <tbody>
        ${() => state.data.map(row => meldHtml`
          <tr>
            ${columns.map(col => meldHtml`<td>${row[col.key]}</td>`)}
          </tr>
        `)}
      </tbody>
    </table>
  `;
});
