import { use, meldState, computed, onDestroy } from '../../src/meld.core.js';
import { MeldPersist } from '../../src/plugins/meld-persist.js';
import { MeldBroadcast } from '../../src/plugins/meld-broadcast.js';

// Setup and install plugins on a mock api context
const api = { meldState, computed, onDestroy };
MeldPersist.install(api);
MeldBroadcast.install(api);

// Mock streaming AI endpoint for Task Manager Suggestions
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  if (url === '/api/prompt' || url === 'http://localhost/api/prompt') {
    const encoder = new TextEncoder();
    const suggestions = [
      "- **Configure Database connection** (Priority: high) - Set up local postgres with knex migrations\n",
      "- **Write authentication routes** (Priority: medium) - Implement Lucia login/logout endpoints\n",
      "- **Design user profile UI** (Priority: low) - Add client-side custom elements for settings\n"
    ];
    
    const stream = new ReadableStream({
      async start(controller) {
        for (const line of suggestions) {
          controller.enqueue(encoder.encode(line));
          await new Promise(r => setTimeout(r, 600));
        }
        controller.close();
      }
    });
    
    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
  return originalFetch ? originalFetch(url, options) : Promise.reject("Fetch unavailable");
};

// Initial default tasks list with Markdown description tags, tags, milestones, dueDates, and subtasks
const initialTasks = [
  {
    id: 1,
    title: 'Explore Meld.js Architecture',
    description: 'Investigate **fine-grained reactivity** using *Proxy handlers* and adopted stylesheets.',
    status: 'todo',
    category: 'Learning',
    priority: 'high',
    archived: false,
    milestone: 'Sprint 1',
    tags: ['reactivity', 'core'],
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), // 2 days from now
    subtasks: [
      { id: 101, text: 'Analyze Proxy handlers inside meldState', done: true },
      { id: 102, text: 'Examine custom element attribute mapping', done: false }
    ],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 2,
    title: 'Implement TaskFlow Kanban Demo',
    description: 'Wire up **portals** for modal dialogs and *form validation* using the Meld plugin ecosystem.',
    status: 'doing',
    category: 'Development',
    priority: 'medium',
    archived: false,
    milestone: 'Sprint 1',
    tags: ['ux', 'plugins'],
    dueDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // Yesterday (Overdue!)
    subtasks: [
      { id: 201, text: 'Build page dashboard and grid components', done: true },
      { id: 202, text: 'Add milestone filters to pages.js', done: true },
      { id: 203, text: 'Verify drag and drop reactivity', done: false }
    ],
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: 3,
    title: 'Enable Dev Mode Component Highlighting',
    description: 'Inject a custom **devtools** wrapper to flash updated custom elements with *render badges*.',
    status: 'done',
    category: 'DX',
    priority: 'high',
    archived: false,
    milestone: 'Sprint 2',
    tags: ['dx', 'devtools'],
    dueDate: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10), // 5 days ago (Done, so not overdue)
    subtasks: [],
    createdAt: new Date(Date.now() - 600000).toISOString()
  }
];

const initialState = {
  theme: 'light',
  devMode: false,
  showAICopilot: false,
  enableDragAndDrop: true,
  milestones: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Q3 Release'],
  categories: ['General', 'Learning', 'Development', 'DX'],
  sortBy: 'created', // 'created', 'priority', 'dueDate'
  filterMilestone: 'all',
  filterTag: 'all',
  tasks: initialTasks,
  activities: [
    { id: 1, text: 'Task Manager Demo initialized', time: new Date().toISOString() }
  ],
  filter: 'all',
  searchQuery: ''
};

// Create a reactive proxy state
export const store = meldState(initialState);

// Apply persistence using framework plugin implementation
api.persist(store, 'meld-taskmanager-data');

// Sync across tabs using framework plugin implementation
api.useBroadcast('meld-taskmanager-channel', store, [
  'theme', 'devMode', 'showAICopilot', 'enableDragAndDrop', 
  'milestones', 'categories', 'sortBy', 'filterMilestone', 'filterTag', 'tasks', 'activities'
]);

