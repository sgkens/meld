import { defineMeld, meldHtml } from './src/meld.core.js';
defineMeld('heavy-widget', () => meldHtml`<div style="padding:20px; background:#ffd700;">I was lazy loaded!</div>`);
