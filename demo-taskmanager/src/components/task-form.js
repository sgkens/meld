import { defineMeld, meldHtml, store } from '../../../src/meld.core.js';
import { actions } from '../store.js';

defineMeld('task-form', (el, { useForm, emit, props, announce }) => {
  const task = props.task || el.task;
  const isEdit = !!task;

  // Initialize form validation state
  const { fields, errors, handleSubmit } = useForm(
    {
      title: task ? task.title : '',
      description: task ? task.description : '',
      category: task ? task.category : 'General',
      priority: task ? task.priority : 'medium',
      milestone: task ? (task.milestone || '') : '',
      tags: task ? (Array.isArray(task.tags) ? task.tags.join(', ') : '') : ''
    },
    {
      title: ['required']
    }
  );

  const save = (data) => {
    const formattedData = {
      ...data,
      milestone: data.milestone || null,
      tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : (data.tags || [])
    };

    if (isEdit) {
      actions.updateTask(task.id, formattedData);
      if (announce) {
        announce(`Task "${formattedData.title}" has been updated successfully.`);
      }
    } else {
      actions.addTask(formattedData);
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
            <option value="General" ?selected="${() => fields.category === 'General'}">General</option>
            <option value="Learning" ?selected="${() => fields.category === 'Learning'}">Learning</option>
            <option value="Development" ?selected="${() => fields.category === 'Development'}">Development</option>
            <option value="DX" ?selected="${() => fields.category === 'DX'}">DX</option>
          </select>
        </div>

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
      </div>

      <div class="grid-2">
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
      </div>

      <button type="submit" class="submit-btn">
        <span>${isEdit ? 'Save Changes' : 'Create Task'}</span>
      </button>
    </form>
  `;
}, {
  properties: ['task']
});