// Define actions to manipulate store state
export const actions = {
  addTask({ title, description, category, priority, milestone, tags, dueDate, subtasks }) {
    const parsedTags = Array.isArray(tags) 
      ? tags 
      : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
      
    const newTask = {
      id: Date.now(),
      title,
      description: description || '',
      status: 'todo',
      category: category || 'General',
      priority: priority || 'medium',
      archived: false,
      milestone: milestone || null,
      tags: parsedTags,
      dueDate: dueDate || null,
      subtasks: subtasks || [],
      createdAt: new Date().toISOString()
    };
    store.tasks = [newTask, ...store.tasks];
    actions.addActivity(`Created task: "${title}"`);
    return newTask;
  },

  updateTaskStatus(id, status) {
    const task = store.tasks.find(t => t.id === id);
    if (task) {
      const oldStatus = task.status;
      task.status = status;
      // Force trigger array update
      store.tasks = [...store.tasks];
      actions.addActivity(`Moved "${task.title}" from ${oldStatus} to ${status}`);
    }
  },

  updateTask(id, data) {
    const task = store.tasks.find(t => t.id === id);
    if (task) {
      if (data.tags && typeof data.tags === 'string') {
        data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      Object.assign(task, data);
      // Force trigger array update
      store.tasks = [...store.tasks];
      actions.addActivity(`Updated task: "${task.title}"`);
    }
  },

  archiveTask(id) {
    const task = store.tasks.find(t => t.id === id);
    if (task) {
      task.archived = true;
      store.tasks = [...store.tasks];
      actions.addActivity(`Archived task: "${task.title}"`);
    }
  },

  unarchiveTask(id) {
    const task = store.tasks.find(t => t.id === id);
    if (task) {
      task.archived = false;
      store.tasks = [...store.tasks];
      actions.addActivity(`Unarchived task: "${task.title}"`);
    }
  },

  deleteTask(id) {
    const task = store.tasks.find(t => t.id === id);
    if (task) {
      store.tasks = store.tasks.filter(t => t.id !== id);
      actions.addActivity(`Permanently deleted task: "${task.title}"`);
    }
  },

  clearAllTasks() {
    store.tasks = [];
    actions.addActivity('Cleared all tasks');
  },

  addMilestone(name) {
    if (name && !store.milestones.includes(name)) {
      store.milestones = [...store.milestones, name];
      actions.addActivity(`Added milestone: "${name}"`);
    }
  },

  addCategory(name) {
    if (name && !store.categories.includes(name)) {
      store.categories = [...store.categories, name];
      actions.addActivity(`Added category: "${name}"`);
    }
  },

  setSortBy(val) {
    store.sortBy = val;
  },

  setFilterMilestone(val) {
    store.filterMilestone = val;
  },

  setFilterTag(val) {
    store.filterTag = val;
  },

  toggleDragAndDrop() {
    store.enableDragAndDrop = !store.enableDragAndDrop;
    actions.addActivity(`Drag & Drop ${store.enableDragAndDrop ? 'enabled' : 'disabled'}`);
  },

  toggleTheme() {
    store.theme = store.theme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', store.theme);
    actions.addActivity(`Theme changed to ${store.theme}`);
  },

  toggleDevMode() {
    store.devMode = !store.devMode;
    window.meldDevMode = store.devMode;
    window.localStorage.setItem('meld-devmode', store.devMode);
    actions.addActivity(`Dev Mode toggled ${store.devMode ? 'ON' : 'OFF'}`);
  },

  toggleAICopilot() {
    store.showAICopilot = !store.showAICopilot;
    actions.addActivity(`AI Copilot toggled ${store.showAICopilot ? 'ON' : 'OFF'}`);
  },

  toggleSubtask(taskId, subtaskId) {
    const task = store.tasks.find(t => t.id === taskId);
    if (task && Array.isArray(task.subtasks)) {
      const sub = task.subtasks.find(s => s.id === subtaskId);
      if (sub) {
        sub.done = !sub.done;
        store.tasks = [...store.tasks];
        actions.addActivity(`Toggled subtask: "${sub.text}"`);
      }
    }
  },

  addSubtask(taskId, text) {
    const task = store.tasks.find(t => t.id === taskId);
    if (task && text.trim()) {
      if (!Array.isArray(task.subtasks)) task.subtasks = [];
      task.subtasks.push({
        id: Date.now(),
        text: text.trim(),
        done: false
      });
      store.tasks = [...store.tasks];
      actions.addActivity(`Added subtask to "${task.title}"`);
    }
  },

  deleteSubtask(taskId, subtaskId) {
    const task = store.tasks.find(t => t.id === taskId);
    if (task && Array.isArray(task.subtasks)) {
      task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
      store.tasks = [...store.tasks];
      actions.addActivity(`Deleted subtask`);
    }
  },

  importTasks(tasksArray) {
    if (Array.isArray(tasksArray)) {
      const sanitized = tasksArray.map(t => ({
        id: t.id || Date.now() + Math.random(),
        title: t.title || 'Untitled Task',
        description: t.description || '',
        status: t.status || 'todo',
        category: t.category || 'General',
        priority: t.priority || 'medium',
        archived: !!t.archived,
        milestone: t.milestone || null,
        tags: Array.isArray(t.tags) ? t.tags : [],
        dueDate: t.dueDate || null,
        subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
        createdAt: t.createdAt || new Date().toISOString()
      }));
      store.tasks = [...sanitized, ...store.tasks];
      actions.addActivity(`Imported ${sanitized.length} tasks successfully`);
    }
  },

  addActivity(text) {
    const log = {
      id: Date.now(),
      text,
      time: new Date().toISOString()
    };
    store.activities = [log, ...store.activities].slice(0, 50); // Keep last 50
  }
};

// Bind all actions to prevent this context loss in event handlers
Object.keys(actions).forEach(key => {
  if (typeof actions[key] === 'function') {
    actions[key] = actions[key].bind(actions);
  }
});
