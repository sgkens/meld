import { defineMeld, meldHtml, meldState, computed, meld, inject } from '../../../src/meld.core.js';
import { store, actions } from '../store.js';
import './task-card.js';
import './ui-modal.js';
import './task-form.js';

// --- PAGE: DASHBOARD ---
defineMeld('page-dashboard', () => {
  const totalTasks = computed(() => store.tasks.length);
  const todoCount = computed(() => store.tasks.filter(t => t.status === 'todo').length);
  const doingCount = computed(() => store.tasks.filter(t => t.status === 'doing').length);
  const reviewCount = computed(() => store.tasks.filter(t => t.status === 'review').length);
  const doneCount = computed(() => store.tasks.filter(t => t.status === 'done').length);

  const completionRate = computed(() => {
    const total = totalTasks();
    if (total === 0) return 0;
    return Math.round((doneCount() / total) * 100);
  });

  const highPriorityCount = computed(() => store.tasks.filter(t => t.priority === 'high').length);
  const mediumPriorityCount = computed(() => store.tasks.filter(t => t.priority === 'medium').length);
  const lowPriorityCount = computed(() => store.tasks.filter(t => t.priority === 'low').length);
  const recentActivities = computed(() => store.activities.slice(0, 5));

  // Compute category breakdown
  const categoryStats = computed(() => {
    const counts = {};
    store.categories.forEach(c => {
      counts[c] = store.tasks.filter(t => t.category === c).length;
    });
    return counts;
  });

  // Compute upcoming tasks due soon (excluding done)
  const upcomingTasks = computed(() => {
    const active = store.tasks.filter(t => !t.archived && t.status !== 'done' && t.dueDate);
    // Sort by due date ascending
    const listCopy = [...active];
    return listCopy.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 3);
  });

  // Compute active wiki documents count
  const wikiCount = computed(() => store.wiki.length);

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
      .stat-card-body {
        padding: var(--mui-space-4);
        display: flex;
        flex-direction: column;
      }
      .stat-card-body .label {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        margin-bottom: 4px;
        font-weight: 600;
      }
      .stat-card-body .value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--mui-fg);
        line-height: 1.1;
      }
      .stat-card-body .subtext {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: var(--mui-space-2);
      }

      .dashboard-sections {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: var(--mui-space-8);
        margin-bottom: var(--mui-space-8);
      }
      @media (max-width: 900px) {
        .dashboard-sections {
          grid-template-columns: 1fr;
        }
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
        color: var(--mui-primary);
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 600;
      }
      .quick-link:hover {
        text-decoration: underline;
      }

      .upcoming-task-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--mui-space-2) 0;
        border-bottom: 1px dashed var(--mui-border);
        font-size: 0.85rem;
      }
      .upcoming-task-item:last-child {
        border-bottom: none;
      }

      /* Support styles for completion gauge and priority chart */
      .completion-gauge-container {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .progress-ring-indicator {
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
        transition: stroke-dashoffset 0.35s ease;
      }
      .completion-gauge-text {
        position: absolute;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--mui-fg);
      }
      .priority-chart {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .priority-bar-row {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.85rem;
      }
      .priority-bar-row .p-label {
        width: 100px;
        font-weight: 500;
        color: var(--mui-fg);
      }
      .priority-bar-row .p-bar-track {
        flex: 1;
        height: 8px;
        background: var(--mui-border);
        border-radius: 4px;
        overflow: hidden;
      }
      .priority-bar-row .p-bar {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s var(--mui-ease);
      }
      .priority-bar-row .fill-high { background: #ef4444; }
      .priority-bar-row .fill-medium { background: #f59e0b; }
      .priority-bar-row .fill-low { background: #3b82f6; }
      .priority-bar-row .p-val {
        width: 20px;
        text-align: right;
        font-weight: 600;
        color: var(--mui-fg);
      }

      /* Telemetry panel styling */
      .telemetry-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        font-family: monospace;
        font-size: 0.8rem;
        color: #10b981;
      }
      .telemetry-box {
        background: #020617;
        border: 1px solid #1e293b;
        padding: 10px;
        border-radius: var(--mui-radius-md);
      }
    </style>

    <h2 class="dashboard-title">Dashboard Overview</h2>

    <div class="grid-stats">
      <!-- STAT CARD 1: TOTAL -->
      <m-card>
        <div class="stat-card-body">
          <span class="label">Total Tasks</span>
          <span class="value">${() => totalTasks()}</span>
          <span class="subtext">All active & archived items</span>
        </div>
      </m-card>

      <!-- STAT CARD 2: RATE -->
      <m-card>
        <div class="stat-card-body" style="flex-direction: row; justify-content: space-between; align-items: center;">
          <div>
            <span class="label">Completion Rate</span>
            <span class="value" style="display:block; margin-bottom:4px;">${() => completionRate()}%</span>
            <span class="subtext">Completed vs total tasks</span>
          </div>
          <div class="completion-gauge-container">
            <svg class="progress-ring" width="60" height="60">
              <circle class="progress-ring-bg" stroke="var(--mui-border)" stroke-width="5" fill="transparent" r="24" cx="30" cy="30"/>
              <circle class="progress-ring-indicator" stroke="var(--mui-primary)" stroke-width="5" fill="transparent" r="24" cx="30" cy="30"
                      stroke-dasharray="150.8"
                      stroke-dashoffset="${() => 150.8 - (150.8 * completionRate()) / 100}"/>
            </svg>
            <div class="completion-gauge-text">${() => completionRate()}%</div>
          </div>
        </div>
      </m-card>

      <!-- STAT CARD 3: WIP -->
      <m-card>
        <div class="stat-card-body">
          <span class="label">Work In Progress</span>
          <span class="value">${() => doingCount()}</span>
          <span class="subtext">Tasks active in columns</span>
        </div>
      </m-card>

      <!-- STAT CARD 4: WIKI -->
      <m-card>
        <div class="stat-card-body">
          <span class="label">Wiki Docs</span>
          <span class="value">${() => wikiCount()}</span>
          <span class="subtext">Linked documentation articles</span>
        </div>
      </m-card>
    </div>

    <div class="dashboard-sections">
      <!-- PANEL: TASK STATUS DISTRIBUTION -->
      <m-card>
        <span slot="header">📊 Tasks Distribution</span>
        <div style="display:flex; flex-direction:column; gap: var(--mui-space-4);">
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom: 4px;">
              <span>📋 To Do</span>
              <strong>${() => todoCount()}</strong>
            </div>
            <div class="progress-bar-container"><div class="progress-bar" style="width: ${() => (todoCount() / (totalTasks() || 1)) * 100}%; background-color:#6b7280;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom: 4px;">
              <span>⚡ In Progress</span>
              <strong>${() => doingCount()}</strong>
            </div>
            <div class="progress-bar-container"><div class="progress-bar" style="width: ${() => (doingCount() / (totalTasks() || 1)) * 100}%; background-color:#3b82f6;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom: 4px;">
              <span>🔍 Under Review</span>
              <strong>${() => reviewCount()}</strong>
            </div>
            <div class="progress-bar-container"><div class="progress-bar" style="width: ${() => (reviewCount() / (totalTasks() || 1)) * 100}%; background-color:#a855f7;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom: 4px;">
              <span>✅ Completed</span>
              <strong>${() => doneCount()}</strong>
            </div>
            <div class="progress-bar-container"><div class="progress-bar" style="width: ${() => (doneCount() / (totalTasks() || 1)) * 100}%; background-color:#10b981;"></div></div>
          </div>
        </div>
        <div slot="footer">
          <a href="#/board" class="quick-link">Go to Board →</a>
        </div>
      </m-card>

      <!-- PANEL: UPCOMING DUES -->
      <m-card>
        <span slot="header">⏰ Upcoming Deadlines</span>
        <div>
          ${meld.list(
            upcomingTasks,
            (task) => task.id,
            (task) => meldHtml`
              <div class="upcoming-task-item">
                <div>
                  <span class="task-title" style="font-weight:600;">${task.title}</span>
                  <div class="task-category" style="font-size:0.75rem; color:#64748b;">Category: ${task.category}</div>
                </div>
                <m-badge variant="${task.dueDate < new Date().toISOString().slice(0, 10) ? 'danger' : 'default'}">
                  <meld-time date="${task.dueDate}" format="short"></meld-time>
                </m-badge>
              </div>
            `,
            (node, task) => {
              const titleNode = node.querySelector('.task-title');
              const catNode = node.querySelector('.task-category');
              const badge = node.querySelector('m-badge');
              const time = node.querySelector('meld-time');
              if (titleNode) titleNode.textContent = task.title;
              if (catNode) catNode.textContent = `Category: ${task.category}`;
              if (badge) {
                const today = new Date().toISOString().slice(0, 10);
                badge.setAttribute('variant', task.dueDate < today ? 'danger' : 'default');
              }
              if (time) time.setAttribute('date', task.dueDate);
            }
          )}
          ${() => upcomingTasks().length === 0 ? meldHtml`<div style="font-size:0.85rem; color:#64748b; font-style:italic;">No upcoming deadlines!</div>` : ''}
        </div>
        <div slot="footer">
          <a href="#/board" class="quick-link">View Board →</a>
        </div>
      </m-card>

      <!-- PANEL: PRIORITY BREAKDOWN -->
      <m-card>
        <span slot="header">🔥 Priority Distribution</span>
        <div class="priority-chart">
          <div class="priority-bar-row">
            <span class="p-label">High Priority</span>
            <div class="p-bar-track">
              <div class="p-bar fill-high" style="width: ${() => (highPriorityCount() / (totalTasks() || 1)) * 100}%"></div>
            </div>
            <span class="p-val">${() => highPriorityCount()}</span>
          </div>
          <div class="priority-bar-row">
            <span class="p-label">Medium Priority</span>
            <div class="p-bar-track">
              <div class="p-bar fill-medium" style="width: ${() => (mediumPriorityCount() / (totalTasks() || 1)) * 100}%"></div>
            </div>
            <span class="p-val">${() => mediumPriorityCount()}</span>
          </div>
          <div class="priority-bar-row">
            <span class="p-label">Low Priority</span>
            <div class="p-bar-track">
              <div class="p-bar fill-low" style="width: ${() => (lowPriorityCount() / (totalTasks() || 1)) * 100}%"></div>
            </div>
            <span class="p-val">${() => lowPriorityCount()}</span>
          </div>
        </div>
      </m-card>

      <!-- PANEL: CATEGORY METRICS -->
      <m-card>
        <span slot="header">🏷️ Categories Breakdown</span>
        <div style="display:flex; flex-direction:column; gap: var(--mui-space-3);">
          ${() => Object.entries(categoryStats()).map(([cat, count]) => meldHtml`
            <div style="display:flex; align-items:center; justify-content:space-between; font-size:0.85rem;">
              <span>${cat}</span>
              <m-badge variant="success">${count} tasks</m-badge>
            </div>
          `)}
        </div>
      </m-card>

      <!-- PANEL: RECENT ACTIVITY -->
      <m-card>
        <span slot="header">🕒 Recent Activities</span>
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
      </m-card>

      <!-- EXPERIMENTAL: TELEMETRY (DEV MODE ONLY) -->
      ${() => store.devMode ? meldHtml`
        <div style="grid-column: 1 / -1;">
          <m-card style="border-color:#10b981;">
            <span slot="header" style="color:#10b981;">🛡️ Framework Telemetry Console (Meld.js Active)</span>
            <div class="telemetry-grid">
              <div class="telemetry-box">
                <div style="font-weight:700; color:#34d399; margin-bottom:4px;">REACTIVE NODES</div>
                <div>Tasks Store Size: ${() => store.tasks.length}</div>
                <div>Wiki Pages Count: ${() => store.wiki.length}</div>
                <div>Sprints milestones: ${() => store.milestones.length}</div>
              </div>
              <div class="telemetry-box">
                <div style="font-weight:700; color:#34d399; margin-bottom:4px;">DX BENCHMARKS</div>
                <div>DOM Flash Highlights: ACTIVE</div>
                <div>Cross-Tab Sync Channel: meld-taskmanager-channel</div>
                <div>Global Dev Mode State: ENABLED</div>
              </div>
            </div>
          </m-card>
        </div>
      ` : ''}

      ${() => store.showAICopilot ? meldHtml`
        <div style="grid-column: 1 / -1;">
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
  const reviewTasks = computed(() => filteredTasks().filter(t => t.status === 'review'));
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
        grid-template-columns: repeat(4, 1fr);
        gap: var(--mui-space-4);
        align-items: start;
      }
      @media (max-width: 1200px) {
        .board-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 768px) {
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

      <!-- COLUMN: UNDER REVIEW -->
      <div class="board-column"
           ondragover="${e => store.enableDragAndDrop && e.preventDefault()}"
           ondragenter="${handleDragEnter}"
           ondragleave="${handleDragLeave}"
           ondrop="${e => handleDrop(e, 'review')}">
        <h3 class="column-title">
          <span>🔍 Under Review</span>
          <span class="column-badge">${() => reviewTasks().length}</span>
        </h3>
        <div class="column-cards">
          ${meld.list(
            reviewTasks,
            (t) => t.id,
            (t) => meldHtml`<task-card .task="${t}" onedit-task="${(e) => { ui.editingTask = e.detail; ui.showModal = true; }}"></task-card>`,
            (node, item) => { node.task = item; }
          )}
          ${() => reviewTasks().length === 0 ? meldHtml`<div class="empty-state">No tasks under review</div>` : ''}
        </div>
      </div>

      <!-- COLUMN: COMPLETED -->
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

defineMeld('page-wiki', (el, { effect }) => {
  // Selected article slug (tracked locally via meldState, or sync with URL query params!)
  const state = meldState({
    selectedSlug: store.wiki[0]?.slug || '',
    drawerOpen: false,
    editSlug: '',
    editTitle: '',
    editContent: '',
    editCategory: '',
    editTags: '',
    editLinkedTasks: [],
    searchQuery: ''
  });

  const filteredWiki = computed(() => {
    if (!state.searchQuery) return store.wiki;
    const q = state.searchQuery.toLowerCase();
    return store.wiki.filter(art => 
      art.title.toLowerCase().includes(q) || 
      (art.content && art.content.toLowerCase().includes(q)) ||
      (art.category && art.category.toLowerCase().includes(q)) ||
      (Array.isArray(art.tags) && art.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  // Keep selected slug in sync with URL query parameter '?slug=...' if present
  effect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const slugParam = params.get('slug');
    if (slugParam && store.wiki.some(w => w.slug === slugParam)) {
      state.selectedSlug = slugParam;
    }
  });

  const selectedArticle = computed(() => {
    return store.wiki.find(w => w.slug === state.selectedSlug) || store.wiki[0];
  });

  const openNew = () => {
    state.editSlug = '';
    state.editTitle = '';
    state.editContent = '';
    state.editCategory = 'Guides';
    state.editTags = '';
    state.editLinkedTasks = [];
    state.drawerOpen = true;
  };

  const openEdit = () => {
    const art = selectedArticle();
    if (art) {
      state.editSlug = art.slug;
      state.editTitle = art.title;
      state.editContent = art.content;
      state.editCategory = art.category;
      state.editTags = Array.isArray(art.tags) ? art.tags.join(', ') : '';
      state.editLinkedTasks = Array.isArray(art.linkedTasks) ? [...art.linkedTasks] : [];
      state.drawerOpen = true;
    }
  };

  const handleSave = () => {
    if (!state.editTitle.trim()) {
      alert('Title is required!');
      return;
    }
    actions.saveWikiArticle({
      slug: state.editSlug,
      title: state.editTitle.trim(),
      content: state.editContent,
      category: state.editCategory.trim(),
      tags: state.editTags,
      linkedTasks: state.editLinkedTasks
    });
    // If it was a new article, select it
    if (!state.editSlug) {
      state.selectedSlug = state.editTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    state.drawerOpen = false;
  };

  const handleDelete = () => {
    const art = selectedArticle();
    if (art && confirm(`Are you sure you want to delete "${art.title}"?`)) {
      actions.deleteWikiArticle(art.slug);
      state.selectedSlug = store.wiki[0]?.slug || '';
    }
  };

  const toggleLinkedTask = (taskId) => {
    const id = Number(taskId);
    if (state.editLinkedTasks.includes(id)) {
      state.editLinkedTasks = state.editLinkedTasks.filter(x => x !== id);
    } else {
      state.editLinkedTasks = [...state.editLinkedTasks, id];
    }
  };

  return meldHtml`
    <style>
      .wiki-container {
        display: grid;
        grid-template-columns: 240px 1fr;
        gap: var(--mui-space-6);
        height: calc(100vh - 120px);
        align-items: stretch;
      }
      @media (max-width: 768px) {
        .wiki-container {
          grid-template-columns: 1fr;
          height: auto;
        }
      }
      
      .wiki-sidebar {
        border-right: 1px solid var(--mui-border);
        padding-right: var(--mui-space-4);
        display: flex;
        flex-direction: column;
        gap: var(--mui-space-4);
        overflow-y: auto;
      }

      .wiki-content {
        padding-left: var(--mui-space-2);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: var(--mui-space-4);
      }

      .article-link {
        display: block;
        padding: 8px 12px;
        border-radius: var(--mui-radius-md);
        text-decoration: none;
        color: var(--mui-fg);
        opacity: 0.8;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
      }
      .article-link:hover {
        background: var(--mui-surface);
        opacity: 1;
      }
      .article-link.active {
        background: color-mix(in srgb, var(--mui-primary) 10%, var(--mui-bg));
        border-color: var(--mui-primary);
        color: var(--mui-primary);
        opacity: 1;
        font-weight: 600;
      }

      .article-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid var(--mui-border);
        padding-bottom: var(--mui-space-4);
        margin-bottom: var(--mui-space-2);
      }

      .article-title {
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 6px 0;
        color: var(--mui-fg);
      }

      .article-meta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--mui-space-2);
        align-items: center;
        margin-bottom: var(--mui-space-4);
      }

      .article-body {
        line-height: 1.6;
        color: var(--mui-fg);
        font-size: 0.95rem;
      }

      .linked-tasks-card {
        margin-top: var(--mui-space-6);
        padding: var(--mui-space-4);
        background: var(--mui-surface);
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-md);
      }
      .linked-tasks-title {
        font-size: 0.9rem;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: var(--mui-space-2);
        color: var(--mui-fg);
      }
      .linked-task-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8rem;
        padding: 6px 0;
        border-bottom: 1px solid var(--mui-border);
      }
      .linked-task-item:last-child {
        border-bottom: none;
      }

      /* Drawer Edit Form styles */
      .form-drawer-content {
        padding: var(--mui-space-6);
        display: flex;
        flex-direction: column;
        gap: var(--mui-space-4);
        height: 100%;
        overflow-y: auto;
      }
      .form-label {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--mui-fg);
      }
      .textarea-field {
        width: 100%;
        min-height: 250px;
        padding: 10px;
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-md);
        background: var(--mui-bg);
        color: var(--mui-fg);
        font-family: var(--mui-font);
        font-size: 0.9rem;
        resize: vertical;
      }
      .textarea-field:focus {
        outline: none;
        border-color: var(--mui-primary);
      }

      .task-checkbox-list {
        max-height: 150px;
        overflow-y: auto;
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-md);
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .task-checkbox-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        cursor: pointer;
      }
    </style>

    <div class="wiki-container">
      <!-- SIDEBAR LIST -->
      <div class="wiki-sidebar">
        <m-button variant="primary" onclick="${openNew}" style="width:100%;">+ New Document</m-button>
        
        <input 
          type="text" 
          class="milestone-input" 
          style="margin-top: 10px; font-size: 0.85rem;"
          placeholder="Search documents..." 
          value="${() => state.searchQuery}" 
          oninput="${(e) => { state.searchQuery = e.target.value; }}"
        />

        <div style="display:flex; flex-direction:column; gap:4px; margin-top:10px;">
          ${meld.list(
            () => filteredWiki(),
            (art) => art.slug,
            (art) => meldHtml`
              <div 
                class="article-link"
                onclick="${() => { state.selectedSlug = art.slug; }}"
              >
                📖 ${art.title}
              </div>
            `,
            (node, art) => {
              if (state.selectedSlug === art.slug) {
                node.classList.add('active');
              } else {
                node.classList.remove('active');
              }
              node.innerHTML = `📖 ${art.title}`;
            }
          )}
          ${() => filteredWiki().length === 0 ? meldHtml`<div style="font-size:0.8rem; color:#64748b; font-style:italic; padding: 10px 0; text-align:center;">No articles found.</div>` : ''}
        </div>
      </div>

      <!-- MAIN CONTENT VIEW -->
      <div class="wiki-content">
        ${() => {
          const art = selectedArticle();
          if (!art) {
            return meldHtml`
              <m-alert variant="info">
                Create your first Wiki page to document your workspace guidelines, release schedules, or guides.
              </m-alert>
            `;
          }

          // Search for tasks linked to this article
          const linkedTasksList = store.tasks.filter(t => art.linkedTasks && art.linkedTasks.includes(t.id));

          return meldHtml`
            <div class="article-header">
              <div>
                <h1 class="article-title">${art.title}</h1>
                <div class="article-meta">
                  <m-badge variant="success">${art.category}</m-badge>
                  ${art.tags.map(t => meldHtml`
                    <m-badge>#${t}</m-badge>
                  `)}
                </div>
              </div>
              <div style="display:flex; gap:8px;">
                <m-button variant="secondary" onclick="${openEdit}">✏️ Edit</m-button>
                <m-button variant="danger" onclick="${handleDelete}">🗑️ Delete</m-button>
              </div>
            </div>

            <div class="article-body">
              <meld-markdown content="${art.content}"></meld-markdown>
            </div>

            ${linkedTasksList.length > 0 ? meldHtml`
              <div class="linked-tasks-card">
                <h4 class="linked-tasks-title">🔗 Connected Board Tasks</h4>
                <div>
                  ${meld.list(
                    () => linkedTasksList,
                    (task) => task.id,
                    (task) => meldHtml`
                      <div class="linked-task-item">
                        <span class="task-title-status"><strong>${task.title}</strong> (${task.status})</span>
                        <m-button variant="ghost" size="sm" onclick="${() => { window.location.hash = '#/board'; }}">View on Board</m-button>
                      </div>
                    `,
                    (node, task) => {
                      const textSpan = node.querySelector('.task-title-status');
                      if (textSpan) textSpan.innerHTML = `<strong>${task.title}</strong> (${task.status})`;
                    }
                  )}
                </div>
              </div>
            ` : ''}
          `;
        }}
      </div>
    </div>

    <!-- EDIT / CREATE ARTICLE DRAWER -->
    <m-drawer open="${() => state.drawerOpen}" onclose="${() => { state.drawerOpen = false; }}" side="right">
      <div class="form-drawer-content">
        <h3 style="margin-top:0; color:var(--mui-fg); font-weight:700;">
          ${() => state.editSlug ? 'Edit Wiki Document' : 'Create Wiki Document'}
        </h3>
        
        <m-divider></m-divider>

        <div style="display:flex; flex-direction:column; gap:4px;">
          <label class="form-label">Document Title</label>
          <input 
            type="text" 
            class="milestone-input" 
            style="font-size:0.95rem; font-weight:600;"
            value="${() => state.editTitle}" 
            oninput="${(e) => { state.editTitle = e.target.value; }}"
            placeholder="e.g. Project Architecture Docs"
          />
        </div>

        <div style="display:flex; flex-direction:column; gap:4px;">
          <label class="form-label">Category</label>
          <input 
            type="text" 
            class="milestone-input" 
            value="${() => state.editCategory}" 
            oninput="${(e) => { state.editCategory = e.target.value; }}"
            placeholder="e.g. Guides, Architecture"
          />
        </div>

        <div style="display:flex; flex-direction:column; gap:4px;">
          <label class="form-label">Tags (comma-separated)</label>
          <input 
            type="text" 
            class="milestone-input" 
            value="${() => state.editTags}" 
            oninput="${(e) => { state.editTags = e.target.value; }}"
            placeholder="e.g. dev, layout, config"
          />
        </div>

        <div style="display:flex; flex-direction:column; gap:4px;">
          <label class="form-label">Link to Kanban Tasks</label>
          <div class="task-checkbox-list">
            ${() => store.tasks.map(t => meldHtml`
              <label class="task-checkbox-item">
                <input 
                  type="checkbox" 
                  ?checked="${() => state.editLinkedTasks.includes(t.id)}"
                  onchange="${() => toggleLinkedTask(t.id)}"
                />
                <span>${t.title}</span>
              </label>
            `)}
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:4px; flex:1;">
          <label class="form-label">Content (Markdown supported)</label>
          <textarea 
            class="textarea-field" 
            oninput="${(e) => { state.editContent = e.target.value; }}"
            placeholder="Write markdown here..."
          >${() => state.editContent}</textarea>
        </div>

        <div style="display:flex; gap:8px; margin-top:10px;">
          <m-button variant="primary" onclick="${handleSave}" style="flex:1;">Save Document</m-button>
          <m-button variant="secondary" onclick="${() => { state.drawerOpen = false; }}">Cancel</m-button>
        </div>
      </div>
    </m-drawer>
  `;
});
