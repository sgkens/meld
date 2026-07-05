/* ==========================================================================
   Meld.js Docs — Client JavaScript  v2
   Features:
     • Ctrl+K / Cmd+K → full search modal (2-col: categories + fuzzy preview)
     • Sidebar scroll-into-view for active item
     • Heading anchor links (§ glyph on hover)
     • Recently viewed  + Recently edited in right TOC
     • Copy-to-clipboard on all code blocks
     • Mermaid + highlight.js integration
     • Mobile sidebar with backdrop dismiss + Escape
     • Theme toggle with View Transitions API
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   0. Helpers
   -------------------------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/** Fuzzy-match: returns true if every char in `needle` appears in order in `haystack` */
const fuzzyMatch = (needle, haystack) => {
  const n = needle.toLowerCase();
  const h = haystack.toLowerCase();
  let hi = 0;
  for (let ni = 0; ni < n.length; ni++) {
    const pos = h.indexOf(n[ni], hi);
    if (pos === -1) return false;
    hi = pos + 1;
  }
  return true;
};

/** Highlight matched characters in a string (returns HTML) */
const highlightMatch = (needle, text) => {
  if (!needle) return escHtml(text);
  const lc = text.toLowerCase();
  const ln = needle.toLowerCase();
  let result = '';
  let ti = 0;
  let ni = 0;
  while (ti < text.length) {
    if (ni < ln.length && lc[ti] === ln[ni]) {
      result += `<mark>${escHtml(text[ti])}</mark>`;
      ni++;
    } else {
      result += escHtml(text[ti]);
    }
    ti++;
  }
  return result;
};

const escHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const getCssToken = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/* --------------------------------------------------------------------------
   1. Site Index  (used by search modal)
      Builds a flat list of all nav links from the left sidebar + their
      category labels, plus any h2/h3 headings within the current page.
   -------------------------------------------------------------------------- */
