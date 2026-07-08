import { use, meldState, computed, onDestroy } from '../../src/meld.core.js';
import { MeldPersist } from '../../src/plugins/meld-persist.js';
import { MeldBroadcast } from '../../src/plugins/meld-broadcast.js';
import { toast } from '../../src/components/data/m-toast.js';

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

const initialWiki = [
  {
    slug: 'getting-started',
    title: 'Getting Started with TaskFlow',
    content: 'Welcome to **Meld TaskFlow**! This workspace integrates project planning, sprint milestones, and wiki pages. \n\n### Core Tips\n- Use **Kanban Board** to organize progress.\n- Drag-and-drop cards between columns to change status.\n- Add checklist items directly onto task cards.\n- Link wiki docs to specific tasks for context.',
    category: 'Guides',
    tags: ['welcome', 'docs'],
    linkedTasks: [1],
    createdAt: new Date().toISOString()
  },
  {
    slug: 'reactivity-guide',
    title: 'Meld Reactive Architecture',
    content: 'Meld uses fine-grained proxy wrappers to track dependencies. \n\n- `meldState()` creates reactive proxy objects.\n- `computed()` evaluates expressions and caches results.\n- `effect()` reacts to store mutations automatically.',
    category: 'Architecture',
    tags: ['reactivity', 'advanced'],
    linkedTasks: [2, 3],
    createdAt: new Date().toISOString()
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
  wiki: initialWiki,
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
  'milestones', 'categories', 'sortBy', 'filterMilestone', 'filterTag', 'tasks', 'wiki', 'activities',
  'filter', 'searchQuery'
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
    toast.success(`Task "${title}" created successfully.`);
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
      toast.success(`Moved "${task.title}" to ${status}.`);
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
      toast.success(`Task "${task.title}" updated.`);
    }
  },

  archiveTask(id) {
    const task = store.tasks.find(t => t.id === id);
    if (task) {
      task.archived = true;
      store.tasks = [...store.tasks];
      actions.addActivity(`Archived task: "${task.title}"`);
      toast.success(`Task "${task.title}" archived.`);
    }
  },

  unarchiveTask(id) {
    const task = store.tasks.find(t => t.id === id);
    if (task) {
      task.archived = false;
      store.tasks = [...store.tasks];
      actions.addActivity(`Unarchived task: "${task.title}"`);
      toast.success(`Task "${task.title}" restored to board.`);
    }
  },

  deleteTask(id) {
    const task = store.tasks.find(t => t.id === id);
    if (task) {
      store.tasks = store.tasks.filter(t => t.id !== id);
      actions.addActivity(`Permanently deleted task: "${task.title}"`);
      toast.success(`Task deleted permanently.`);
    }
  },

  clearAllTasks() {
    const count = store.tasks.length;
    store.tasks = [];
    actions.addActivity('Cleared all tasks');
    toast.show(`Cleared all ${count} tasks.`, 'error');
  },

  addMilestone(name) {
    if (name && !store.milestones.includes(name)) {
      store.milestones = [...store.milestones, name];
      actions.addActivity(`Added milestone: "${name}"`);
      toast.success(`Milestone "${name}" added.`);
    }
  },

  addCategory(name) {
    if (name && !store.categories.includes(name)) {
      store.categories = [...store.categories, name];
      actions.addActivity(`Added category: "${name}"`);
      toast.success(`Category "${name}" added.`);
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
    toast.success(`Drag & Drop ${store.enableDragAndDrop ? 'enabled' : 'disabled'}.`);
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

  clearCompletedSubtasks(taskId) {
    const task = store.tasks.find(t => t.id === taskId);
    if (task && Array.isArray(task.subtasks)) {
      const initialCount = task.subtasks.length;
      task.subtasks = task.subtasks.filter(s => !s.done);
      const clearedCount = initialCount - task.subtasks.length;
      store.tasks = [...store.tasks];
      actions.addActivity(`Cleared ${clearedCount} completed checklist items from "${task.title}"`);
      toast.success(`Cleared ${clearedCount} checklist items.`);
    }
  },

  updateWikiLinks(taskId, selectedWikiSlugs) {
    const id = Number(taskId);
    store.wiki.forEach(doc => {
      if (!Array.isArray(doc.linkedTasks)) doc.linkedTasks = [];
      const isLinked = selectedWikiSlugs.includes(doc.slug);
      const index = doc.linkedTasks.indexOf(id);
      if (isLinked && index === -1) {
        doc.linkedTasks.push(id);
      } else if (!isLinked && index !== -1) {
        doc.linkedTasks.splice(index, 1);
      }
    });
    store.wiki = [...store.wiki];
  },

  saveWikiArticle({ slug, title, content, category, tags, linkedTasks }) {
    const existing = store.wiki.find(w => w.slug === slug);
    const parsedTags = Array.isArray(tags) 
      ? tags 
      : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    const parsedLinkedTasks = Array.isArray(linkedTasks)
      ? linkedTasks.map(Number)
      : [];

    if (existing) {
      existing.title = title;
      existing.content = content;
      existing.category = category;
      existing.tags = parsedTags;
      existing.linkedTasks = parsedLinkedTasks;
      store.wiki = [...store.wiki];
      actions.addActivity(`Updated wiki article: "${title}"`);
      toast.success(`Wiki article "${title}" updated.`);
    } else {
      const newArticle = {
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title,
        content,
        category: category || 'General',
        tags: parsedTags,
        linkedTasks: parsedLinkedTasks,
        createdAt: new Date().toISOString()
      };
      store.wiki = [newArticle, ...store.wiki];
      actions.addActivity(`Created wiki article: "${title}"`);
      toast.success(`Wiki article "${title}" created.`);
    }
  },

  deleteWikiArticle(slug) {
    const existing = store.wiki.find(w => w.slug === slug);
    if (existing) {
      store.wiki = store.wiki.filter(w => w.slug !== slug);
      actions.addActivity(`Deleted wiki article: "${existing.title}"`);
      toast.show(`Deleted wiki article "${existing.title}".`, 'error');
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
      toast.success(`Imported ${sanitized.length} tasks successfully.`);
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
