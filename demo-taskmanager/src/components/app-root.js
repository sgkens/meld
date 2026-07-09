import { defineMeld, meldHtml, use, computed, inject, provide, meldState } from '../../../src/meld.core.js';
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
import { MeldHotkeys } from '../../../src/plugins/meld-hotkeys.js';
import { MeldToast } from '../../../src/plugins/meld-toast.js';

import { store, actions } from '../store.js';
import './pages.js';
import './dev-panel.js';
import './user-login.js';

// Import framework UI Web Components
import '../../../src/components/index.js';

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
use(MeldHotkeys);
use(MeldToast);

// Setup client side hash router config
use(MeldRouter, {
  routes: [
    { path: '/', component: 'page-dashboard' },
    { path: '/board', component: 'page-board' },
    { path: '/wiki', component: 'page-wiki' },
    { path: '/activity', component: 'page-activity' },
    { path: '/archive', component: 'page-archive' },
    { path: '/settings', component: 'page-settings' }
  ]
});

defineMeld('app-root', (el, { useHotkeys }) => {
  const router = inject('router') || window.MeldRouter;
  provide('router', router);
  
  const localState = meldState({
    isCollapsed: false
  });

  // Bind global keyboard shortcuts
  useHotkeys({
    'ctrl+t': () => {
      actions.toggleTheme();
    },
    'ctrl+d': () => {
      actions.toggleDevMode();
    },
    'ctrl+1': () => {
      window.location.hash = '#/';
    },
    'ctrl+2': () => {
      window.location.hash = '#/board';
    },
    'ctrl+3': () => {
      window.location.hash = '#/wiki';
    },
    'ctrl+4': () => {
      window.location.hash = '#/activity';
    },
    'ctrl+5': () => {
      window.location.hash = '#/archive';
    },
    'ctrl+6': () => {
      window.location.hash = '#/settings';
    }
  });
  
  // Inject body data-theme state on load
  document.body.setAttribute('data-theme', store.theme);

  const activeCount = computed(() => {
    return store.tasks.filter(t => t.status !== 'done').length;
  });

  const getNavLinkClass = (path) => {
    return computed(() => router.currentPath === path ? 'nav-link active' : 'nav-link')();
  };

  const getSidebarClass = () => {
    return localState.isCollapsed ? 'sidebar collapsed' : 'sidebar';
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
        transition: width 0.3s var(--mui-ease), padding 0.3s var(--mui-ease);
      }

      .sidebar.collapsed {
        width: 80px;
        padding: var(--mui-space-6) var(--mui-space-2);
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
        position: relative;
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
        transition: opacity 0.25s var(--mui-ease);
        opacity: 1;
      }
      .sidebar.collapsed .brand-title {
        opacity: 0;
        width: 0;
        height: 0;
        overflow: hidden;
      }
      .sidebar.collapsed .nav-section-title {
        display: none;
      }
      .sidebar.collapsed .nav-text {
        display: none;
      }
      .sidebar.collapsed .user-details {
        display: none;
      }
      .sidebar.collapsed .user-profile-widget {
        justify-content: center;
        padding-bottom: 0 !important;
        border-bottom: none !important;
      }
      .sidebar.collapsed .theme-text {
        display: none;
      }
      .sidebar.collapsed .telemetry-summary {
        display: none;
      }

      .collapse-btn {
        background: transparent;
        border: none;
        color: var(--mui-fg);
        cursor: pointer;
        font-size: 0.85rem;
        padding: 6px;
        border-radius: var(--mui-radius-sm);
        transition: all 0.2s;
        opacity: 0.5;
        margin-left: auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .collapse-btn:hover {
        opacity: 1;
        background: var(--mui-border);
      }
      .sidebar.collapsed .collapse-btn {
        margin-left: 0;
        width: 100%;
      }

      .nav-links {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 14px;
        color: var(--mui-fg);
        opacity: 0.8;
        text-decoration: none;
        padding: 12px 16px;
        border-radius: var(--mui-radius-lg);
        font-size: 0.95rem;
        font-weight: 500;
        transition: all 0.25s var(--mui-ease);
      }
      .nav-link:hover {
        opacity: 1;
        background: color-mix(in srgb, var(--mui-primary) 10%, transparent);
        transform: translateX(4px);
      }
      .nav-link.active {
        opacity: 1;
        background: var(--mui-primary);
        color: var(--mui-primary-fg);
        -webkit-text-fill-color: var(--mui-primary-fg);
        box-shadow: 0 4px 12px color-mix(in srgb, var(--mui-primary) 25%, transparent);
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

    ${() => store.currentUser ? meldHtml`
      <div class="${getSidebarClass}">
        <div class="sidebar-top">
          <div class="brand">
            <img src="../logo.svg" alt="Meld Logo" />
            <h2 class="brand-title">Meld TaskFlow</h2>
            <button class="collapse-btn" onclick="${() => { localState.isCollapsed = !localState.isCollapsed; }}" title="Toggle Sidebar">
              ${() => localState.isCollapsed ? '▶' : '◀'}
            </button>
          </div>

          <div class="nav-section-title" style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.05em; margin: 15px 0 8px 12px;">Workspace</div>
          <nav class="nav-links" style="margin-bottom: 10px;">
            <a href="#/" class="${() => getNavLinkClass('/')}">
              <span>📊</span> <span class="nav-text">Dashboard</span>
            </a>
            <a href="#/board" class="${() => getNavLinkClass('/board')}">
              <span>📋</span> <span class="nav-text">Kanban Board</span>
              <span class="badge-todo">${() => activeCount()}</span>
            </a>
            <a href="#/wiki" class="${() => getNavLinkClass('/wiki')}">
              <span>📖</span> <span class="nav-text">Wiki Docs</span>
            </a>
          </nav>

          <div class="nav-section-title" style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.05em; margin: 15px 0 8px 12px;">System & Admin</div>
          <nav class="nav-links">
            <a href="#/activity" class="${() => getNavLinkClass('/activity')}">
              <span>🕒</span> <span class="nav-text">Activity Log</span>
            </a>
            <a href="#/archive" class="${() => getNavLinkClass('/archive')}">
              <span>📦</span> <span class="nav-text">Archive</span>
            </a>
            <a href="#/settings" class="${() => getNavLinkClass('/settings')}">
              <span>⚙️</span> <span class="nav-text">Settings</span>
            </a>
          </nav>
        </div>

        <div class="sidebar-bottom">
          <div class="user-profile-widget" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; border-bottom:1px solid var(--mui-border); padding-bottom:10px;">
            <div style="font-size:1.4rem; background:var(--mui-border); width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:50%;">
              ${() => store.currentUser ? store.currentUser.avatar : ''}
            </div>
            <div class="user-details" style="flex:1; overflow:hidden;">
              <div style="font-weight:600; font-size:0.85rem; color:var(--mui-fg); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">
                ${() => store.currentUser ? store.currentUser.name : ''}
              </div>
              <div style="font-size:0.75rem; color:#64748b; text-transform:capitalize;">
                ${() => store.currentUser ? store.currentUser.role : ''}
              </div>
            </div>
            <button onclick="${actions.logout}" style="background:transparent; border:none; color:#ef4444; font-size:1.15rem; cursor:pointer;" title="Logout">
              🚪
            </button>
          </div>

          <button class="theme-btn" onclick="${actions.toggleTheme}">
            ${() => store.theme === 'light' ? '🌙' : '☀️'}
            <span class="theme-text">${() => store.theme === 'light' ? ' Dark Mode' : ' Light Mode'}</span>
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

      <!-- FLOATING DEVTOOLS TELEMETRY CONSOLE -->
      <dev-panel></dev-panel>
    ` : meldHtml`
      <user-login></user-login>
    `}
  `;
});