const buildSiteIndex = () => {
  const index = [];
  const sidebar = $('#docs-nav');

  if (sidebar) {
    $$('.nav-category', sidebar).forEach((cat) => {
      const categoryLabel = $('h2', cat)?.textContent?.trim() ?? 'Docs';
      $$('a', cat).forEach((link) => {
        index.push({
          type: 'page',
          category: categoryLabel,
          title: link.querySelector('span')?.textContent?.trim() ?? link.textContent.trim(),
          url: link.href,
          excerpt: '',
        });
      });
    });
  }

  // Also index headings on the current page as anchor entries
  const content = $('.docs-content');
  if (content) {
    const pageTitle = $('h1', content)?.textContent?.trim() ?? document.title;
    $$('h2[id], h3[id]', content).forEach((h) => {
      index.push({
        type: 'anchor',
        category: pageTitle,
        title: h.textContent.replace(/#$/, '').trim(),
        url: `${window.location.pathname}#${h.id}`,
        excerpt: h.nextElementSibling?.textContent?.slice(0, 120) ?? '',
      });
    });
  }

  return index;
};

/* --------------------------------------------------------------------------
   2. Recently Viewed  (localStorage)
   -------------------------------------------------------------------------- */
const VIEWED_KEY = 'meld-docs-viewed';
const EDITED_KEY = 'meld-docs-edited'; // static list baked at build time (simulated)
const MAX_RECENT = 6;

const getRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem(VIEWED_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const recordPageView = () => {
  const { pathname, href } = window.location;
  if (pathname === '/') return; // don't record landing
  const title =
    $('h1.docs-content h1')?.textContent?.trim() ||
    $('.docs-content h1')?.textContent?.trim() ||
    document.title.replace(' | Meld.js', '').trim();

  let views = getRecentlyViewed().filter((v) => v.url !== href);
  views.unshift({ title, url: href, ts: Date.now() });
  views = views.slice(0, MAX_RECENT);
  try {
    localStorage.setItem(VIEWED_KEY, JSON.stringify(views));
  } catch { /* quota */ }
};

/** Simulated "recently edited" from a static list embedded in a data attribute */
const getRecentlyEdited = () => {
  // Pages known to have been recently touched — updated at build time via
  // docs.11tydata.js or a similar global data file. For now we surface the
  // most recently-nav-ordered pages as a proxy.
  const links = $$('.nav-category a', $('#docs-nav'));
  return links.slice(0, 4).map((l) => ({
    title: l.querySelector('span')?.textContent?.trim() ?? l.textContent.trim(),
    url: l.href,
  }));
};

/* --------------------------------------------------------------------------
   3. Right TOC: On This Page + Recently Viewed + Recently Edited
   -------------------------------------------------------------------------- */
const buildPageToc = () => {
  const toc = $('[data-page-toc]');
  const content = $('.docs-content');

  if (!toc || !content) return;

  // Collect both standard headings and api-entry anchors
  const headings = $$('h2, h3', content).filter(
    (h) => h.textContent.trim().length > 0
  );

  // Also collect api-entry sections as TOC items
  const apiEntries = $$('.api-entry[id]', content);

  const hasAnchors = headings.length > 0 || apiEntries.length > 0;

  if (!hasAnchors) {
    toc.closest('.page-toc')?.setAttribute('hidden', '');
    return;
  }

  // Build standard heading anchors
  headings.forEach((heading) => {
    if (!heading.id) heading.id = slugify(heading.textContent.replace(/#$/, ''));

    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.className = `toc-depth-${heading.tagName === 'H3' ? '3' : '2'}`;
    link.textContent = heading.textContent.replace(/#$/, '').trim();
    toc.append(link);
  });

  // Build api-entry anchors into the TOC
  if (apiEntries.length > 0 && headings.length === 0) {
    const label = document.createElement('div');
    label.className = 'toc-api-label';
    label.textContent = 'Functions';
    toc.append(label);
  }
  apiEntries.forEach((entry) => {
    const fnName = entry.querySelector('.fn-name');
    if (!fnName) return;
    const link = document.createElement('a');
    link.href = `#${entry.id}`;
    link.className = 'toc-depth-3 toc-api-anchor';
    link.textContent = fnName.textContent.trim();
    link.dataset.apiEntry = entry.id;
    // Style with category color
    const cat = entry.dataset.category;
    const catColorMap = { core: 'var(--c-core)', dom: 'var(--c-dom)', lifecycle: 'var(--c-lifecycle)', context: 'var(--c-context)' };
    if (catColorMap[cat]) link.style.borderLeftColor = catColorMap[cat];
    toc.append(link);
  });

  // ── Append recently-viewed panel
  buildRecentlyViewedPanel();
};

const buildRecentlyViewedPanel = () => {
  const pageToc = $('.page-toc');
  if (!pageToc) return;

  // Existing panels? Remove and rebuild
  $$('.toc-recent-panel', pageToc).forEach((el) => el.remove());

  const views = getRecentlyViewed();
  const edits = getRecentlyEdited();

  if (views.length === 0 && edits.length === 0) return;

  const buildPanel = (titleText, icon, items) => {
    if (items.length === 0) return null;
    const section = document.createElement('div');
    section.className = 'toc-recent-panel';

    const heading = document.createElement('div');
    heading.className = 'toc-recent-title';
    heading.innerHTML = `<i data-lucide="${icon}"></i>${escHtml(titleText)}`;
    section.append(heading);

    const list = document.createElement('nav');
    list.className = 'toc-recent-list';
    items.forEach((item) => {
      const a = document.createElement('a');
      a.href = item.url;
      a.className = 'toc-recent-link';
      a.title = item.title;
      a.textContent = item.title;
      list.append(a);
    });
    section.append(list);
    return section;
  };

  const viewPanel = buildPanel('Recently Viewed', 'clock', views);
  const editPanel = buildPanel('Recently Edited', 'file-pen', edits);

  if (viewPanel) pageToc.append(viewPanel);
  if (editPanel) pageToc.append(editPanel);

  // Re-render icons for the new panel nodes
  if (window.lucide) window.lucide.createIcons({ nodes: [pageToc] });
};

/* --------------------------------------------------------------------------
   4. TOC Scroll-spy
   -------------------------------------------------------------------------- */
const bindTocHighlight = () => {
  const links = $$('[data-page-toc] a');
  const headings = links
    .map((l) => {
      try { return document.getElementById(new URL(l.href).hash.slice(1)); }
      catch { return null; }
    })
    .filter(Boolean);

  if (links.length === 0 || headings.length === 0 || !('IntersectionObserver' in window)) return;

  const activate = (id) => {
    links.forEach((l) => l.removeAttribute('aria-current'));
    const active = $(`[data-page-toc] a[href$="#${id}"]`);
    if (active) {
      active.setAttribute('aria-current', 'true');
      // Scroll the TOC link into view inside the aside
      active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) activate(visible.target.id);
    },
    { rootMargin: '-8% 0px -68% 0px' }
  );

  headings.forEach((h) => observer.observe(h));
};

/* --------------------------------------------------------------------------
   5. Sidebar: scroll active item into view
   -------------------------------------------------------------------------- */
const scrollSidebarToActive = () => {
  const sidebar = $('#docs-nav');
  if (!sidebar) return;
  const active = $('[aria-current="page"]', sidebar);
  if (!active) return;
  // Smooth scroll within the aside
  active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
};

/* --------------------------------------------------------------------------
   6. Heading Anchor Links
   -------------------------------------------------------------------------- */
const addHeadingAnchors = () => {
  const content = $('.docs-content');
  if (!content) return;

  $$('h2, h3', content).forEach((heading) => {
    // Ensure id
    if (!heading.id) heading.id = slugify(heading.textContent.replace(/#$/, ''));

    const anchor = document.createElement('a');
    anchor.href = `#${heading.id}`;
    anchor.className = 'heading-anchor';
    anchor.setAttribute('aria-label', `Permalink to: ${heading.textContent.trim()}`);
    anchor.textContent = '§';
    heading.append(anchor);
  });
};

/* --------------------------------------------------------------------------
   7. Ctrl+K Search Modal
   -------------------------------------------------------------------------- */
let searchIndex = [];
let modalOpen = false;
let selectedIdx = -1;

const openSearchModal = () => {
  const modal = $('#search-modal');
  if (!modal) return;
  modalOpen = true;
  modal.removeAttribute('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('search-open');

  const input = $('#search-modal-input');
  if (input) {
    input.value = '';
    input.focus();
  }
  selectedIdx = -1;

  // Populate categories in left column on open
  renderCategoryList('');
  renderResults('');
};

const closeSearchModal = () => {
  const modal = $('#search-modal');
  if (!modal) return;
  modalOpen = false;
  modal.setAttribute('hidden', '');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('search-open');
  selectedIdx = -1;
};

const renderCategoryList = (query) => {
  const col = $('#search-categories');
  if (!col) return;
  col.innerHTML = '';

  // Build category map
  const cats = new Map();
  searchIndex.forEach((item) => {
    if (!cats.has(item.category)) cats.set(item.category, []);
    const matches = !query || fuzzyMatch(query, item.title) || fuzzyMatch(query, item.category);
    if (matches) cats.get(item.category).push(item);
    else if (!cats.get(item.category)) cats.set(item.category, []);
  });

  const catColors = [
    'var(--accent-brand)',
    'var(--accent-cyan)',
    'var(--accent-emerald)',
    'var(--accent-indigo)',
    'var(--accent-amber)',
    'var(--accent-rose)',
  ];
  let colorIdx = 0;

  cats.forEach((items, catName) => {
    if (items.length === 0) return;
    const section = document.createElement('div');
    section.className = 'search-cat-section';

    const label = document.createElement('div');
    label.className = 'search-cat-label';
    label.style.color = catColors[colorIdx % catColors.length];
    label.textContent = catName;
    colorIdx++;

    const list = document.createElement('div');
    list.className = 'search-cat-list';

    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-cat-item';
      btn.dataset.url = item.url;
      btn.dataset.type = item.type;
      btn.innerHTML = `
        <span class="search-cat-icon">
          <i data-lucide="${item.type === 'anchor' ? 'hash' : 'file-text'}"></i>
        </span>
        <span class="search-cat-title">${highlightMatch(query, item.title)}</span>
      `;
      btn.addEventListener('click', () => navigate(item.url));
      btn.addEventListener('mouseenter', () => showPreview(item));
      list.append(btn);
    });
    section.append(label, list);
    col.append(section);
  });

  if (col.children.length === 0) {
    col.innerHTML = '<div class="search-empty">No categories match</div>';
  }

  if (window.lucide) window.lucide.createIcons({ nodes: [col] });
};

const renderResults = (query) => {
  const col = $('#search-results');
  if (!col) return;
  col.innerHTML = '';
  selectedIdx = -1;

  if (!query) {
    // Show recently viewed as default results
    const views = getRecentlyViewed();
    if (views.length > 0) {
      const label = document.createElement('div');
      label.className = 'search-results-label';
      label.textContent = 'Recently Viewed';
      col.append(label);
      views.forEach((v) => {
        const item = { type: 'page', title: v.title, url: v.url, category: 'History', excerpt: '' };
        col.append(makeResultItem(item, ''));
      });
    } else {
      col.innerHTML = '<div class="search-hint"><i data-lucide="keyboard"></i><span>Start typing to search across all docs</span></div>';
    }
    if (window.lucide) window.lucide.createIcons({ nodes: [col] });
    return;
  }

  const results = searchIndex.filter(
    (item) => fuzzyMatch(query, item.title) || fuzzyMatch(query, item.category) || fuzzyMatch(query, item.excerpt)
  ).slice(0, 20);

  if (results.length === 0) {
    col.innerHTML = `<div class="search-empty"><i data-lucide="search-x"></i><span>No results for "<strong>${escHtml(query)}</strong>"</span></div>`;
    if (window.lucide) window.lucide.createIcons({ nodes: [col] });
    return;
  }

  results.forEach((item) => col.append(makeResultItem(item, query)));
  if (window.lucide) window.lucide.createIcons({ nodes: [col] });
};

const makeResultItem = (item, query) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'search-result-item';
  btn.dataset.url = item.url;

  const icon = item.type === 'anchor' ? 'hash' : 'file-text';
  const catBadge = item.category
    ? `<span class="search-result-cat">${escHtml(item.category)}</span>`
    : '';
  const excerpt = item.excerpt
    ? `<span class="search-result-excerpt">${escHtml(item.excerpt.slice(0, 100))}…</span>`
    : '';

  btn.innerHTML = `
    <span class="search-result-icon"><i data-lucide="${icon}"></i></span>
    <span class="search-result-body">
      <span class="search-result-title">${highlightMatch(query, item.title)}</span>
      ${catBadge}
      ${excerpt}
    </span>
    <span class="search-result-enter"><i data-lucide="corner-down-left"></i></span>
  `;

  btn.addEventListener('click', () => navigate(item.url));
  btn.addEventListener('mouseenter', () => {
    $$('.search-result-item', $('#search-results')).forEach((b) => b.classList.remove('is-selected'));
    btn.classList.add('is-selected');
    showPreview(item);
  });

  return btn;
};

const showPreview = (item) => {
  const preview = $('#search-preview');
  if (!preview) return;

  preview.innerHTML = `
    <div class="search-preview-header">
      <span class="search-preview-cat">${escHtml(item.category)}</span>
      <a class="search-preview-url" href="${escHtml(item.url)}">${escHtml(item.url.replace(window.location.origin, ''))}</a>
    </div>
    <div class="search-preview-title">${escHtml(item.title)}</div>
    ${item.excerpt ? `<p class="search-preview-excerpt">${escHtml(item.excerpt)}</p>` : ''}
    <div class="search-preview-tip">
      <i data-lucide="corner-down-left"></i>
      Press Enter or click to navigate
    </div>
  `;
  if (window.lucide) window.lucide.createIcons({ nodes: [preview] });
};

const navigate = (url) => {
  closeSearchModal();
  window.location.href = url;
};

/** Arrow-key navigation across result items */
const navigateResults = (dir) => {
  const items = $$('.search-result-item:not([hidden])', $('#search-results'));
  if (items.length === 0) return;

  items.forEach((b) => b.classList.remove('is-selected'));
  selectedIdx = Math.max(0, Math.min(items.length - 1, selectedIdx + dir));
  items[selectedIdx]?.classList.add('is-selected');
  items[selectedIdx]?.scrollIntoView({ block: 'nearest' });

  // Show preview for selected
  const url = items[selectedIdx]?.dataset.url;
  if (url) {
    const found = searchIndex.find((i) => i.url === url);
    if (found) showPreview(found);
  }
};

const bindSearchModal = () => {
  const modal = $('#search-modal');
  if (!modal) return;

  const input = $('#search-modal-input');

  // Ctrl+K / Cmd+K / slash
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement.tagName;
    const inField = tag === 'INPUT' || tag === 'TEXTAREA';

    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !inField)) {
      e.preventDefault();
      modalOpen ? closeSearchModal() : openSearchModal();
      return;
    }

    if (!modalOpen) return;

    if (e.key === 'Escape') { closeSearchModal(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); navigateResults(1); return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); navigateResults(-1); return; }
    if (e.key === 'Enter') {
      const sel = $('.search-result-item.is-selected', $('#search-results'));
      if (sel?.dataset.url) navigate(sel.dataset.url);
    }
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSearchModal();
  });

  // Close button
  const closeBtn = $('#search-modal-close');
  closeBtn?.addEventListener('click', closeSearchModal);

  // Topbar search button opens modal
  const topbarInput = $('[data-docs-filter]');
  if (topbarInput) {
    topbarInput.addEventListener('focus', (e) => {
      e.preventDefault();
      topbarInput.blur();
      openSearchModal();
    });
    topbarInput.addEventListener('click', () => openSearchModal());
  }

  // Input handler
  if (input) {
    input.addEventListener('input', () => {
      const q = input.value.trim();
      renderCategoryList(q);
      renderResults(q);
    });
  }
};

