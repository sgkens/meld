import { defineMeld, meldHtml, meldState, computed, meld } from '../../../src/meld.core.js';
import { store, actions } from '../store.js';
import './task-card.js';
import './ui-modal.js';
import './task-form.js';

// --- PAGE: DASHBOARD ---
defineMeld('page-dashboard', () => {
  const totalTasks = computed(() => store.tasks.length);
  const todoCount = computed(() => store.tasks.filter(t => t.status === 'todo').length);
  const doingCount = computed(() => store.tasks.filter(t => t.status === 'doing').length);
  const doneCount = computed(() => store.tasks.filter(t => t.status === 'done').length);

  const completionRate = computed(() => {
    const total = totalTasks();
    if (total === 0) return 0;
    return Math.round((doneCount() / total) * 100);
  });

  const highPriorityCount = computed(() => store.tasks.filter(t => t.priority === 'high').length);
  const recentActivities = computed(() => store.activities.slice(0, 5));

  return meldHtml`
    <style>
      .dashboard-title {
        font-size: 1.8rem;
        margin-bottom: var(--mui-space-4);
        color: var(--mui-fg);
        font-weight: 700;
      }
      .grid-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--mui-space-4);
        margin-bottom: var(--mui-space-8);
      }
      .stat-card {
        background: var(--mui-bg);
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-lg);
        padding: var(--mui-space-4);
        box-shadow: var(--mui-shadow-sm);
        display: flex;
        flex-direction: column;
      }
      .stat-card .label {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        margin-bottom: 4px;
        font-weight: 600;
      }
      .stat-card .value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--mui-fg);
        line-height: 1.1;
      }
      .stat-card .subtext {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: var(--mui-space-2);
      }

      .dashboard-sections {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: var(--mui-space-8);
      }
      @media (max-width: 768px) {
        .dashboard-sections {
          grid-template-columns: 1fr;
        }
      }

      .panel {
        background: var(--mui-bg);
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-lg);
        padding: var(--mui-space-4);
        box-shadow: var(--mui-shadow-sm);
      }
      .panel-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: var(--mui-space-4);
        color: var(--mui-fg);
        border-bottom: 1px solid var(--mui-border);
        padding-bottom: var(--mui-space-2);
      }

      .progress-bar-container {
        height: 10px;
        background: var(--mui-surface);
        border-radius: 5px;
        overflow: hidden;
        margin-top: var(--mui-space-2);
        border: 1px solid var(--mui-border);
      }
      .progress-bar {
        height: 100%;
        background: var(--mui-primary);
        transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .activity-item {
        padding: var(--mui-space-2) 0;
        border-bottom: 1px dashed var(--mui-border);
        font-size: 0.85rem;
        color: var(--mui-fg);
      }
      .activity-item:last-child {
        border-bottom: none;
      }
      .activity-item .time {
        font-size: 0.72rem;
        color: #64748b;
        display: block;
        margin-top: 2px;
      }

      .quick-link {
        display: inline-block;
        margin-top: var(--mui-space-4);
        padding: 8px 16px;
        background: var(--mui-surface);
        border: 1px solid var(--mui-border);
        color: var(--mui-fg);
        text-decoration: none;
        border-radius: var(--mui-radius-md);
        font-size: 0.85rem;
        font-weight: 600;
        transition: all 0.2s;
      }
      .quick-link:hover {
        background: var(--mui-border);
      }
    </style>

    <h2 class="dashboard-title">Dashboard Overview</h2>

    <div class="grid-stats">
      <div class="stat-card">
        <span class="label">Total Tasks</span>
        <span class="value">${() => totalTasks()}</span>
        <span class="subtext">All active & archived tasks</span>
      </div>
      <div class="stat-card">
        <span class="label">Completion Rate</span>
        <span class="value">${() => completionRate()}%</span>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${() => completionRate()}%"></div>
        </div>
      </div>
      <div class="stat-card">
        <span class="label">Work In Progress</span>
        <span class="value">${() => doingCount()}</span>
        <span class="subtext">Tasks currently being worked on</span>
      </div>
      <div class="stat-card">
        <span class="label">High Priority</span>
        <span class="value" style="color: #ef4444">${() => highPriorityCount()}</span>
        <span class="subtext">Urgent items needing attention</span>
      </div>
    </div>

    <div class="dashboard-sections">
      <div class="panel">
        <h3 class="panel-title">Tasks Distribution</h3>
        <div style="display:flex; flex-direction:column; gap: var(--mui-space-4);">
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom: 4px;">
              <span>To Do</span>
              <strong>${() => todoCount()}</strong>
            </div>
            <div class="progress-bar-container"><div class="progress-bar" style="width: ${() => (todoCount() / (totalTasks() || 1)) * 100}%; background-color:#6b7280;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom: 4px;">
              <span>In Progress</span>
              <strong>${() => doingCount()}</strong>
            </div>
            <div class="progress-bar-container"><div class="progress-bar" style="width: ${() => (doingCount() / (totalTasks() || 1)) * 100}%; background-color:#3b82f6;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom: 4px;">
              <span>Done</span>
              <strong>${() => doneCount()}</strong>
            </div>
            <div class="progress-bar-container"><div class="progress-bar" style="width: ${() => (doneCount() / (totalTasks() || 1)) * 100}%; background-color:#10b981;"></div></div>
          </div>
        </div>
        <a href="#/board" class="quick-link">Go to Board →</a>
      </div>

      <div class="panel">
        <h3 class="panel-title">Recent Activity</h3>
        <div class="activity-list">
          ${() => recentActivities().map(act => meldHtml`
            <div class="activity-item">
              <span>${act.text}</span>
              <span class="time">
                <meld-time date="${act.time}" format="relative"></meld-time>
              </span>
            </div>
          `)}
          ${() => recentActivities().length === 0 ? "No activities recorded." : ""}
        </div>
      </div>
    </div>
  `;
});


