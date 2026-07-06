const root = document.documentElement;
const nav = document.querySelector('#site-nav');
const navToggle = document.querySelector('.nav-toggle');
const themeToggle = document.querySelector('.theme-toggle');

const storedTheme = localStorage.getItem('meld-docs-theme');
if (storedTheme) root.setAttribute('data-theme', storedTheme);

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  nav?.setAttribute('data-open', String(!expanded));
});

themeToggle?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  const apply = () => {
    root.setAttribute('data-theme', next);
    localStorage.setItem('meld-docs-theme', next);
  };

  if (document.startViewTransition) {
    document.startViewTransition(apply);
  } else {
    apply();
  }
});

document.querySelectorAll('[data-tabs]').forEach((tabs) => {
  const buttons = tabs.querySelectorAll('[role="tab"]');
  const panels = tabs.querySelectorAll('[data-panel]');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.tab;
      buttons.forEach((item) => item.setAttribute('aria-selected', String(item === button)));
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== target;
      });
    });
  });
});

const filter = document.querySelector('#plugin-filter');
const pluginCards = document.querySelectorAll('#plugin-grid article');
filter?.addEventListener('input', () => {
  const query = filter.value.trim().toLowerCase();
  pluginCards.forEach((card) => {
    const haystack = `${card.textContent} ${card.dataset.plugin}`.toLowerCase();
    card.hidden = query.length > 0 && !haystack.includes(query);
  });
});

const tocLinks = [...document.querySelectorAll('.toc a')];
const sections = tocLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const updateCurrentSection = () => {
  const active = sections.filter((section) => section.getBoundingClientRect().top < 120).pop() || sections[0];
  tocLinks.forEach((link) => {
    link.toggleAttribute('aria-current', link.getAttribute('href') === `#${active?.id}`);
  });
};

updateCurrentSection();
document.addEventListener('scroll', updateCurrentSection, { passive: true });