/* --------------------------------------------------------------------------
   8. Sidebar search filter (small inline filter, secondary)
   -------------------------------------------------------------------------- */
const bindDocsFilter = () => {
  // Topbar input now opens the modal — handled in bindSearchModal
  // Nothing else to do here for now
};

/* --------------------------------------------------------------------------
   9. Copy-to-clipboard
   -------------------------------------------------------------------------- */
const bindCopyButtons = () => {
  const content = $('.docs-content');
  if (!content) return;

  $$('pre', content).forEach((pre) => {
    const code = $('code', pre);
    if (!code) return;

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.innerHTML = '<i data-lucide="copy"></i>';
    pre.style.position = 'relative';
    pre.append(btn);

    if (window.lucide) window.lucide.createIcons({ nodes: [btn] });

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.innerText);
        btn.classList.add('copied');
        btn.innerHTML = '<i data-lucide="check"></i> Copied!';
        if (window.lucide) window.lucide.createIcons({ nodes: [btn] });
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '<i data-lucide="copy"></i>';
          if (window.lucide) window.lucide.createIcons({ nodes: [btn] });
        }, 2000);
      } catch {
        btn.textContent = 'Error';
        setTimeout(() => {
          btn.innerHTML = '<i data-lucide="copy"></i>';
          if (window.lucide) window.lucide.createIcons({ nodes: [btn] });
        }, 1500);
      }
    });
  });
};

