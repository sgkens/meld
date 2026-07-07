import { defineMeld, meldHtml, store } from '../../../src/meld.core.js';
import { actions } from '../store.js';

defineMeld('task-card', (el, { emit, props, effect }) => {
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

  const archive = () => {
    const t = getTask();
    if (t) {
      actions.archiveTask(t.id);
      emit('archived', t.id);
    }
  };

  const restore = () => {
    const t = getTask();
    if (t) {
      actions.unarchiveTask(t.id);
      emit('unarchived', t.id);
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

  const isOverdue = () => {
    const t = getTask();
    if (!t || !t.dueDate || t.status === 'done') return false;
    const today = new Date().toISOString().slice(0, 10);
    return t.dueDate < today;
  };

  // Drag & Drop Handlers
  const handleDragStart = (e) => {
    const t = getTask();
    if (t) {
      e.dataTransfer.setData('text/plain', t.id.toString());
      e.dataTransfer.effectAllowed = 'move';
      el.classList.add('dragging');
      // Set opacity for drag feedback
      setTimeout(() => {
        el.style.opacity = '0.4';
      }, 0);
    }
  };

  const handleDragEnd = () => {
    el.classList.remove('dragging');
    el.style.opacity = '';
  };

  // Bind drag events reactively depending on settings
  effect(() => {
    if (store.enableDragAndDrop) {
      el.setAttribute('draggable', 'true');
      el.addEventListener('dragstart', handleDragStart);
      el.addEventListener('dragend', handleDragEnd);
    } else {
      el.removeAttribute('draggable');
      el.removeEventListener('dragstart', handleDragStart);
      el.removeEventListener('dragend', handleDragEnd);
    }
  });

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
        cursor: grab;
      }
      :host(:active) {
        cursor: grabbing;
      }
      :host(:hover) {
        box-shadow: var(--mui-shadow-md);
        transform: translateY(-2px);
      }
      :host(.dragging) {
        border: 2px dashed var(--mui-primary) !important;
        box-shadow: none;
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
        margin: 0 0 var(--mui-space-3) 0;
        line-height: 1.4;
      }

      .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: var(--mui-space-3);
      }

      .tag-pill {
        background: var(--mui-surface);
        border: 1px solid var(--mui-border);
        font-size: 0.65rem;
        font-weight: 600;
        color: var(--mui-fg);
        padding: 1px 6px;
        border-radius: 10px;
        opacity: 0.8;
        cursor: pointer;
        transition: all 0.15s;
      }
      .tag-pill:hover {
        background: var(--mui-primary);
        color: var(--mui-primary-fg);
        opacity: 1;
      }

      .milestone-tag {
        font-size: 0.7rem;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        color: #1d4ed8;
        padding: 1px 5px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        margin-bottom: var(--mui-space-2);
        font-weight: 500;
      }

      .due-date-tag {
        font-size: 0.7rem;
        color: #64748b;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        margin-bottom: var(--mui-space-2);
      }
      .overdue-badge {
        background: #fef2f2;
        border: 1px solid #fca5a5;
        color: #ef4444;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 1px 5px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        margin-bottom: var(--mui-space-2);
      }

      /* Subtask progress checklist styles */
      .subtask-progress {
        font-size: 0.72rem;
        color: #64748b;
        margin-bottom: var(--mui-space-3);
      }
      .progress-bar-container {
        height: 5px;
        background: var(--mui-surface);
        border-radius: 3px;
        overflow: hidden;
        border: 1px solid var(--mui-border);
        margin-top: 2px;
      }
      .progress-bar {
        height: 100%;
        transition: width 0.3s ease;
      }

      .subtasks-list {
        margin-bottom: var(--mui-space-2);
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-left: 2px;
      }
      .subtask-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.78rem;
        color: var(--mui-fg);
        position: relative;
      }
      .subtask-item input[type="checkbox"] {
        cursor: pointer;
        width: 13px;
        height: 13px;
      }
      .subtask-item span.done {
        text-decoration: line-through;
        opacity: 0.6;
      }
      .delete-sub-btn {
        border: none;
        background: transparent;
        color: #ef4444;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
        margin-left: auto;
        padding: 0 4px;
        font-size: 0.7rem;
      }
      .subtask-item:hover .delete-sub-btn {
        opacity: 1;
      }
      .quick-subtask-form {
        margin-bottom: var(--mui-space-3);
      }
      .new-subtask-input {
        width: 100%;
        border: 1px dashed var(--mui-border);
        background: transparent;
        padding: 4px 8px;
        font-size: 0.75rem;
        border-radius: 4px;
        color: var(--mui-fg);
        font-family: var(--mui-font);
      }
      .new-subtask-input:focus {
        outline: none;
        border-color: var(--mui-primary);
        border-style: solid;
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
      .action-btn.archive:hover {
        background: #f0f9ff;
        border-color: #93c5fd;
        color: #0369a1;
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

    <div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
      ${() => {
        const t = getTask();
        return t && t.milestone ? meldHtml`<span class="milestone-tag">🏁 ${t.milestone}</span>` : '';
      }}

      ${() => {
        const t = getTask();
        if (!t || !t.dueDate) return '';
        if (isOverdue()) {
          return meldHtml`<span class="overdue-badge">⚠️ Overdue: <meld-time date="${t.dueDate}" format="short"></meld-time></span>`;
        }
        return meldHtml`<span class="due-date-tag">📅 Due: <meld-time date="${t.dueDate}" format="short"></meld-time></span>`;
      }}
    </div>

    <div class="description">
      <meld-markdown content="${() => {
        const t = getTask();
        return t ? (t.description || '*No description provided.*') : '';
      }}"></meld-markdown>
    </div>

    <!-- SUBTASK PROGRESS BAR -->
    ${() => {
      const t = getTask();
      if (t && Array.isArray(t.subtasks) && t.subtasks.length > 0) {
        const doneCount = t.subtasks.filter(s => s.done).length;
        const pct = Math.round((doneCount / t.subtasks.length) * 100);
        return meldHtml`
          <div class="subtask-progress">
            <div style="display:flex; justify-content:space-between; margin-bottom: 2px;">
              <span>Checklist (${doneCount}/${t.subtasks.length})</span>
              <strong>${pct}%</strong>
            </div>
            <div class="progress-bar-container"><div class="progress-bar" style="width:${pct}%; background-color:#10b981;"></div></div>
          </div>
        `;
      }
      return '';
    }}

    <!-- SUBTASKS LIST -->
    ${() => {
      const t = getTask();
      if (t && Array.isArray(t.subtasks) && t.subtasks.length > 0) {
        return meldHtml`
          <div class="subtasks-list">
            ${t.subtasks.map(sub => meldHtml`
              <div class="subtask-item">
                <input type="checkbox" ?checked="${sub.done}" onchange="${() => actions.toggleSubtask(t.id, sub.id)}" />
                <span class="${sub.done ? 'done' : ''}">${sub.text}</span>
                <button class="delete-sub-btn" onclick="${() => actions.deleteSubtask(t.id, sub.id)}">✕</button>
              </div>
            `)}
          </div>
        `;
      }
      return '';
    }}

    <!-- QUICK SUBTASK ADD INPUT -->
    ${() => {
      const t = getTask();
      if (t && !t.archived) {
        return meldHtml`
          <form class="quick-subtask-form" onsubmit="${(e) => {
            e.preventDefault();
            const input = e.target.querySelector('.new-subtask-input');
            if (input && input.value.trim()) {
              actions.addSubtask(t.id, input.value.trim());
              input.value = '';
            }
          }}">
            <input type="text" class="new-subtask-input" placeholder="+ Add checklist item..." />
          </form>
        `;
      }
      return '';
    }}

    ${() => {
      const t = getTask();
      if (t && Array.isArray(t.tags) && t.tags.length > 0) {
        return meldHtml`
          <div class="tags-list">
            ${t.tags.map(tag => meldHtml`
              <span class="tag-pill" onclick="${() => actions.setFilterTag(tag)}">#${tag}</span>
            `)}
          </div>
        `;
      }
      return '';
    }}

    <!-- LINKED WIKI DOCS -->
    ${() => {
      const t = getTask();
      if (!t) return '';
      const linkedDocs = store.wiki.filter(w => w.linkedTasks && w.linkedTasks.includes(t.id));
      if (linkedDocs.length > 0) {
        return meldHtml`
          <div style="font-size: 0.72rem; color: #64748b; margin-top: var(--mui-space-2); margin-bottom: var(--mui-space-3); padding-top: var(--mui-space-2); border-top: 1px dashed var(--mui-border); display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
            <span style="font-weight:600;">Linked Wiki:</span>
            ${linkedDocs.map(doc => meldHtml`
              <a href="#/wiki?slug=${doc.slug}" style="color:var(--mui-primary); text-decoration:none; font-weight:600; display:inline-flex; align-items:center; gap:2px; background:var(--mui-surface); padding: 1px 6px; border-radius:4px; border:1px solid var(--mui-border);">📖 ${doc.title}</a>
            `)}
          </div>
        `;
      }
      return '';
    }}

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
          
          if (t.archived) {
            return meldHtml`
              <button class="action-btn archive" onclick="${restore}" title="Unarchive Task">📤 Restore</button>
              <button class="action-btn delete" onclick="${remove}" title="Permanently Delete Task">🗑️ Delete</button>
            `;
          }
          
          return meldHtml`
            <button class="action-btn edit" onclick="${edit}" title="Edit Task">✏️</button>
            <button class="action-btn archive" onclick="${archive}" title="Archive Task">📦 Archive</button>
            <button class="action-btn delete" onclick="${remove}" title="Delete Task">🗑️</button>
          `;
        }}
      </div>
    </div>
  `;
}, {
  properties: ['task']
});
