/* ==========================================================================
   Meld.js Docs — Client JavaScript
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */
const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* --------------------------------------------------------------------------
   Theme toggle
   -------------------------------------------------------------------------- */
const applyThemeIcon = () => {
  const toggle = $('[data-theme-toggle]');
  if (!toggle) return;

  const isLight = document.documentElement.dataset.theme === 'light';
  toggle.setAttribute('aria-pressed', String(isLight));
  toggle.innerHTML = `<i data-lucide="${isLight ? 'moon' : 'sun'}"></i>`;
  if (window.lucide) window.lucide.createIcons({ nodes: [toggle] });
};

const setTheme = (theme) => {
  const update = () => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('meld-docs-theme', theme);
    applyThemeIcon();
  };

  if (
    document.startViewTransition &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    document.startViewTransition(update);
  } else {
    update();
  }
};

const bindThemeToggle = () => {
  const toggle = $('[data-theme-toggle]');
  if (!toggle) return;

  applyThemeIcon();
  toggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  });
};

/* --------------------------------------------------------------------------
   Mobile sidebar toggle
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
    // Focus first nav link
    if (nav) {
      const firstLink = $('a', nav);
      if (firstLink) firstLink.focus();
    }
  };

  toggle.addEventListener('click', () => {
    const isOpen = document.body.dataset.sidebarOpen === 'true';
    isOpen ? close() : open();
  });

  // Close on nav link click (mobile)
  if (nav) {
    $$('a', nav).forEach((link) => link.addEventListener('click', close));
  }

  // Close on backdrop click (the ::before pseudo-element covers the page)
  document.addEventListener('click', (e) => {
    if (
      document.body.dataset.sidebarOpen === 'true' &&
      nav &&
      !nav.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      close();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.dataset.sidebarOpen === 'true') {
      close();
      toggle.focus();
    }
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 769px)').matches) close();
  });
};

/* --------------------------------------------------------------------------
   Page TOC builder
   -------------------------------------------------------------------------- */
const buildPageToc = () => {
  const toc = $('[data-page-toc]');
  const content = $('.docs-content');

  if (!toc || !content) return;

  const headings = $$('h2, h3', content).filter(
    (h) => h.textContent.trim().length > 0
  );

  if (headings.length === 0) {
    toc.closest('.page-toc')?.setAttribute('hidden', '');
    return;
  }

  headings.forEach((heading) => {
    if (!heading.id) heading.id = slugify(heading.textContent);

    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.className = `toc-depth-${heading.tagName === 'H3' ? '3' : '2'}`;
    link.textContent = heading.textContent.replace(/^#+\s*/, '');
    toc.append(link);
  });
};

/* --------------------------------------------------------------------------
   TOC scroll-spy
   -------------------------------------------------------------------------- */
const bindTocHighlight = () => {
  const links = $$('[data-page-toc] a');
  const headings = links
    .map((l) => document.getElementById(l.hash.slice(1)))
    .filter(Boolean);

  if (links.length === 0 || headings.length === 0 || !('IntersectionObserver' in window)) return;

  const activate = (id) => {
    links.forEach((l) => l.removeAttribute('aria-current'));
    const active = $(`[data-page-toc] a[href="#${id}"]`);
    if (active) active.setAttribute('aria-current', 'true');
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) activate(visible.target.id);
    },
    { rootMargin: '-10% 0px -70% 0px' }
  );

  headings.forEach((h) => observer.observe(h));
};

/* --------------------------------------------------------------------------
   Sidebar search / filter
   -------------------------------------------------------------------------- */
const bindDocsFilter = () => {
  const input = $('[data-docs-filter]');
  const nav = $('.category-nav');

  if (!input) return;

  if (!nav) {
    // On landing page: pressing Enter navigates to installation
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        window.location.href = `/installation/?q=${encodeURIComponent(input.value.trim())}`;
      }
    });
    return;
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();

    $$('.nav-category', nav).forEach((cat) => {
      let visible = 0;
      $$('a', cat).forEach((link) => {
        const match = link.textContent.toLowerCase().includes(q);
        link.hidden = !match;
        if (match) visible++;
      });
      cat.hidden = visible === 0;
    });
  });

  // Keyboard shortcut: / or Ctrl+K to focus search
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement.tagName;
    if ((e.key === '/' || (e.key === 'k' && (e.ctrlKey || e.metaKey))) &&
        tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault();
      input.focus();
      input.select();
    }
    if (e.key === 'Escape' && document.activeElement === input) {
      input.blur();
      input.value = '';
      input.dispatchEvent(new Event('input'));
    }
  });
};

/* --------------------------------------------------------------------------
   Copy-to-clipboard for code blocks
   -------------------------------------------------------------------------- */
const bindCopyButtons = () => {
  const content = $('.docs-content');
  if (!content) return;

  $$('pre', content).forEach((pre) => {
    const code = $('code', pre);
    if (!code) return;

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.setAttribute('type', 'button');
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
        btn.textContent = 'Failed';
        setTimeout(() => {
          btn.innerHTML = '<i data-lucide="copy"></i>';
          if (window.lucide) window.lucide.createIcons({ nodes: [btn] });
        }, 1500);
      }
    });
  });
};

/* --------------------------------------------------------------------------
   Mermaid diagrams
   -------------------------------------------------------------------------- */
const prepareMermaid = () => {
  $$('pre > code.language-mermaid').forEach((block) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mermaid';
    wrapper.textContent = block.textContent;
    block.closest('pre').replaceWith(wrapper);
  });

  if (!window.mermaid) return;

  const isDark = document.documentElement.dataset.theme !== 'light';

  window.mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: isDark ? 'dark' : 'default',
    themeVariables: {
      background: isDark ? '#04060b' : '#ffffff',
      primaryColor: isDark ? '#0d1526' : '#f1f4f9',
      primaryTextColor: isDark ? '#eef2f7' : '#111827',
      primaryBorderColor: '#06b6d4',
      lineColor: isDark ? '#59697e' : '#9ca3af',
      secondaryColor: isDark ? '#152034' : '#e8ecf4',
      tertiaryColor: isDark ? '#080d18' : '#f4f6fb',
    },
  });

  window.mermaid.run({ querySelector: '.mermaid' });
};

/* --------------------------------------------------------------------------
   Syntax highlighting
   -------------------------------------------------------------------------- */
const highlightCode = () => {
  if (!window.hljs) return;
  $$('pre code:not(.language-mermaid)').forEach((block) =>
    window.hljs.highlightElement(block)
  );
};

/* --------------------------------------------------------------------------
   Heading anchor links
   -------------------------------------------------------------------------- */
const addHeadingAnchors = () => {
  const content = $('.docs-content');
  if (!content) return;

  $$('h2[id], h3[id]', content).forEach((heading) => {
    const anchor = document.createElement('a');
    anchor.href = `#${heading.id}`;
    anchor.className = 'heading-anchor';
    anchor.setAttribute('aria-label', `Permalink: ${heading.textContent}`);
    anchor.innerHTML = '#';
    heading.append(anchor);
  });
};

/* --------------------------------------------------------------------------
   Render Lucide icons
   -------------------------------------------------------------------------- */
const renderIcons = () => {
  if (window.lucide) window.lucide.createIcons();
};

/* --------------------------------------------------------------------------
   Init
   -------------------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  buildPageToc();
  bindDocsFilter();
  bindTocHighlight();
  bindThemeToggle();
  bindSidebarToggle();
  highlightCode();
  prepareMermaid();
  bindCopyButtons();
  addHeadingAnchors();
  renderIcons();
});