/* --------------------------------------------------------------------------
   10. Mermaid
   -------------------------------------------------------------------------- */
const prepareMermaid = () => {
  $$('pre > code.language-mermaid').forEach((block) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mermaid';
    wrapper.textContent = block.textContent;
    wrapper.dataset.mermaidSource = block.textContent;
    block.closest('pre').replaceWith(wrapper);
  });

  if (!window.mermaid) return;

  const isDark = document.documentElement.dataset.theme !== 'light';

  window.mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    themeVariables: {
      background: getCssToken('--bg-main') || (isDark ? '#080d18' : '#ffffff'),
      primaryColor: getCssToken('--bg-panel') || (isDark ? '#0d1526' : '#f1f4f9'),
      primaryTextColor: getCssToken('--text-main') || (isDark ? '#eef2f7' : '#111827'),
      primaryBorderColor: getCssToken('--accent-cyan') || '#06b6d4',
      lineColor: getCssToken('--text-faint') || (isDark ? '#59697e' : '#6b7280'),
      secondaryColor: getCssToken('--bg-hover') || (isDark ? '#152034' : '#e8ecf4'),
      tertiaryColor: getCssToken('--bg-panel-soft') || (isDark ? '#0d1526' : '#f4f6fb'),
      fontFamily: getCssToken('--font-body') || 'Inter, sans-serif',
      nodeBorder: getCssToken('--border-cyan') || '#06b6d4',
      clusterBkg: getCssToken('--bg-panel') || '#0d1526',
      clusterBorder: getCssToken('--border-strong') || '#334155',
      edgeLabelBackground: getCssToken('--bg-panel') || '#0d1526',
    },
  });

  window.mermaid.run({ querySelector: '.mermaid' });
};