// --- PAGE: KANBAN BOARD ---
defineMeld('page-board', () => {
  const ui = meldState({ showModal: false, editingTask: null });

  // Filter tasks based on global store filter & search query
  const filteredTasks = computed(() => {
    let list = store.tasks;
    if (store.filter !== 'all') {
      list = list.filter(t => t.category === store.filter);
    }
    if (store.searchQuery) {
      const q = store.searchQuery.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return list;
  });

  const todoTasks = computed(() => filteredTasks().filter(t => t.status === 'todo'));
  const doingTasks = computed(() => filteredTasks().filter(t => t.status === 'doing'));
  const doneTasks = computed(() => filteredTasks().filter(t => t.status === 'done'));

  const categories = ['all', 'General', 'Learning', 'Development', 'DX'];

  return meldHtml`
    <style>
      .board-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: var(--mui-space-4);
        margin-bottom: var(--mui-space-8);
      }
      .board-title {
        font-size: 1.8rem;
        margin: 0;
        color: var(--mui-fg);
        font-weight: 700;
      }
      .controls {
        display: flex;
        gap: var(--mui-space-2);
        align-items: center;
        flex-wrap: wrap;
      }
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: var(--mui-radius-md);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.85rem;
      }
      .btn-primary {
        background: var(--mui-primary);
        color: var(--mui-primary-fg);
      }
      .btn-primary:hover {
        background: var(--mui-primary-hover);
      }
      .select-filter {
        padding: 8px 12px;
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-md);
        background: var(--mui-bg);
        color: var(--mui-fg);
        font-size: 0.85rem;
        font-family: var(--mui-font);
      }
      .input-search {
        padding: 8px 12px;
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-md);
        background: var(--mui-bg);
        color: var(--mui-fg);
        font-size: 0.85rem;
        font-family: var(--mui-font);
        width: 180px;
      }

      .board-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--mui-space-4);
        align-items: start;
      }
      @media (max-width: 900px) {
        .board-grid {
          grid-template-columns: 1fr;
        }
      }

      .board-column {
        background: var(--mui-surface);
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-lg);
        padding: var(--mui-space-4);
        display: flex;
        flex-direction: column;
        min-height: 500px;
      }
      .column-title {
        font-size: 0.95rem;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: var(--mui-space-4);
        color: var(--mui-fg);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .column-badge {
        background: var(--mui-border);
        color: var(--mui-fg);
        font-size: 0.75rem;
        padding: 2px 6px;
        border-radius: 9999px;
        font-weight: 600;
      }
      .column-cards {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .empty-state {
        color: #64748b;
        font-size: 0.8rem;
        text-align: center;
        padding: var(--mui-space-8) 0;
        border: 2px dashed var(--mui-border);
        border-radius: var(--mui-radius-md);
        margin-bottom: var(--mui-space-2);
      }
    </style>

    <div class="board-header">
      <h2 class="board-title">Kanban Board</h2>
      
      <div class="controls">
        <input 
          class="input-search"
          type="text"
          placeholder="Search tasks..."
          value="${() => store.searchQuery}"
          oninput="${(e) => { store.searchQuery = e.target.value; }}"
        />
        
        <select 
          class="select-filter"
          onchange="${(e) => { store.filter = e.target.value; }}"
        >
          ${() => categories.map(cat => meldHtml`
            <option value="${cat}" ?selected="${() => store.filter === cat}">${cat === 'all' ? 'All Categories' : cat}</option>
          `)}
        </select>
        
        <button class="btn btn-primary" onclick="${() => { ui.editingTask = null; ui.showModal = true; }}">+ Add Task</button>
      </div>
    </div>

    <div class="board-grid">
      <!-- COLUMN: TO DO -->
      <div class="board-column">
        <h3 class="column-title">
          <span>📋 To Do</span>
          <span class="column-badge">${() => todoTasks().length}</span>
        </h3>
        <div class="column-cards">
          ${meld.list(
            todoTasks,
            (t) => t.id,
            (t) => meldHtml`<task-card .task="${t}" onedit-task="${(e) => { ui.editingTask = e.detail; ui.showModal = true; }}"></task-card>`
          )}
          ${() => todoTasks().length === 0 ? meldHtml`<div class="empty-state">No tasks to do</div>` : ''}
        </div>
      </div>

      <!-- COLUMN: IN PROGRESS -->
      <div class="board-column">
        <h3 class="column-title">
          <span>⚡ In Progress</span>
          <span class="column-badge">${() => doingTasks().length}</span>
        </h3>
        <div class="column-cards">
          ${meld.list(
            doingTasks,
            (t) => t.id,
            (t) => meldHtml`<task-card .task="${t}" onedit-task="${(e) => { ui.editingTask = e.detail; ui.showModal = true; }}"></task-card>`
          )}
          ${() => doingTasks().length === 0 ? meldHtml`<div class="empty-state">No tasks in progress</div>` : ''}
        </div>
      </div>

      <!-- COLUMN: DONE -->
      <div class="board-column">
        <h3 class="column-title">
          <span>✅ Completed</span>
          <span class="column-badge">${() => doneTasks().length}</span>
        </h3>
        <div class="column-cards">
          ${meld.list(
            doneTasks,
            (t) => t.id,
            (t) => meldHtml`<task-card .task="${t}" onedit-task="${(e) => { ui.editingTask = e.detail; ui.showModal = true; }}"></task-card>`
          )}
          ${() => doneTasks().length === 0 ? meldHtml`<div class="empty-state">No completed tasks</div>` : ''}
        </div>
      </div>
    </div>

    <!-- CREATE MODAL USING PORTAL -->
    ${() => ui.showModal
      ? meldHtml`
          <ui-modal onclose="${() => { ui.showModal = false; }}">
            <span slot="title">${() => ui.editingTask ? 'Edit Task' : 'Create New Task'}</span>
            <task-form .task="${ui.editingTask}" onsuccess="${() => { ui.showModal = false; }}"></task-form>
          </ui-modal>
        `
      : ''
    }
  `;
});


// --- PAGE: ACTIVITY LOG ---
defineMeld('page-activity', () => {
  return meldHtml`
    <style>
      .activity-title {
        font-size: 1.8rem;
        margin-bottom: var(--mui-space-4);
        color: var(--mui-fg);
        font-weight: 700;
      }
      .panel {
        background: var(--mui-bg);
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-lg);
        padding: var(--mui-space-6);
        box-shadow: var(--mui-shadow-sm);
        max-width: 800px;
      }
      .log-list {
        display: flex;
        flex-direction: column;
      }
      .log-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--mui-space-3) 0;
        border-bottom: 1px solid var(--mui-border);
        font-size: 0.9rem;
        color: var(--mui-fg);
      }
      .log-row:last-child {
        border-bottom: none;
      }
      .log-text {
        font-weight: 500;
      }
      .log-time {
        font-size: 0.78rem;
        color: #64748b;
        font-family: monospace;
      }
      .empty-logs {
        color: #64748b;
        padding: var(--mui-space-8) 0;
        text-align: center;
      }
    </style>

    <h2 class="activity-title">Application Audit Trail</h2>
    
    <div class="panel">
      <div class="log-list">
        ${meld.list(
          () => store.activities,
          (log) => log.id,
          (log) => meldHtml`
            <div class="log-row">
              <span class="log-text">${log.text}</span>
              <span class="log-time">
                <meld-time date="${log.time}" format="relative"></meld-time>
              </span>
            </div>
          `
        )}
        ${() => store.activities.length === 0 ? meldHtml`<div class="empty-logs">No activity log found.</div>` : ''}
      </div>
    </div>
  `;
});


// --- PAGE: SETTINGS ---
defineMeld('page-settings', () => {
  const sampleTasks = [
    {
      id: 101,
      title: 'Scaffold another micro-frontend',
      description: 'Use the Meld Artisan CLI to spin up a sub-widget.',
      status: 'todo',
      category: 'Development',
      priority: 'low',
      createdAt: new Date().toISOString()
    },
    {
      id: 102,
      title: 'Learn Adopted Stylesheets',
      description: 'Read the spec on CSSStyleSheet and adoptedStyleSheets.',
      status: 'doing',
      category: 'Learning',
      priority: 'high',
      createdAt: new Date().toISOString()
    }
  ];

  const resetSample = () => {
    store.tasks = sampleTasks;
    actions.addActivity('Reset to sample tasks');
  };

  return meldHtml`
    <style>
      .settings-title {
        font-size: 1.8rem;
        margin-bottom: var(--mui-space-4);
        color: var(--mui-fg);
        font-weight: 700;
      }
      .settings-container {
        max-width: 600px;
        display: flex;
        flex-direction: column;
        gap: var(--mui-space-4);
      }
      .card {
        background: var(--mui-bg);
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-lg);
        padding: var(--mui-space-4);
        box-shadow: var(--mui-shadow-sm);
      }
      .card-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: var(--mui-space-2);
        color: var(--mui-fg);
      }
      .card-desc {
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: var(--mui-space-4);
      }
      .setting-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--mui-space-2) 0;
      }
      .setting-label {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--mui-fg);
      }
      .setting-sublabel {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: 2px;
      }
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: var(--mui-radius-md);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.85rem;
      }
      .btn-danger {
        background: #ef4444;
        color: white;
      }
      .btn-danger:hover {
        background: #dc2626;
      }
      .btn-outline {
        background: transparent;
        border: 1px solid var(--mui-border);
        color: var(--mui-fg);
      }
      .btn-outline:hover {
        background: var(--mui-surface);
      }

      /* Custom toggle styling */
      .switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
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
        background-color: #cbd5e1;
        transition: .3s;
        border-radius: 24px;
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      input:checked + .slider {
        background-color: var(--mui-primary);
      }
      input:checked + .slider:before {
        transform: translateX(20px);
      }
    </style>

    <h2 class="settings-title">Settings & System</h2>

    <div class="settings-container">
      <!-- CARD: DISPLAY -->
      <div class="card">
        <h3 class="card-title">Preferences</h3>
        <p class="card-desc">Personalize your workspace experience.</p>
        
        <div class="setting-row">
          <div>
            <span class="setting-label">Dark Mode</span>
            <div class="setting-sublabel">Switch between light and dark UI themes</div>
          </div>
          <label class="switch">
            <input type="checkbox" ?checked="${() => store.theme === 'dark'}" onchange="${actions.toggleTheme}" />
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-row" style="margin-top:var(--mui-space-2)">
          <div>
            <span class="setting-label">Developer Highlights Mode</span>
            <div class="setting-sublabel">Flashes updated elements and increments update badges</div>
          </div>
          <label class="switch">
            <input type="checkbox" ?checked="${() => store.devMode}" onchange="${actions.toggleDevMode}" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- CARD: SYSTEM CONTROLS -->
      <div class="card">
        <h3 class="card-title">System & Data Controls</h3>
        <p class="card-desc">Manage task data states and cache values.</p>
        
        <div style="display:flex; gap:var(--mui-space-2)">
          <button class="btn btn-outline" onclick="${resetSample}">Load Sample Tasks</button>
          <button class="btn btn-danger" onclick="${actions.clearAllTasks}">Delete All Tasks</button>
        </div>
      </div>
    </div>
  `;
});
