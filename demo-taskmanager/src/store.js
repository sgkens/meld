import { meldState, computed } from '../../src/meld.core.js';

// Local storage persistence helper using computed
export function persist(state, key, storage = localStorage) {
  const saved = storage.getItem(key);
  if (saved) {
    try {
      Object.assign(state, JSON.parse(saved));
    } catch (e) {
      console.error("MeldPersist Error", e);
    }
  }
  
  computed(() => {
    storage.setItem(key, JSON.stringify(state));
    return state;
  });
  return state;
}

// Tab synchronization helper using BroadcastChannel and computed
export function broadcastSync(channelName, store, keys = null) {
  if (typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel(channelName);
  let isReceiving = false;

  channel.onmessage = (event) => {
    isReceiving = true;
    const { key, value } = event.data;
    store[key] = value;
    setTimeout(() => { isReceiving = false; }, 0);
  };

  const keysToWatch = keys || Object.keys(store);
  keysToWatch.forEach(key => {
    computed(() => {
      const val = store[key];
      if (!isReceiving) {
        channel.postMessage({ key, value: val });
      }
      return val;
    });
  });
}

// Initial default tasks list
const initialTasks = [
  {
    id: 1,
    title: 'Explore Meld.js Architecture',
    description: 'Investigate fine-grained reactivity using Proxy handlers and adopted stylesheets.',
    status: 'todo',
    category: 'Learning',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 2,
    title: 'Implement TaskFlow Kanban Demo',
    description: 'Wire up portals for modal dialogs and form validation using Meld plugin ecosystem.',
    status: 'doing',
    category: 'Development',
    priority: 'medium',
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: 3,
    title: 'Enable Dev Mode Component Highlighting',
    description: 'Inject a custom devtools wrapper to flash updated custom elements with render badges.',
    status: 'done',
    category: 'DX',
    priority: 'high',
    createdAt: new Date(Date.now() - 600000).toISOString()
  }
];

const initialState = {
  theme: 'light',
  devMode: false,
  tasks: initialTasks,
  activities: [
    { id: 1, text: 'Task Manager Demo initialized', time: new Date().toISOString() }
  ],
  filter: 'all',
  searchQuery: ''
};

// Create a reactive proxy state
export const store = meldState(initialState);

// Apply persistence
persist(store, 'meld-taskmanager-data');

// Sync across tabs
broadcastSync('meld-taskmanager-channel', store, ['theme', 'devMode', 'tasks', 'activities']);

// Define actions to manipulate store state
export const actions = {
  addTask({ title, description, category, priority }) {
    const newTask = {
      id: Date.now(),
      title,
      description: description || '',
      status: 'todo',
      category: category || 'General',
      priority: priority || 'medium',
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
      Object.assign(task, data);
      // Force trigger array update
      store.tasks = [...store.tasks];
      actions.addActivity(`Updated task: "${task.title}"`);
    }
  },

  deleteTask(id) {
    const task = store.tasks.find(t => t.id === id);
    if (task) {
      store.tasks = store.tasks.filter(t => t.id !== id);
      actions.addActivity(`Deleted task: "${task.title}"`);
    }
  },

  clearAllTasks() {
    store.tasks = [];
    actions.addActivity('Cleared all tasks');
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