const rerenderMermaid = () => {
  if (!window.mermaid) return;
  const diagrams = $$('.mermaid[data-processed="true"]');
  diagrams.forEach((diagram) => {
    const source = diagram.dataset.mermaidSource;
    if (!source) return;
    diagram.removeAttribute('data-processed');
    diagram.textContent = source;
  });
  if (diagrams.length > 0) {
    prepareMermaid();
  }
};



/* --------------------------------------------------------------------------
   12. Theme toggle
   -------------------------------------------------------------------------- */
const applyThemeIcon = () => {
  const toggles = $$('[data-theme-toggle]');
  toggles.forEach((toggle) => {
    const isLight = document.documentElement.dataset.theme === 'light';
    toggle.setAttribute('aria-pressed', String(isLight));
    toggle.innerHTML = `<i data-lucide="${isLight ? 'moon' : 'sun'}"></i>`;
    if (window.lucide) window.lucide.createIcons({ nodes: [toggle] });
  });
};

const setTheme = (theme) => {
  const update = () => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('meld-docs-theme', theme);
    applyThemeIcon();
    rerenderMermaid();
  };
  if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.startViewTransition(update);
  } else {
    update();
  }
};

/* --------------------------------------------------------------------------
   12.5 Release banner
   -------------------------------------------------------------------------- */
