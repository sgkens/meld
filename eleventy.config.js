import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';

// Explicit category order for the sidebar and collection index.
// Keep in sync with docs/docs.11tydata.js → categoryOrder.
const CATEGORY_ORDER = [
  'Foundations',
  'Getting Started',
  'Architecture',
  'Core Concepts',
  'Plugins',
  'Plugin Ecosystem',
  'Components',
  'Integrations',
  'Stacks',
  'Bootcamp',
  'Tooling'
];

export default function eleventyConfig(config) {
  // Server-side syntax highlighting via Prism (outputs .language-* classes
  // that are styled by docs/assets/prism-meld.css — the "Meld Ember" theme).
  // We disable the bundled Prism CSS so our custom theme takes full control.
  config.addPlugin(syntaxHighlight, {
    preAttributes: { tabindex: '0' }
  });

  const toTitleCase = (value) => {
    return String(value)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const categoryLabel = (inputPath) => {
    if (!inputPath) {
      return 'Guides';
    }

    const parts = inputPath.replace(/^\.?\/?docs\//, '').split('/');
    if (parts.length === 1) {
      const slug = parts[0].replace(/\.(md|njk)$/, '');
      const knownCategories = ['architecture', 'bootcamp', 'components', 'integrations', 'plugins', 'stacks', 'tooling'];
      if (knownCategories.includes(slug)) {
        return toTitleCase(slug);
      }
      return 'Foundations';
    }

    return toTitleCase(parts[0]);
  };

  const categoryId = (label) => {
    return String(label ?? 'guides')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const sortPages = (pages) => {
    return [...pages].sort((a, b) => {
      const aOrder = Number(a.data.nav_order ?? Number.MAX_SAFE_INTEGER);
      const bOrder = Number(b.data.nav_order ?? Number.MAX_SAFE_INTEGER);

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      const aTitle = a.data.title ?? a.fileSlug;
      const bTitle = b.data.title ?? b.fileSlug;

      return aTitle.localeCompare(bTitle);
    });
  };

  config.addPassthroughCopy({
    'docs/assets': 'assets',
    'docs/_redirects': '_redirects'
  });
  config.addPassthroughCopy('logo.svg');
  config.ignores.add('docs/skipped/**');
  config.ignores.add('docs/index.html');

  config.addFilter('categoryLabel', categoryLabel);
  config.addFilter('categoryId', categoryId);

  config.addFilter('categoryDocs', (allPages, inputPath) => {
    const label = categoryLabel(inputPath);
    const categoryPages = allPages.filter((p) => categoryLabel(p.inputPath) === label);
    return sortPages(categoryPages);
  });

  const getDocsCategories = (pages) => {
    const groups = new Map();
    const rootIndexBySlug = new Map();

    for (const page of pages) {
      const normalizedInputPath = page.inputPath.replace(/^\.?\//, '');
      const rootMatch = normalizedInputPath.match(/^docs\/([^/]+)\.(md|njk)$/);

      if (rootMatch) {
        rootIndexBySlug.set(rootMatch[1], page.url);
      }
    }

    for (const page of pages) {
      const label = categoryLabel(page.inputPath);
      const id = categoryId(label);

      if (!groups.has(id)) {
        groups.set(id, { id, label, items: [], indexUrl: `/${id}/`, hasDocumentIndex: false });
      }

      const group = groups.get(id);
      group.items.push(page);

      if (rootIndexBySlug.has(id)) {
        group.indexUrl = rootIndexBySlug.get(id);
        group.hasDocumentIndex = true;
      }
    }

    // Read explicit category order from CATEGORY_ORDER constant.
    // Pages outside the ordered list fall alphabetically after listed categories.
    const getCategoryRank = (label) => {
      const idx = CATEGORY_ORDER.indexOf(label);
      return idx === -1 ? CATEGORY_ORDER.length : idx;
    };

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        items: sortPages(group.items)
      }))
      .sort((a, b) => {
        const rankA = getCategoryRank(a.label);
        const rankB = getCategoryRank(b.label);
        if (rankA !== rankB) return rankA - rankB;
        return a.label.localeCompare(b.label);
      });
  };

  config.addFilter('breadcrumbs', (url) => {
    if (!url || url === '/') {
      return [{ label: 'Docs', url: '/' }];
    }

    const segments = url.split('/').filter(Boolean);
    const crumbs = [{ label: 'Docs', url: '/' }];
    let current = '';

    for (const segment of segments) {
      current += `/${segment}`;
      crumbs.push({
        label: toTitleCase(segment),
        url: `${current}/`
      });
    }

    return crumbs;
  });

  const adjacentDoc = (items, inputPath, offset) => {
    if (!Array.isArray(items) || !inputPath) {
      return null;
    }

    const index = items.findIndex((item) => item.inputPath === inputPath);
    if (index === -1) {
      return null;
    }

    return items[index + offset] ?? null;
  };

  config.addFilter('previousDoc', (items, inputPath) => adjacentDoc(items, inputPath, -1));
  config.addFilter('nextDoc', (items, inputPath) => adjacentDoc(items, inputPath, 1));

  config.addCollection('docsNav', (collectionApi) => {
    return sortPages(collectionApi.getFilteredByGlob('docs/**/*.md'));
  });

  config.addCollection('docsCategories', (collectionApi) => {
    return getDocsCategories(collectionApi.getFilteredByGlob('docs/**/*.md'));
  });

  config.addCollection('docsCategoryIndexes', (collectionApi) => {
    return getDocsCategories(collectionApi.getFilteredByGlob('docs/**/*.md'))
      .filter((category) => category.id !== 'foundations' && !category.hasDocumentIndex);
  });

  const apiReferenceLinks = new Map([
    ['defineMeld', 'defineMeld'],
    ['meldState', 'meldState'],
    ['computed', 'computed'],
    ['meldHtml', 'meldHtml'],
    ['onMount', 'onMount'],
    ['onDestroy', 'onDestroy'],
    ['provide', 'provide'],
    ['inject', 'inject'],
    ['use', 'use'],
    ['meld.theme', 'meldTheme'],
    ['meld.raw', 'meldRaw'],
    ['meld.list', 'meldList'],
    ['meld.css', 'meldCss'],
    ['meld.style', 'meldStyle']
  ]);

  config.addTransform('apiReferenceLinks', function(content) {
    if (!this.page?.outputPath?.endsWith('.html')) {
      return content;
    }

    return content.replace(/<code>([^<]+)<\/code>/g, (match, codeText) => {
      const value = codeText.trim();
      const anchor = apiReferenceLinks.get(value);

      if (!anchor || this.page.url === '/api-reference/') {
        return match;
      }

      return `<code><a href="/api-reference/#${anchor}">${codeText}</a></code>`;
    });
  });

  return {
    dir: {
      input: 'docs',
      includes: '_includes',
      output: '_site'
    },
    templateFormats: ['html', 'md', 'njk'],
    markdownTemplateEngine: false,
    htmlTemplateEngine: 'njk'
  };
}
