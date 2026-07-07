import { defineMeld, meldHtml, use, computed, inject, provide } from '../../../src/meld.core.js';
import { MeldRouter } from '../../../src/plugins/meld-router.js';
import { MeldA11y } from '../../../src/plugins/meld-a11y.js';
import { MeldLogger } from '../../../src/plugins/meld-logger.js';
import { MeldTime } from '../../../src/plugins/meld-time.js';
import { MeldPortal } from '../../../src/plugins/meld-portal.js';
import { MeldDevtools } from '../../../src/plugins/meld-devtools.js';
import { MeldForms } from '../../../src/plugins/meld-forms.js';
import { MeldStore } from '../../../src/plugins/meld-store.js';

import { MeldPersist } from '../../../src/plugins/meld-persist.js';
import { MeldBroadcast } from '../../../src/plugins/meld-broadcast.js';
import { MeldMarkdown } from '../../../src/plugins/meld-markdown.js';
import { MeldAI } from '../../../src/plugins/meld-ai.js';
import { MeldDownload } from '../../../src/plugins/meld-download.js';

import { store, actions } from '../store.js';
import './pages.js';
import './dev-panel.js';

// Activate and install Meld Plugins
use(MeldStore);
use(MeldForms);
use(MeldA11y);
use(MeldLogger);
use(MeldTime);
use(MeldPortal);
use(MeldDevtools); // Custom updates flashing plugin
use(MeldPersist);
use(MeldBroadcast);
use(MeldMarkdown);
use(MeldAI);
use(MeldDownload);

// Setup client side hash router config
use(MeldRouter, {
  routes: [
    { path: '/', component: 'page-dashboard' },
    { path: '/board', component: 'page-board' },
    { path: '/activity', component: 'page-activity' },
    { path: '/archive', component: 'page-archive' },
    { path: '/settings', component: 'page-settings' }
  ]
});

defineMeld('app-root', (el) => {
  const router = inject('router') || window.MeldRouter;
  provide('router', router);
  
  // Inject body data-theme state on load
  document.body.setAttribute('data-theme', store.theme);

  const activeCount = computed(() => {
    return store.tasks.filter(t => t.status !== 'done').length;
  });

  const getNavLinkClass = (path) => {
    return computed(() => router.currentPath === path ? 'nav-link active' : 'nav-link')();
  };

  const getDevModeClass = () => {
    return store.devMode ? 'dev-indicator active' : 'dev-indicator';
  };

  return meldHtml`
    <style>
      :host {
        display: flex;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background: transparent;
        color: var(--mui-fg);
        font-family: var(--mui-font);
      }

      .sidebar {
        width: 250px;
        background: color-mix(in srgb, var(--mui-surface) 80%, transparent);
        backdrop-filter: blur(16px);
        border-right: 1px solid var(--mui-border);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: var(--mui-space-6) var(--mui-space-4);
        flex-shrink: 0;
      }

      .sidebar-top {
        display: flex;
        flex-direction: column;
        gap: var(--mui-space-6);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: var(--mui-space-2);
        padding-left: var(--mui-space-2);
      }
      .brand img {
        width: 28px;
        height: 28px;
      }
      .brand-title {
        font-weight: 700;
        font-size: 1.15rem;
        margin: 0;
        letter-spacing: -0.02em;
        background: linear-gradient(135deg, var(--mui-primary), var(--mui-accent-amber));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .nav-links {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--mui-fg);
        opacity: 0.7;
        text-decoration: none;
        padding: 10px 12px;
        border-radius: var(--mui-radius-md);
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s;
      }
      .nav-link:hover {
        opacity: 1;
        background: var(--mui-border);
      }
      .nav-link.active {
        opacity: 1;
        background: var(--mui-primary);
        color: var(--mui-primary-fg);
        -webkit-text-fill-color: var(--mui-primary-fg);
      }

      .main-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--mui-space-8);
        background: transparent;
      }

      .sidebar-bottom {
        display: flex;
        flex-direction: column;
        gap: var(--mui-space-4);
        border-top: 1px solid var(--mui-border);
        padding-top: var(--mui-space-4);
      }

      .telemetry-summary {
        font-size: 0.75rem;
        color: #64748b;
        display: flex;
        flex-direction: column;
        gap: var(--mui-space-1);
        padding: var(--mui-space-1) var(--mui-space-2);
      }

      .dev-indicator-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .dev-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #64748b;
        transition: background-color 0.3s;
      }
      .dev-indicator.active {
        background-color: var(--mui-primary);
        box-shadow: 0 0 8px var(--mui-primary);
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }

      .theme-btn {
        background: var(--mui-surface);
        border: 1px solid var(--mui-border);
        color: var(--mui-fg);
        border-radius: var(--mui-radius-md);
        padding: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        transition: all 0.2s;
      }
      .theme-btn:hover {
        background: var(--mui-border);
      }

      .badge-todo {
        background: color-mix(in srgb, var(--mui-primary) 15%, transparent);
        color: var(--mui-primary);
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 700;
        margin-left: auto;
      }
      .nav-link.active .badge-todo {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
      }
    </style>

    <div class="sidebar">
      <div class="sidebar-top">
        <div class="brand">
          <img src="../logo.svg" alt="Meld Logo" />
          <h2 class="brand-title">Meld TaskFlow</h2>
        </div>

        <nav class="nav-links">
          <a href="#/" class="${() => getNavLinkClass('/')}">
            <span>📊</span> Dashboard
          </a>
          <a href="#/board" class="${() => getNavLinkClass('/board')}">
            <span>📋</span> Kanban Board
            <span class="badge-todo">${() => activeCount()}</span>
          </a>
          <a href="#/activity" class="${() => getNavLinkClass('/activity')}">
            <span>🕒</span> Activity Log
          </a>
          <a href="#/archive" class="${() => getNavLinkClass('/archive')}">
            <span>📦</span> Archive
          </a>
          <a href="#/settings" class="${() => getNavLinkClass('/settings')}">
            <span>⚙️</span> Settings
          </a>
        </nav>
      </div>

      <div class="sidebar-bottom">
        <button class="theme-btn" onclick="${actions.toggleTheme}">
          ${() => store.theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>

        <div class="telemetry-summary">
          <div class="dev-indicator-row">
            <span class="${() => getDevModeClass()}"></span>
            <span>Highlights: <strong>${() => store.devMode ? 'ENABLED' : 'DISABLED'}</strong></span>
          </div>
          <span>Active Tasks: <strong>${() => activeCount()}</strong></span>
        </div>
      </div>
    </div>

    <main class="main-content">
      <meld-view></meld-view>
    </main>

    <!-- FLOATING DEVTOOLS TELETEMRY CONSOLE -->
    <dev-panel></dev-panel>
  `;
});