const bindReleaseBanner = () => {
  const banner = $('[data-release-banner]');
  if (!banner) return;
  const id = banner.dataset.releaseId || 'default';
  const storageKey = `meld-docs-release-dismissed:${id}`;
  const hideBanner = () => {
    banner.hidden = true;
    delete document.body.dataset.releaseBanner;
  };

  try {
    if (localStorage.getItem(storageKey) === 'true') {
      hideBanner();
      return;
    }
  } catch { /* storage unavailable */ }

  document.body.dataset.releaseBanner = 'visible';

  $('[data-release-banner-dismiss]', banner)?.addEventListener('click', () => {
    hideBanner();
    try {
      localStorage.setItem(storageKey, 'true');
    } catch { /* storage unavailable */ }
  });
};

const bindThemeToggle = () => {
  applyThemeIcon();
  $$('[data-theme-toggle]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      setTheme(next);
    });
  });
};

/* --------------------------------------------------------------------------
   13. Mobile sidebar
   -------------------------------------------------------------------------- */
const bindSidebarToggle = () => {
  const toggle = $('[data-sidebar-toggle]');
  if (!toggle) return;
  const nav = $('#docs-nav');

  const close = () => {
    document.body.dataset.sidebarOpen = 'false';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<i data-lucide="menu"></i>';
    if (window.lucide) window.lucide.createIcons({ nodes: [toggle] });
  };

  const open = () => {
    document.body.dataset.sidebarOpen = 'true';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.innerHTML = '<i data-lucide="x"></i>';
    if (window.lucide) window.lucide.createIcons({ nodes: [toggle] });
    $('a', nav)?.focus();
  };

  toggle.addEventListener('click', () => {
    document.body.dataset.sidebarOpen === 'true' ? close() : open();
  });

  if (nav) $$('a', nav).forEach((l) => l.addEventListener('click', close));

  document.addEventListener('click', (e) => {
    if (document.body.dataset.sidebarOpen === 'true' &&
        nav && !nav.contains(e.target) && !toggle.contains(e.target)) {
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.dataset.sidebarOpen === 'true') {
      close();
      toggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 769px)').matches) close();
  });
};

