import { defineMeld, meldHtml } from '../../../src/meld.core.js';
import { actions } from '../store.js';

defineMeld('task-card', (el, { emit, props }) => {
  // Grab the task object dynamically from props or fallback to element property
  const getTask = () => props.task || el.task;

  const setStatus = (status) => {
    const t = getTask();
    if (t) {
      actions.updateTaskStatus(t.id, status);
      emit('status-changed', { id: t.id, status });
    }
  };

  const remove = () => {
    const t = getTask();
    if (t) {
      actions.deleteTask(t.id);
      emit('deleted', t.id);
    }
  };

  const edit = () => {
    const t = getTask();
    if (t) {
      emit('edit-task', t);
    }
  };

  const priorityColor = () => {
    const t = getTask();
    if (!t) return '#6b7280';
    switch (t.priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const statusIcons = {
    todo: '📋',
    doing: '⚡',
    done: '✅'
  };

  return meldHtml`
    <style>
      :host {
        display: block;
        background: var(--mui-bg);
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-md);
        padding: var(--mui-space-4);
        margin-bottom: var(--mui-space-2);
        box-shadow: var(--mui-shadow-sm);
        transition: box-shadow 0.2s, transform 0.2s;
        position: relative;
        overflow: hidden;
      }
      :host(:hover) {
        box-shadow: var(--mui-shadow-md);
        transform: translateY(-2px);
      }
      
      .priority-indicator {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 4px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: var(--mui-space-2);
      }

      .title {
        font-weight: 600;
        font-size: 0.95rem;
        margin: 0;
        color: var(--mui-fg);
      }

      .description {
        font-size: 0.82rem;
        color: var(--mui-fg);
        opacity: 0.75;
        margin: 0 0 var(--mui-space-4) 0;
        line-height: 1.4;
      }

      .card-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--mui-space-2);
        font-size: 0.75rem;
        border-top: 1px solid var(--mui-border);
        padding-top: var(--mui-space-2);
      }

      .meta-left {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .category-tag {
        background: var(--mui-surface);
        border: 1px solid var(--mui-border);
        color: var(--mui-fg);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
      }

      .time-ago {
        color: #64748b;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .action-btn {
        background: var(--mui-surface);
        border: 1px solid var(--mui-border);
        color: var(--mui-fg);
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 4px;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 2px;
        transition: all 0.15s;
      }
      .action-btn:hover {
        background: var(--mui-border);
      }
      .action-btn.edit:hover {
        background: color-mix(in srgb, var(--mui-primary) 10%, transparent);
        border-color: var(--mui-primary);
      }
      .action-btn.delete:hover {
        background: #fef2f2;
        border-color: #fca5a5;
        color: #ef4444;
      }

      .priority-badge {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        padding: 1px 4px;
        border-radius: 3px;
        color: #fff;
      }
    </style>

    <div class="priority-indicator" style="background-color: ${() => priorityColor()}"></div>

    <div class="card-header">
      <h4 class="title">${() => {
        const t = getTask();
        return t ? t.title : '';
      }}</h4>
      <span class="priority-badge" style="background-color: ${() => priorityColor()}">${() => {
        const t = getTask();
        return t ? t.priority : '';
      }}</span>
    </div>

    <p class="description">${() => {
      const t = getTask();
      return t ? (t.description || 'No description provided.') : '';
    }}</p>

    <div class="card-meta">
      <div class="meta-left">
        <span class="category-tag">${() => {
          const t = getTask();
          return t ? t.category : '';
        }}</span>
        <span class="time-ago">
          <meld-time date="${() => {
            const t = getTask();
            return t ? t.createdAt : '';
          }}" format="relative"></meld-time>
        </span>
      </div>

      <div class="actions">
        ${() => {
          const t = getTask();
          if (!t) return '';
          return t.status !== 'todo' 
            ? meldHtml`<button class="action-btn" onclick="${() => setStatus('todo')}" title="Move to To Do">${statusIcons.todo} To Do</button>` 
            : '';
        }}
        ${() => {
          const t = getTask();
          if (!t) return '';
          return t.status !== 'doing' 
            ? meldHtml`<button class="action-btn" onclick="${() => setStatus('doing')}" title="Move to In Progress">${statusIcons.doing} Doing</button>` 
            : '';
        }}
        ${() => {
          const t = getTask();
          if (!t) return '';
          return t.status !== 'done' 
            ? meldHtml`<button class="action-btn" onclick="${() => setStatus('done')}" title="Complete Task">${statusIcons.done} Done</button>` 
            : '';
        }}
        <button class="action-btn edit" onclick="${edit}" title="Edit Task">✏️</button>
        <button class="action-btn delete" onclick="${remove}" title="Delete Task">🗑️</button>
      </div>
    </div>
  `;
}, {
  properties: ['task']
});
