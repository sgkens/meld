import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';

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
    return pages.sort((a, b) => {
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
    'docs/**/*.svg': '.',
    'docs/assets': 'assets'
  });

  config.addFilter('categoryLabel', categoryLabel);
  config.addFilter('categoryId', categoryId);

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
    const groups = new Map();
    const pages = collectionApi.getFilteredByGlob('docs/**/*.md');

    for (const page of pages) {
      const label = categoryLabel(page.inputPath);
      const id = categoryId(label);

      if (!groups.has(id)) {
        groups.set(id, { id, label, items: [] });
      }

      groups.get(id).items.push(page);
    }

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        items: sortPages(group.items)
      }))
      .sort((a, b) => {
        if (a.label === 'Foundations') {
          return -1;
        }

        if (b.label === 'Foundations') {
          return 1;
        }

        return a.label.localeCompare(b.label);
      });
  });

  return {
    dir: {
      input: 'docs',
      includes: '_includes',
      output: '_site'
    },
    markdownTemplateEngine: false,
    htmlTemplateEngine: 'njk'
  };
}