/* --------------------------------------------------------------------------
   14. Render Lucide icons
   -------------------------------------------------------------------------- */
const renderIcons = () => {
  if (window.lucide) window.lucide.createIcons();
};

/* --------------------------------------------------------------------------
   14.5. API Reference Filter Chips
   -------------------------------------------------------------------------- */
const initApiFilter = () => {
  const chips = $$('.api-chip');
  if (chips.length === 0) return;
  const entries = $$('.api-entry');
  const categoryColors = {
    core: 'var(--c-core)',
    dom: 'var(--c-dom)',
    lifecycle: 'var(--c-lifecycle)',
    context: 'var(--c-context)'
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      chips.forEach(c => {
        c.classList.remove('is-active');
        c.style.background = '';
        c.style.borderColor = '';
        c.style.color = '';
      });
      chip.classList.add('is-active');

      if (filter === 'all') {
        chip.style.background = 'var(--text-main)';
        chip.style.borderColor = 'var(--text-main)';
        chip.style.color = 'var(--bg-main)';
      } else {
        const color = categoryColors[filter];
        chip.style.background = color;
        chip.style.borderColor = color;
        chip.style.color = 'var(--bg-main)';
      }

      entries.forEach(entry => {
        const visible = filter === 'all' || entry.dataset.category === filter;
        entry.style.display = visible ? '' : 'none';
      });

      // Sync TOC api anchors to match filter
      $$('.toc-api-anchor', $('[data-page-toc]')).forEach(link => {
        const entryId = link.dataset.apiEntry;
        const entry = entryId ? document.getElementById(entryId) : null;
        if (link) link.style.display = (entry && entry.style.display !== 'none') ? '' : 'none';
      });
    });
  });
};

const enhanceApiTables = () => {
  const content = $('.docs-content');
  if (!content) return;

  $$('table', content).forEach((table) => {
    if (table.classList.contains('api-params')) return;
    const headers = $$('th', table).map((th) => th.textContent.trim().toLowerCase());
    const hasReferenceShape =
      headers.includes('type') ||
      headers.includes('default') ||
      headers.includes('required') ||
      headers.includes('description') ||
      headers.includes('property') ||
      headers.includes('option') ||
      headers.includes('api');

    if (hasReferenceShape) {
      table.classList.add('api-reference-table');
    }
  });
};

/* --------------------------------------------------------------------------
   15. Init
   -------------------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  bindReleaseBanner();

  // Record this page as visited
  recordPageView();

  // Build the search index from the sidebar
  searchIndex = buildSiteIndex();

  // Bind all features
  buildPageToc();
  bindTocHighlight();
  bindThemeToggle();
  bindSidebarToggle();
  bindDocsFilter();
  bindSearchModal();
  initApiFilter();
  enhanceApiTables();
  prepareMermaid();
  bindCopyButtons();
  addHeadingAnchors();
  renderIcons();

  // Scroll active sidebar item into view (after icons render)
  requestAnimationFrame(scrollSidebarToActive);
});
