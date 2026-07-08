import { defineMeld, meldHtml, store } from '../../../src/meld.core.js';
import { actions } from '../store.js';

defineMeld('task-form', (el, { useForm, emit, props, announce }) => {
  const task = props.task || el.task;
  const isEdit = !!task;

  const getLinkedWiki = () => {
    if (!task) return [];
    return store.wiki.filter(w => Array.isArray(w.linkedTasks) && w.linkedTasks.includes(task.id)).map(w => w.slug);
  };

  // Initialize form validation state
  const { fields, errors, handleSubmit } = useForm(
    {
      title: task ? task.title : '',
      description: task ? task.description : '',
      category: task ? task.category : 'General',
      priority: task ? task.priority : 'medium',
      milestone: task ? (task.milestone || '') : '',
      tags: task ? (Array.isArray(task.tags) ? task.tags.join(', ') : '') : '',
      dueDate: task ? (task.dueDate || '') : '',
      subtasks: task && Array.isArray(task.subtasks) ? JSON.parse(JSON.stringify(task.subtasks)) : [],
      linkedWiki: getLinkedWiki()
    },
    {
      title: ['required']
    }
  );

  const save = (data) => {
    const formattedData = {
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      milestone: data.milestone || null,
      dueDate: data.dueDate || null,
      tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : (data.tags || []),
      subtasks: data.subtasks || []
    };

    if (isEdit) {
      actions.updateTask(task.id, formattedData);
      actions.updateWikiLinks(task.id, data.linkedWiki || []);
      if (announce) {
        announce(`Task "${formattedData.title}" has been updated successfully.`);
      }
    } else {
      const newTask = actions.addTask(formattedData);
      actions.updateWikiLinks(newTask.id, data.linkedWiki || []);
      if (announce) {
        announce(`Task "${formattedData.title}" has been created successfully.`);
      }
    }
    emit('success');
  };

  return meldHtml`
    <style>
      .form-group {
        margin-bottom: var(--mui-space-4);
      }
      .form-group label {
        display: block;
        margin-bottom: var(--mui-space-1);
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--mui-fg);
        opacity: 0.85;
      }
      .form-control {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-md);
        background: var(--mui-bg);
        color: var(--mui-fg);
        font-family: var(--mui-font);
        font-size: 0.9rem;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .form-control:focus {
        outline: none;
        border-color: var(--mui-primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--mui-primary) 15%, transparent);
      }
      textarea.form-control {
        resize: vertical;
        min-height: 80px;
      }
      .error-msg {
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 4px;
        font-weight: 500;
      }
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--mui-space-4);
      }
      .submit-btn {
        width: 100%;
        padding: 10px;
        background: var(--mui-primary);
        color: var(--mui-primary-fg);
        border: none;
        border-radius: var(--mui-radius-md);
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
        margin-top: var(--mui-space-2);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .submit-btn:hover {
        background: var(--mui-primary-hover);
      }
      .submit-btn:active {
        transform: scale(0.98);
      }
    </style>

    <form onsubmit="${handleSubmit(save)}">
      <div class="form-group">
        <label for="task-title">Task Title *</label>
        <input
          id="task-title"
          class="form-control"
          value="${() => fields.title}"
          oninput="${(e) => { fields.title = e.target.value; }}"
          placeholder="What needs to be done?"
          ref="${(n) => setTimeout(() => n.focus(), 50)}"
        />
        <div class="error-msg">${() => errors.title || ''}</div>
      </div>

      <div class="form-group">
        <label for="task-desc">Description</label>
        <textarea
          id="task-desc"
          class="form-control"
          placeholder="Add some details..."
          oninput="${(e) => { fields.description = e.target.value; }}"
        >${() => fields.description}</textarea>
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label for="task-category">Category</label>
          <select
            id="task-category"
            class="form-control"
            onchange="${(e) => { fields.category = e.target.value; }}"
          >
            ${() => store.categories.map(c => meldHtml`
              <option value="${c}" ?selected="${() => fields.category === c}">${c}</option>
            `)}
          </select>
        </div>

        <div class="form-group">
          <label for="task-due">Due Date</label>
          <input
            type="date"
            id="task-due"
            class="form-control"
            value="${() => fields.dueDate}"
            oninput="${(e) => { fields.dueDate = e.target.value; }}"
          />
        </div>
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label for="task-priority">Priority</label>
          <select
            id="task-priority"
            class="form-control"
            onchange="${(e) => { fields.priority = e.target.value; }}"
          >
            <option value="low" ?selected="${() => fields.priority === 'low'}">Low</option>
            <option value="medium" ?selected="${() => fields.priority === 'medium'}">Medium</option>
            <option value="high" ?selected="${() => fields.priority === 'high'}">High</option>
          </select>
        </div>

        <div class="form-group">
          <label for="task-milestone">Milestone</label>
          <select
            id="task-milestone"
            class="form-control"
            onchange="${(e) => { fields.milestone = e.target.value || ''; }}"
          >
            <option value="">None</option>
            ${() => store.milestones.map(m => meldHtml`
              <option value="${m}" ?selected="${() => fields.milestone === m}">${m}</option>
            `)}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="task-tags">Tags (comma-separated)</label>
        <input
          id="task-tags"
          class="form-control"
          value="${() => fields.tags}"
          oninput="${(e) => { fields.tags = e.target.value; }}"
          placeholder="e.g. frontend, core, docs"
        />
      </div>

      <!-- Checklist Items UI inside the form -->
      <div class="form-group">
        <label>Checklist Items</label>
        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:8px;">
          ${() => fields.subtasks.map((sub, idx) => meldHtml`
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" ?checked="${sub.done}" onchange="${() => { sub.done = !sub.done; fields.subtasks = [...fields.subtasks]; }}" />
              <input type="text" class="form-control" style="padding: 6px 10px; font-size:0.85rem;" value="${sub.text}" oninput="${(e) => { sub.text = e.target.value; }}" />
              <button type="button" class="btn btn-outline" style="padding: 6px 10px; border-color:#fca5a5; color:#ef4444; background:transparent; border:1px solid var(--mui-border); border-radius:var(--mui-radius-md); cursor:pointer;" onclick="${() => { fields.subtasks = fields.subtasks.filter((_, i) => i !== idx); }}">✕</button>
            </div>
          `)}
          ${() => fields.subtasks.length === 0 ? meldHtml`<div style="font-size:0.8rem; color:#64748b; font-style:italic;">No checklist items added yet.</div>` : ''}
        </div>
        <div style="display:flex; gap:8px;">
          <input type="text" id="new-form-subtask-input" class="form-control" style="font-size:0.85rem; padding: 6px 10px;" placeholder="Add new checklist item..." />
          <button type="button" class="btn btn-outline" style="padding:6px 12px; font-size:0.85rem; border:1px solid var(--mui-border); background:var(--mui-surface); border-radius:var(--mui-radius-md); cursor:pointer; color:var(--mui-fg);" onclick="${() => {
            const input = el.shadowRoot.getElementById('new-form-subtask-input');
            if (input && input.value.trim()) {
              fields.subtasks = [...fields.subtasks, { id: Date.now() + Math.random(), text: input.value.trim(), done: false }];
              input.value = '';
            }
          }}">Add</button>
        </div>
      </div>

      <!-- Wiki Document Links checklist -->
      <div class="form-group">
        <label>Link to Wiki Documents</label>
        <div class="task-checkbox-list" style="max-height: 120px; overflow-y: auto; border: 1px solid var(--mui-border); border-radius: var(--mui-radius-md); padding: 8px; display: flex; flex-direction: column; gap: 6px;">
          ${() => store.wiki.map(doc => meldHtml`
            <label class="task-checkbox-item" style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; cursor: pointer; color: var(--mui-fg);">
              <input 
                type="checkbox" 
                ?checked="${() => fields.linkedWiki.includes(doc.slug)}"
                onchange="${(e) => {
                  if (e.target.checked) {
                    fields.linkedWiki = [...fields.linkedWiki, doc.slug];
                  } else {
                    fields.linkedWiki = fields.linkedWiki.filter(s => s !== doc.slug);
                  }
                }}"
              />
              <span>📖 ${doc.title}</span>
            </label>
          `)}
          ${() => store.wiki.length === 0 ? meldHtml`<div style="font-size:0.8rem; color:#64748b; font-style:italic;">No wiki documents available.</div>` : ''}
        </div>
      </div>

      <button type="submit" class="submit-btn">
        <span>${isEdit ? 'Save Changes' : 'Create Task'}</span>
      </button>
    </form>
  `;
}, {
  properties: ['task']
});
