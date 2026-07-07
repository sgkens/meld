import { defineMeld, meldHtml, meldState, onMount, computed, meld } from '../../../src/meld.core.js';
import { store, actions } from '../store.js';

defineMeld('dev-panel', () => {
  const ui = meldState({
    isOpen: false,
    logs: []
  });

  onMount(() => {
    const handleUpdate = (e) => {
      const { tagName, updateCount, time } = e.detail;
      const logText = `${time} - <${tagName}> updated (#${updateCount})`;
      ui.logs = [logText, ...ui.logs].slice(0, 12);
    };

    window.addEventListener('meld-devtools-update', handleUpdate);
    return () => {
      window.removeEventListener('meld-devtools-update', handleUpdate);
    };
  });

  const clearLogs = () => {
    ui.logs = [];
  };

  const activePlugins = [
    'MeldRouter (v1.4 - Transitions)',
    'MeldStore (Reactive Proxy)',
    'MeldPersist (LocalStorage)',
    'MeldForms (Validated useForm)',
    'MeldTime (Relative <meld-time>)',
    'MeldPortal (Shadow DOM Escapement)',
    'MeldDevtools (Visual Highlighting)',
    'MeldA11y (trapFocus & announce)',
    'MeldLogger (Console Diagnostics)',
    'MeldBroadcast (Tab Synchronization)'
  ];

  return meldHtml`
    <style>
      .devtools-trigger {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #0f172a;
        color: #f8fafc;
        border: 1px solid #334155;
        border-radius: 9999px;
        padding: 10px 16px;
        font-family: monospace;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
      }
      .devtools-trigger:hover {
        background: #1e293b;
        transform: translateY(-2px);
      }

      .devtools-panel {
        position: fixed;
        bottom: 74px;
        right: 20px;
        width: 380px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(8px);
        border: 1px solid #334155;
        border-radius: var(--mui-radius-lg);
        color: #e2e8f0;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
        z-index: 99999;
        font-family: monospace;
        font-size: 0.8rem;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes slideIn {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .panel-header {
        background: #1e293b;
        padding: var(--mui-space-3) var(--mui-space-4);
        border-bottom: 1px solid #334155;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .panel-header h4 {
        margin: 0;
        font-size: 0.85rem;
        color: #f8fafc;
        font-weight: 600;
      }
      .panel-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 1.1rem;
      }

      .panel-content {
        padding: var(--mui-space-4);
        display: flex;
        flex-direction: column;
        gap: var(--mui-space-4);
        max-height: 480px;
        overflow-y: auto;
      }

      .section-title {
        color: #a855f7;
        margin: 0 0 var(--mui-space-2) 0;
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #334155;
        padding-bottom: 2px;
      }

      .telemetry-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
      }
      .telemetry-val {
        color: #38bdf8;
      }

      .plugin-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        color: #94a3b8;
      }

      .log-console {
        background: #020617;
        border: 1px solid #1e293b;
        border-radius: 4px;
        padding: var(--mui-space-2);
        max-height: 140px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 0.72rem;
      }
      .log-line {
        color: #4ade80;
        border-bottom: 1px solid #0f172a;
        padding-bottom: 2px;
      }
      .log-line:last-child {
        border-bottom: none;
      }

      .switch-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #1e293b;
        padding: var(--mui-space-2) var(--mui-space-3);
        border-radius: var(--mui-radius-md);
      }
      
      /* Toggle design */
      .switch {
        position: relative;
        display: inline-block;
        width: 34px;
        height: 20px;
      }
      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider {
        position: absolute;
        cursor: pointer;
        inset: 0;
        background-color: #475569;
        transition: .3s;
        border-radius: 20px;
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
      }
      input:checked + .slider {
        background-color: #a855f7;
      }
      input:checked + .slider:before {
        transform: translateX(14px);
      }
    </style>

    <button class="devtools-trigger" onclick="${() => { ui.isOpen = !ui.isOpen; }}">
      <span>🛠️ Meld DevTools</span>
    </button>

    ${() => ui.isOpen 
      ? meldHtml`
          <div class="devtools-panel">
            <div class="panel-header">
              <h4>MELD.JS TELEMETRY</h4>
              <button class="panel-close" onclick="${() => { ui.isOpen = false; }}">×</button>
            </div>
            <div class="panel-content">
              <!-- TOGGLE DEV MODE -->
              <div class="switch-row">
                <span>Highlight Updates</span>
                <label class="switch">
                  <input type="checkbox" ?checked="${() => store.devMode}" onchange="${actions.toggleDevMode}" />
                  <span class="slider"></span>
                </label>
              </div>

              <!-- SYSTEM SPECS -->
              <div>
                <h5 class="section-title">Engine Telemetry</h5>
                <div class="telemetry-row">
                  <span>Meld Core Version</span>
                  <span class="telemetry-val">v1.4.0-rc1</span>
                </div>
                <div class="telemetry-row">
                  <span>Library Footprint</span>
                  <span class="telemetry-val">~2.1KB (gzip)</span>
                </div>
                <div class="telemetry-row">
                  <span>Reactive Store Props</span>
                  <span class="telemetry-val">${() => Object.keys(store).length}</span>
                </div>
                <div class="telemetry-row">
                  <span>Registered Elements</span>
                  <span class="telemetry-val">${() => document.querySelectorAll('*').length} (DOM)</span>
                </div>
              </div>

              <!-- ACTIVE PLUGINS -->
              <div>
                <h5 class="section-title">Integrated Plugins</h5>
                <div class="plugin-list">
                  ${() => activePlugins.map(p => meldHtml`<div>🔌 ${p}</div>`)}
                </div>
              </div>

              <!-- RE-RENDER LOGS -->
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--mui-space-2)">
                  <h5 class="section-title" style="margin:0; border-bottom:none;">Live Updates Console</h5>
                  <button style="background:transparent; border:none; color:#f43f5e; cursor:pointer; font-size:0.75rem;" onclick="${clearLogs}">Clear</button>
                </div>
                <div class="log-console">
                  ${() => ui.logs.map(log => meldHtml`<div class="log-line">${log}</div>`)}
                  ${() => ui.logs.length === 0 ? meldHtml`<div style="color:#64748b; font-size:0.7rem; text-align:center; padding: 20px 0;">Waiting for reactive triggers...</div>` : ''}
                </div>
              </div>
            </div>
          </div>
        ` 
      : ''
    }
  `;
});
