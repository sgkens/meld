import { defineMeld, meldHtml } from '../../meld.core.js';

defineMeld('m-avatar', (el) => {
  const src = el.getAttribute('src');
  const name = el.getAttribute('name') || '?';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return meldHtml`
    <style>
      .avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--mui-surface); display: flex; align-items: center; justify-content: center; font-weight: 600; overflow: hidden; }
      img { width: 100%; height: 100%; object-fit: cover; }
    </style>
    <div class="avatar">
      ${src ? meldHtml`<img src="${src}" />` : initials}
    </div>
  `;
});
