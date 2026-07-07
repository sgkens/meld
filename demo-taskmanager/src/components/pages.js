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
      ${() => store.showAICopilot ? meldHtml`
        <div style="grid-column: 1 / -1; margin-top: var(--mui-space-2)">
          <ai-copilot></ai-copilot>
        </div>
      ` : ''}
    </div>
  `;
});


defineMeld('page-board', () => {
  const ui = meldState({ showModal: false, editingTask: null });

  // Filter tasks based on global store category, milestone, tag filters, & search query
  const filteredTasks = computed(() => {
    let list = store.tasks.filter(t => !t.archived); // Exclude archived tasks on the board
    if (store.filter !== 'all') {
      list = list.filter(t => t.category === store.filter);
    }
    if (store.filterMilestone !== 'all') {
      list = list.filter(t => t.milestone === store.filterMilestone);
    }
    if (store.filterTag !== 'all') {
      list = list.filter(t => t.tags && t.tags.includes(store.filterTag));
    }
    if (store.searchQuery) {
      const q = store.searchQuery.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }

    // Sort tasks!
    const listCopy = [...list];
    if (store.sortBy === 'priority') {
      const pMap = { high: 3, medium: 2, low: 1 };
      listCopy.sort((a, b) => (pMap[b.priority] || 0) - (pMap[a.priority] || 0));
    } else if (store.sortBy === 'dueDate') {
      listCopy.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    } else {
      // Sort by created
      listCopy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return listCopy;
  });

  const todoTasks = computed(() => filteredTasks().filter(t => t.status === 'todo'));
  const doingTasks = computed(() => filteredTasks().filter(t => t.status === 'doing'));
  const doneTasks = computed(() => filteredTasks().filter(t => t.status === 'done'));

  const categoriesList = computed(() => ['all', ...store.categories]);

  // Compute all unique tags from active tasks dynamically
  const allTags = computed(() => {
    const tags = new Set();
    store.tasks.forEach(t => {
      if (!t.archived && Array.isArray(t.tags)) {
        t.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  });

  // Drag & Drop Handlers on Columns
  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain');
    const taskId = parseInt(taskIdStr, 10);
    if (!isNaN(taskId)) {
      actions.updateTaskStatus(taskId, status);
    }
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    if (store.enableDragAndDrop) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  return meldHtml`
    <style>
      .board-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: var(--mui-space-4);
        margin-bottom: var(--mui-space-6);
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
        transition: background-color 0.2s, border-color 0.2s;
      }
      .board-column.drag-over {
        background: color-mix(in srgb, var(--mui-primary) 6%, var(--mui-surface));
        border-color: var(--mui-primary);
        border-style: dashed;
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

      .filter-indicators {
        display: flex;
        gap: var(--mui-space-2);
        margin-bottom: var(--mui-space-4);
        font-size: 0.75rem;
        color: #64748b;
        align-items: center;
      }
      .active-filter-badge {
        background: var(--mui-border);
        color: var(--mui-fg);
        padding: 1px 6px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-weight: 600;
      }
      .clear-filter-btn {
        border: none;
        background: transparent;
        color: #ef4444;
        cursor: pointer;
        padding: 0;
        font-size: 0.7rem;
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
          ${() => categoriesList().map(cat => meldHtml`
            <option value="${cat}" ?selected="${() => store.filter === cat}">${cat === 'all' ? 'All Categories' : cat}</option>
          `)}
        </select>

        <select 
          class="select-filter"
          onchange="${(e) => { actions.setFilterMilestone(e.target.value); }}"
        >
          <option value="all" ?selected="${() => store.filterMilestone === 'all'}">All Milestones</option>
          ${() => store.milestones.map(m => meldHtml`
            <option value="${m}" ?selected="${() => store.filterMilestone === m}">${m}</option>
          `)}
        </select>

        <select 
          class="select-filter"
          onchange="${(e) => { actions.setFilterTag(e.target.value); }}"
        >
          <option value="all" ?selected="${() => store.filterTag === 'all'}">All Tags</option>
          ${() => allTags().map(tag => meldHtml`
            <option value="${tag}" ?selected="${() => store.filterTag === tag}">#${tag}</option>
          `)}
        </select>

        <select 
          class="select-filter"
          onchange="${(e) => { actions.setSortBy(e.target.value); }}"
        >
          <option value="created" ?selected="${() => store.sortBy === 'created'}">Sort: Newest</option>
          <option value="priority" ?selected="${() => store.sortBy === 'priority'}">Sort: Priority</option>
          <option value="dueDate" ?selected="${() => store.sortBy === 'dueDate'}">Sort: Due Date</option>
        </select>
        
        <button class="btn btn-primary" onclick="${() => { ui.editingTask = null; ui.showModal = true; }}">+ Add Task</button>
      </div>
    </div>

    ${() => (store.filterMilestone !== 'all' || store.filterTag !== 'all') ? meldHtml`
      <div class="filter-indicators">
        <span>Active Filters:</span>
        ${() => store.filterMilestone !== 'all' ? meldHtml`
          <span class="active-filter-badge">
            🏁 Milestone: ${store.filterMilestone}
            <button class="clear-filter-btn" onclick="${() => actions.setFilterMilestone('all')}">✕</button>
          </span>
        ` : ''}
        ${() => store.filterTag !== 'all' ? meldHtml`
          <span class="active-filter-badge">
            # Tag: ${store.filterTag}
            <button class="clear-filter-btn" onclick="${() => actions.setFilterTag('all')}">✕</button>
          </span>
        ` : ''}
      </div>
    ` : ''}

    <div class="board-grid">
      <!-- COLUMN: TO DO -->
      <div class="board-column" 
           ondragover="${e => store.enableDragAndDrop && e.preventDefault()}"
           ondragenter="${handleDragEnter}"
           ondragleave="${handleDragLeave}"
           ondrop="${e => handleDrop(e, 'todo')}">
        <h3 class="column-title">
          <span>📋 To Do</span>
          <span class="column-badge">${() => todoTasks().length}</span>
        </h3>
        <div class="column-cards">
          ${meld.list(
            todoTasks,
            (t) => t.id,
            (t) => meldHtml`<task-card .task="${t}" onedit-task="${(e) => { ui.editingTask = e.detail; ui.showModal = true; }}"></task-card>`,
            (node, item) => { node.task = item; }
          )}
          ${() => todoTasks().length === 0 ? meldHtml`<div class="empty-state">No tasks to do</div>` : ''}
        </div>
      </div>

      <!-- COLUMN: IN PROGRESS -->
      <div class="board-column"
           ondragover="${e => store.enableDragAndDrop && e.preventDefault()}"
           ondragenter="${handleDragEnter}"
           ondragleave="${handleDragLeave}"
           ondrop="${e => handleDrop(e, 'doing')}">
        <h3 class="column-title">
          <span>⚡ In Progress</span>
          <span class="column-badge">${() => doingTasks().length}</span>
        </h3>
        <div class="column-cards">
          ${meld.list(
            doingTasks,
            (t) => t.id,
            (t) => meldHtml`<task-card .task="${t}" onedit-task="${(e) => { ui.editingTask = e.detail; ui.showModal = true; }}"></task-card>`,
            (node, item) => { node.task = item; }
          )}
          ${() => doingTasks().length === 0 ? meldHtml`<div class="empty-state">No tasks in progress</div>` : ''}
        </div>
      </div>

      <!-- COLUMN: DONE -->
      <div class="board-column"
           ondragover="${e => store.enableDragAndDrop && e.preventDefault()}"
           ondragenter="${handleDragEnter}"
           ondragleave="${handleDragLeave}"
           ondrop="${e => handleDrop(e, 'done')}">
        <h3 class="column-title">
          <span>✅ Completed</span>
          <span class="column-badge">${() => doneTasks().length}</span>
        </h3>
        <div class="column-cards">
          ${meld.list(
            doneTasks,
            (t) => t.id,
            (t) => meldHtml`<task-card .task="${t}" onedit-task="${(e) => { ui.editingTask = e.detail; ui.showModal = true; }}"></task-card>`,
            (node, item) => { node.task = item; }
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
defineMeld('page-settings', (el, { download }) => {
  const sampleTasks = [
    {
      id: 101,
      title: 'Scaffold another micro-frontend',
      description: 'Use the Meld Artisan CLI to spin up a sub-widget.',
      status: 'todo',
      category: 'Development',
      priority: 'low',
      archived: false,
      milestone: 'Sprint 2',
      tags: ['cli', 'scaffolding'],
      createdAt: new Date().toISOString()
    },
    {
      id: 102,
      title: 'Learn Adopted Stylesheets',
      description: 'Read the spec on CSSStyleSheet and adoptedStyleSheets.',
      status: 'doing',
      category: 'Learning',
      priority: 'high',
      archived: false,
      milestone: 'Sprint 1',
      tags: ['css', 'web-standards'],
      createdAt: new Date().toISOString()
    }
  ];

  const resetSample = () => {
    store.tasks = sampleTasks;
    actions.addActivity('Reset to sample tasks');
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          actions.importTasks(data);
          e.target.value = ''; // Reset input
        } catch (err) {
          alert('Failed to parse JSON file: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerImport = () => {
    const input = el.shadowRoot.getElementById('import-tasks-file');
    if (input) input.click();
  };

  const exportData = () => {
    if (download) {
      download(JSON.stringify(store.tasks, null, 2), 'meld-taskflow-export.json', 'application/json');
      actions.addActivity('Exported task data to JSON');
    } else {
      alert('Download helper is not active.');
    }
  };

  const submitMilestone = (e) => {
    e.preventDefault();
    const input = el.shadowRoot.getElementById('new-milestone-input');
    if (input && input.value.trim()) {
      actions.addMilestone(input.value.trim());
      input.value = '';
    }
  };

  const submitCategory = (e) => {
    e.preventDefault();
    const input = el.shadowRoot.getElementById('new-category-input');
    if (input && input.value.trim()) {
      actions.addCategory(input.value.trim());
      input.value = '';
    }
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
      .btn-primary {
        background: var(--mui-primary);
        color: var(--mui-primary-fg);
      }
      .btn-primary:hover {
        background: var(--mui-primary-hover);
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

      .milestone-input-group {
        display: flex;
        gap: var(--mui-space-2);
        margin-bottom: var(--mui-space-4);
      }
      .milestone-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-md);
        background: var(--mui-bg);
        color: var(--mui-fg);
        font-size: 0.85rem;
      }
      .milestone-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .milestone-item {
        background: var(--mui-surface);
        border: 1px solid var(--mui-border);
        padding: 4px 10px;
        border-radius: var(--mui-radius-md);
        font-size: 0.8rem;
        color: var(--mui-fg);
        font-weight: 500;
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

        <div class="setting-row" style="margin-top:var(--mui-space-2)">
          <div>
            <span class="setting-label">AI Task Assistant</span>
            <div class="setting-sublabel">Enables streaming AI task suggestions with markdown parsing</div>
          </div>
          <label class="switch">
            <input type="checkbox" ?checked="${() => store.showAICopilot}" onchange="${actions.toggleAICopilot}" />
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-row" style="margin-top:var(--mui-space-2)">
          <div>
            <span class="setting-label">Kanban Drag & Drop</span>
            <div class="setting-sublabel">Enables dragging task cards between columns on the Board</div>
          </div>
          <label class="switch">
            <input type="checkbox" ?checked="${() => store.enableDragAndDrop}" onchange="${actions.toggleDragAndDrop}" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- CARD: MILESTONES -->
      <div class="card">
        <h3 class="card-title">Milestones</h3>
        <p class="card-desc">Define sprints, releases, and milestones for task categorization.</p>
        
        <form class="milestone-input-group" onsubmit="${submitMilestone}">
          <input 
            type="text" 
            id="new-milestone-input" 
            class="milestone-input" 
            placeholder="e.g. Sprint 4 or Release 1.2" 
          />
          <button type="submit" class="btn btn-primary">Add Milestone</button>
        </form>

        <div class="milestone-list">
          ${() => store.milestones.map(m => meldHtml`
            <span class="milestone-item">🏁 ${m}</span>
          `)}
        </div>
      </div>

      <!-- CARD: CATEGORIES -->
      <div class="card">
        <h3 class="card-title">Categories</h3>
        <p class="card-desc">Define custom categories to classify tasks on the Kanban Board.</p>
        
        <form class="milestone-input-group" onsubmit="${submitCategory}">
          <input 
            type="text" 
            id="new-category-input" 
            class="milestone-input" 
            placeholder="e.g. Design or Documentation" 
          />
          <button type="submit" class="btn btn-primary">Add Category</button>
        </form>

        <div class="milestone-list">
          ${() => store.categories.map(c => meldHtml`
            <span class="milestone-item">🏷️ ${c}</span>
          `)}
        </div>
      </div>

      <!-- CARD: SYSTEM CONTROLS -->
      <div class="card">
        <h3 class="card-title">System & Data Controls</h3>
        <p class="card-desc">Manage task data states, export tasks, or import backups.</p>
        
        <div style="display:flex; flex-direction:column; gap:var(--mui-space-3)">
          <div style="display:flex; gap:var(--mui-space-2)">
            <button class="btn btn-outline" onclick="${resetSample}">Load Sample Tasks</button>
            <button class="btn btn-danger" onclick="${actions.clearAllTasks}">Delete All Tasks</button>
          </div>

          <div style="display:flex; gap:var(--mui-space-2); border-top:1px solid var(--mui-border); padding-top:var(--mui-space-3)">
            <button class="btn btn-outline" onclick="${exportData}">📥 Export Tasks JSON</button>
            <button class="btn btn-outline" onclick="${triggerImport}">📤 Import Tasks JSON</button>
            
            <input 
              type="file" 
              id="import-tasks-file" 
              accept=".json" 
              style="display:none;" 
              onchange="${handleImportFile}" 
            />
          </div>
        </div>
      </div>
    </div>
  `;
});

defineMeld('ai-copilot', (el, { useAI, signal }) => {
  const ai = useAI('/api/prompt');
  const promptInput = signal('Suggest database design and API tasks');
  const isFinished = signal(false);

  const generate = async () => {
    isFinished.value = false;
    await ai.prompt(promptInput.value);
    isFinished.value = true;
  };

  const parseAndAddTasks = () => {
    const text = ai.completion;
    const lines = text.split('\n');
    let addedCount = 0;
    
    lines.forEach(line => {
      // Format match: - **Configure Database connection** (Priority: high) - Description
      const match = line.match(/^-\s+\*\*(.*?)\*\*\s+\((Priority:\s+\w+)\)\s+-\s+(.*)$/i);
      if (match) {
        const [, title, priorityStr, description] = match;
        const priority = priorityStr.split(': ')[1].toLowerCase();
        actions.addTask({
          title: title.trim(),
          description: description.trim(),
          category: 'AI Suggestion',
          priority
        });
        addedCount++;
      } else {
        const simpleMatch = line.match(/^-\s+\*\*(.*?)\*\*(.*)$/);
        if (simpleMatch) {
          const [, title, desc] = simpleMatch;
          actions.addTask({
            title: title.trim(),
            description: desc.replace(/^\s*-\s*/, '').replace(/^\s*:\s*/, '').trim() || 'AI suggested task',
            category: 'AI Suggestion',
            priority: 'medium'
          });
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      actions.addActivity(`AI Copilot added ${addedCount} tasks to the board`);
      // Reset completion to clear the list
      ai.completion = '';
      isFinished.value = false;
    } else {
      alert("No valid tasks found to add. Ensure the format matches '- **Task Title** - Description'");
    }
  };

  return meldHtml`
    <style>
      .copilot-container {
        background: linear-gradient(135deg, var(--mui-bg) 0%, var(--mui-surface) 100%);
        border: 2px solid var(--mui-primary);
        border-radius: var(--mui-radius-lg);
        padding: var(--mui-space-6);
        box-shadow: var(--mui-shadow-md);
        display: flex;
        flex-direction: column;
        gap: var(--mui-space-4);
        position: relative;
        overflow: hidden;
      }
      .copilot-container::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%);
        pointer-events: none;
      }
      .copilot-header {
        display: flex;
        align-items: center;
        gap: var(--mui-space-3);
      }
      .copilot-icon {
        width: 32px;
        height: 32px;
        background: var(--mui-primary);
        color: #fff;
        border-radius: var(--mui-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.1rem;
        box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
      }
      .copilot-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--mui-fg);
        margin: 0;
      }
      .copilot-desc {
        font-size: 0.85rem;
        color: #64748b;
        margin: 0;
      }
      .copilot-input-group {
        display: flex;
        gap: var(--mui-space-2);
        margin-top: var(--mui-space-2);
      }
      .copilot-input {
        flex: 1;
        background: var(--mui-bg);
        border: 1px solid var(--mui-border);
        padding: 8px 12px;
        border-radius: var(--mui-radius-md);
        color: var(--mui-fg);
        font-size: 0.9rem;
      }
      .copilot-input:focus {
        border-color: var(--mui-primary);
        outline: none;
      }
      .copilot-results {
        background: var(--mui-bg);
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-md);
        padding: var(--mui-space-4);
        min-height: 100px;
        max-height: 250px;
        overflow-y: auto;
        font-size: 0.9rem;
        position: relative;
      }
      .copilot-results ul {
        margin: 0;
        padding-left: var(--mui-space-4);
      }
      .copilot-results li {
        margin-bottom: var(--mui-space-2);
      }
      .loader-dots {
        display: inline-flex;
        gap: 4px;
        align-items: center;
      }
      .loader-dots span {
        width: 6px;
        height: 6px;
        background-color: var(--mui-primary);
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out both;
      }
      .loader-dots span:nth-child(1) { animation-delay: -0.32s; }
      .loader-dots span:nth-child(2) { animation-delay: -0.16s; }
      
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1.0); }
      }
      
      .actions-container {
        display: flex;
        justify-content: flex-end;
        gap: var(--mui-space-2);
      }
    </style>

    <div class="copilot-container">
      <div class="copilot-header">
        <div class="copilot-icon">✨</div>
        <div>
          <h3 class="copilot-title">AI Copilot Assistant</h3>
          <p class="copilot-desc">Generate task lists dynamically and add them to your Kanban board.</p>
        </div>
      </div>

      <div class="copilot-input-group">
        <input 
          type="text" 
          class="copilot-input" 
          .value="${() => promptInput.value}" 
          oninput="${e => promptInput.value = e.target.value}"
          placeholder="What tasks do you want to generate?" 
          ?disabled="${() => ai.isLoading}"
        />
        <button 
          class="btn btn-primary" 
          onclick="${generate}"
          ?disabled="${() => ai.isLoading || !promptInput.value}"
        >
          ${() => ai.isLoading ? 'Thinking...' : 'Generate'}
        </button>
      </div>

      <div class="copilot-results">
        ${() => {
          if (ai.isLoading && !ai.completion) {
            return meldHtml`
              <div style="display:flex; justify-content:center; align-items:center; height:60px; color:#64748b;">
                <div class="loader-dots"><span></span><span></span><span></span></div>
                <span style="margin-left: 8px">Consulting AI model...</span>
              </div>
            `;
          }
          if (ai.error) {
            return meldHtml`<span style="color:#ef4444">${ai.error}</span>`;
          }
          if (!ai.completion) {
            return meldHtml`<span style="color:#64748b; font-style:italic;">Results will stream here...</span>`;
          }
          return meldHtml`<meld-markdown content="${() => ai.completion}"></meld-markdown>`;
        }}
      </div>

      ${() => {
        if (isFinished.value && ai.completion) {
          return meldHtml`
            <div class="actions-container">
              <button class="btn btn-outline" onclick="${() => { ai.completion = ''; isFinished.value = false; }}">Clear</button>
              <button class="btn btn-primary" onclick="${parseAndAddTasks}">Add suggestions to Kanban Board</button>
            </div>
          `;
        }
        return '';
      }}
    </div>
  `;
});

defineMeld('page-archive', () => {
  const archivedTasks = computed(() => store.tasks.filter(t => t.archived));

  return meldHtml`
    <style>
      .archive-header {
        margin-bottom: var(--mui-space-8);
      }
      .archive-title {
        font-size: 1.8rem;
        margin: 0 0 var(--mui-space-2) 0;
        color: var(--mui-fg);
        font-weight: 700;
      }
      .archive-desc {
        font-size: 0.9rem;
        color: #64748b;
        margin: 0;
      }
      .archive-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--mui-space-4);
      }
      .archive-empty {
        background: var(--mui-surface);
        border: 2px dashed var(--mui-border);
        border-radius: var(--mui-radius-lg);
        padding: var(--mui-space-12);
        text-align: center;
        color: #64748b;
      }
      .archive-empty-icon {
        font-size: 3rem;
        margin-bottom: var(--mui-space-4);
      }
      .archive-empty-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--mui-fg);
        margin: 0 0 var(--mui-space-2) 0;
      }
      .archive-empty-desc {
        font-size: 0.85rem;
        margin: 0;
      }
    </style>

    <div class="archive-header">
      <h2 class="archive-title">Task Archive</h2>
      <p class="archive-desc">View and manage tasks that have been archived. You can restore them to the board or delete them permanently.</p>
    </div>

    ${() => archivedTasks().length === 0 ? meldHtml`
      <div class="archive-empty">
        <div class="archive-empty-icon">📦</div>
        <h3 class="archive-empty-title">Archive is empty</h3>
        <p class="archive-empty-desc">No tasks have been archived yet.</p>
      </div>
    ` : meldHtml`
      <div class="archive-grid">
        ${meld.list(
          archivedTasks,
          (t) => t.id,
          (t) => meldHtml`<task-card .task="${t}"></task-card>`,
          (node, item) => { node.task = item; }
        )}
      </div>
    `}
  `;
});
