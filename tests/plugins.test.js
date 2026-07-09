import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { meldState, computed, defineMeld, meldHtml, onDestroy, onMount, provide, inject, meld, effect } from '../src/meld.core.js';

// Import all plugins
import { MeldA11y } from '../src/plugins/meld-a11y.js';
import { MeldAI } from '../src/plugins/meld-ai.js';
import { MeldBroadcast } from '../src/plugins/meld-broadcast.js';
import { MeldCookie } from '../src/plugins/meld-cookie.js';
import { MeldDevtools } from '../src/plugins/meld-devtools.js';
import { MeldDiagnostics } from '../src/plugins/meld-diagnostics.js';
import { MeldDownload } from '../src/plugins/meld-download.js';
import { MeldFederation } from '../src/plugins/meld-federation.js';
import { MeldForms } from '../src/plugins/meld-forms.js';
import { MeldGrpc } from '../src/plugins/meld-grpc.js';
import { MeldHead } from '../src/plugins/meld-head.js';
import { MeldI18n } from '../src/plugins/meld-i18n.js';
import { MeldInertia } from '../src/plugins/meld-inertia.js';
import { MeldLazy } from '../src/plugins/meld-lazy.js';
import { MeldLogger } from '../src/plugins/meld-logger.js';
import { MeldMarkdown } from '../src/plugins/meld-markdown.js';
import { MeldMicrobus } from '../src/plugins/meld-microbus.js';
import { MeldMotion } from '../src/plugins/meld-motion.js';
import { MeldHotkeys } from '../src/plugins/meld-hotkeys.js';
import { MeldPersist } from '../src/plugins/meld-persist.js';
import { MeldPortal } from '../src/plugins/meld-portal.js';
import { MeldQuery } from '../src/plugins/meld-query.js';
import { MeldQuiver } from '../src/plugins/meld-quiver.js';
import { MeldRouter } from '../src/plugins/meld-router.js';
import { MeldSkeleton } from '../src/plugins/meld-skeleton.js';
import { MeldSocket } from '../src/plugins/meld-socket.js';
import { MeldStore } from '../src/plugins/meld-store.js';
import { MeldTerminal } from '../src/plugins/meld-terminal.js';
import { MeldTime } from '../src/plugins/meld-time.js';
import { MeldUpload } from '../src/plugins/meld-upload.js';
import { MeldVersioning } from '../src/plugins/meld-versioning.js';
import { MeldWasm } from '../src/plugins/meld-wasm.js';
import { MeldToast, toast } from '../src/plugins/meld-toast.js';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

// Complete API object mimicking what meld.use() passes
const api = { defineMeld, meldState, meldHtml, computed, provide, inject, onMount, onDestroy, meld, effect };

beforeEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  jest.restoreAllMocks();
  localStorage.clear();
  document.cookie = "";
});

describe('Meld Plugin Exports & Installation', () => {
  const pluginModules = [
    ['MeldA11y', MeldA11y],
    ['MeldAI', MeldAI],
    ['MeldBroadcast', MeldBroadcast],
    ['MeldCookie', MeldCookie],
    ['MeldDevtools', MeldDevtools],
    ['MeldDiagnostics', MeldDiagnostics],
    ['MeldDownload', MeldDownload],
    ['MeldFederation', MeldFederation],
    ['MeldForms', MeldForms],
    ['MeldGrpc', MeldGrpc],
    ['MeldHead', MeldHead],
    ['MeldI18n', MeldI18n],
    ['MeldInertia', MeldInertia],
    ['MeldLazy', MeldLazy],
    ['MeldLogger', MeldLogger],
    ['MeldMarkdown', MeldMarkdown],
    ['MeldMicrobus', MeldMicrobus],
    ['MeldMotion', MeldMotion],
    ['MeldPersist', MeldPersist],
    ['MeldPortal', MeldPortal],
    ['MeldQuery', MeldQuery],
    ['MeldQuiver', MeldQuiver],
    ['MeldRouter', MeldRouter],
    ['MeldSkeleton', MeldSkeleton],
    ['MeldSocket', MeldSocket],
    ['MeldStore', MeldStore],
    ['MeldTerminal', MeldTerminal],
    ['MeldTime', MeldTime],
    ['MeldUpload', MeldUpload],
    ['MeldVersioning', MeldVersioning],
    ['MeldWasm', MeldWasm]
  ];

  it.each(pluginModules)('%s exports an install hook', (_name, plugin) => {
    expect(typeof plugin.install).toBe('function');
  });
});

describe('MeldPersist Plugin', () => {
  it('synchronizes reactive state dynamically to/from localStorage', () => {
    MeldPersist.install(api);
    
    localStorage.setItem('my-key', JSON.stringify({ name: 'Alice', age: 30 }));
    
    const state = api.persist(meldState({ name: '', age: 0, active: true }), 'my-key');
    
    expect(state.name).toBe('Alice');
    expect(state.age).toBe(30);
    expect(state.active).toBe(true);

    state.age = 31;
    meld.flush();
    expect(JSON.parse(localStorage.getItem('my-key'))).toEqual({ name: 'Alice', age: 31, active: true });
  });
});

describe('MeldBroadcast Plugin', () => {
  it('synchronizes state updates across instances via BroadcastChannel', async () => {
    const mockChannelInstanceList = [];
    global.BroadcastChannel = class {
      constructor(name) {
        this.name = name;
        this.onmessage = null;
        mockChannelInstanceList.push(this);
      }
      postMessage(data) {
        mockChannelInstanceList.forEach(bc => {
          if (bc !== this && bc.name === this.name && bc.onmessage) {
            bc.onmessage({ data });
          }
        });
      }
      close() {}
    };

    MeldBroadcast.install(api);

    const storeA = meldState({ title: 'Task A', order: 1 });
    const storeB = meldState({ title: 'Task B', order: 2 });

    api.useBroadcast('channel-name', storeA, ['title']);
    api.useBroadcast('channel-name', storeB, ['title']);

    // Wait for initial sync postMessages to clear out and set isReceiving false
    await tick();

    storeA.title = 'Title Updated';
    await tick();

    expect(storeB.title).toBe('Title Updated');

    delete global.BroadcastChannel;
  });
});

describe('MeldCookie Plugin', () => {
  it('reads and writes reactive browser cookies', () => {
    MeldCookie.install(api);

    const { get, set, remove } = api.cookie;

    set('user', 'bob', 1);
    expect(document.cookie).toContain('user=bob');

    expect(get('user')).toBe('bob');

    remove('user');
    expect(get('user')).toBeNull();
  });
});

describe('MeldForms Plugin', () => {
  it('manages form state fields and processes standard validations', () => {
    MeldForms.install(api);

    const { useForm } = MeldForms.setupHelpers(api);
    const { fields, errors, validate, handleSubmit } = useForm(
      { title: '', description: 'A' },
      { title: ['required'] }
    );

    expect(validate()).toBe(false);
    expect(errors.title).toBe('Required');

    fields.title = 'Clean Code';
    expect(validate()).toBe(true);
    expect(errors.title).toBeUndefined();

    const onSubmit = jest.fn();
    const submitHandler = handleSubmit(onSubmit);
    
    const dummyEvent = { preventDefault: jest.fn() };
    submitHandler(dummyEvent);

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Clean Code', description: 'A' });
    expect(dummyEvent.preventDefault).toHaveBeenCalled();
  });
});

describe('MeldHead Plugin', () => {
  it('mutates head meta elements dynamically', () => {
    MeldHead.install(api);

    api.useHead(() => ({
      title: 'Meld Dashboard',
      meta: [
        { name: 'description', content: 'Super fast planning dashboard' },
        { name: 'theme-color', content: '#0f766e' }
      ]
    }));

    expect(document.title).toBe('Meld Dashboard');
    expect(document.querySelector('meta[name="description"]').getAttribute('content')).toBe('Super fast planning dashboard');
    expect(document.querySelector('meta[name="theme-color"]').getAttribute('content')).toBe('#0f766e');
  });
});

describe('MeldTime Plugin', () => {
  it('formats dates in relative and short layouts', async () => {
    MeldTime.install(api);

    // date 10 minutes ago
    const tenMinutesAgo = new Date(Date.now() - 600000).toISOString();
    const relativeFragment = meldHtml`<meld-time date="${tenMinutesAgo}" format="relative"></meld-time>`;
    document.body.appendChild(relativeFragment);
    await tick();

    const relativeEl = document.body.querySelector('meld-time');
    expect(relativeEl).not.toBeNull();
    expect(relativeEl.shadowRoot.textContent.trim()).toContain('10m ago');

    // Clear and do short layout
    document.body.innerHTML = '';
    const specificDate = '2026-07-09';
    const shortFragment = meldHtml`<meld-time date="${specificDate}" format="short"></meld-time>`;
    document.body.appendChild(shortFragment);
    await tick();

    const shortEl = document.body.querySelector('meld-time');
    expect(shortEl).not.toBeNull();
    expect(['7/9/2026', '7/9/26']).toContain(shortEl.shadowRoot.textContent.trim());
  });
});

describe('MeldLazy Plugin', () => {
  it('lazily mounts elements upon intersecting viewports', async () => {
    let mockCallback = null;
    global.IntersectionObserver = class {
      constructor(cb) {
        mockCallback = cb;
      }
      observe() {}
      disconnect() {}
    };

    MeldLazy.install(api);

    defineMeld('lazy-child', () => meldHtml`<span>Loaded child</span>`);
    
    const container = document.createElement('div');
    container.innerHTML = '<meld-lazy src="./meld-versioning.js" tag="lazy-child"><span slot="loading">Wait...</span></meld-lazy>';
    document.body.appendChild(container);
    await tick();
    
    const element = container.querySelector('meld-lazy');
    expect(element.shadowRoot.textContent).toContain('Wait...');

    mockCallback([{ isIntersecting: true }]);
    
    // Allow dynamic import statement to execute and update state loaded
    await tick();
    await tick();

    expect(element.shadowRoot.querySelector('lazy-child')).not.toBeNull();
    
    delete global.IntersectionObserver;
  });
});

describe('MeldDownload Plugin', () => {
  it('generates files for triggers', () => {
    MeldDownload.install(api);

    const { download } = MeldDownload.setupHelpers(api);

    // Create a real HTMLAnchorElement node so JSDOM validates appendChild
    const originalCreate = document.createElement;
    const mockAnchor = originalCreate.call(document, 'a');
    mockAnchor.click = jest.fn();

    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor;
      return originalCreate.call(document, tag);
    });

    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
    global.URL.revokeObjectURL = jest.fn();

    download('{"a": 1}', 'data.json', 'application/json');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockAnchor.href).toBe('blob:url');
    expect(mockAnchor.download).toBe('data.json');

    document.createElement = originalCreate;
    jest.restoreAllMocks();
  });
});

describe('MeldUpload Plugin', () => {
  it('registers and emits file-selected events on file drops', async () => {
    MeldUpload.install(api);

    let emittedFile = null;
    const element = document.createElement('meld-upload');
    element.addEventListener('file-selected', (e) => {
      emittedFile = e.detail;
    });
    document.body.appendChild(element);
    await tick();

    const zone = element.shadowRoot.querySelector('div');
    expect(zone).not.toBeNull();

    // Simulate drop event
    const file = new Blob(['{"name": "test"}'], { type: 'application/json' });
    const dropEvent = new CustomEvent('drop', { bubbles: true });
    dropEvent.preventDefault = jest.fn();
    dropEvent.dataTransfer = { files: [file] };

    zone.dispatchEvent(dropEvent);

    expect(emittedFile).toBe(file);
    expect(dropEvent.preventDefault).toHaveBeenCalled();
  });
});

describe('MeldMotion Plugin', () => {
  it('toggles visibility and transition classes of child components', async () => {
    MeldMotion.install(api);

    const container = document.createElement('div');
    container.innerHTML = `
      <meld-transition name="fade" show="true">
        <div id="inner">Content</div>
      </meld-transition>
    `;
    document.body.appendChild(container);
    await tick();

    const transitionEl = container.querySelector('meld-transition');
    expect(transitionEl).not.toBeNull();

    const innerNode = transitionEl.shadowRoot.querySelector('#inner');
    expect(innerNode).not.toBeNull();

    transitionEl.setAttribute('show', 'false');
    await tick();

    expect(innerNode.classList.contains('fade-leave-active')).toBe(true);

    const endEvent = new CustomEvent('transitionend', { bubbles: true });
    innerNode.dispatchEvent(endEvent);
    await tick();

    expect(transitionEl.firstElementChild).toBeNull();
  });
});

describe('MeldHotkeys Plugin', () => {
  it('binds keydown handlers reactively and cleans them up on destroy', () => {
    let destroyCallback;
    const mockApi = {
      onDestroy: (cb) => { destroyCallback = cb; }
    };

    MeldHotkeys.install(mockApi);
    expect(mockApi.useHotkeys).toBeDefined();

    const saveHandler = jest.fn();
    const escapeHandler = jest.fn();
    
    const target = document.createElement('div');
    mockApi.useHotkeys({
      'ctrl+s': saveHandler,
      'escape': escapeHandler
    }, target);

    const ctrlSEvent = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true
    });
    ctrlSEvent.preventDefault = jest.fn();
    target.dispatchEvent(ctrlSEvent);

    expect(saveHandler).toHaveBeenCalled();
    expect(ctrlSEvent.preventDefault).toHaveBeenCalled();

    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true
    });
    target.dispatchEvent(escEvent);

    expect(escapeHandler).toHaveBeenCalled();

    destroyCallback();

    saveHandler.mockClear();
    target.dispatchEvent(ctrlSEvent);
    expect(saveHandler).not.toHaveBeenCalled();
  });
  
  it('provides helper exports in setupHelpers', () => {
    const mockApi = {
      onDestroy: jest.fn()
    };
    MeldHotkeys.install(mockApi);
    const helpers = MeldHotkeys.setupHelpers(mockApi);
    expect(helpers.useHotkeys).toBe(mockApi.useHotkeys);
  });

  it('blocks character hotkeys when focused on inputs', () => {
    const mockApi = {
      onDestroy: jest.fn()
    };
    MeldHotkeys.install(mockApi);

    const inputHandler = jest.fn();
    const target = document.createElement('div');
    mockApi.useHotkeys({
      'n': inputHandler
    }, target);

    const input = document.createElement('input');
    target.appendChild(input);
    document.body.appendChild(target);
    input.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      bubbles: true
    });
    input.dispatchEvent(event);

    expect(inputHandler).not.toHaveBeenCalled();

    document.body.removeChild(target);
  });
});

describe('MeldDiagnostics Plugin', () => {
  it('transparently monitors component setups, mount times, active instances, and error reporting', async () => {
    const originalDefineMeld = api.defineMeld;
    
    MeldDiagnostics.install(api);
    expect(api.getDiagnosticsReport).toBeDefined();

    const mountFn = jest.fn();
    const cleanupFn = jest.fn();

    api.defineMeld('m-test-diag', (el) => {
      el.mountHooks.push(mountFn);
      el.destroyHooks.push(cleanupFn);
      return meldHtml`<div>Diag Test</div>`;
    });

    let report = api.getDiagnosticsReport();
    expect(report.components['m-test-diag']).toBeDefined();
    expect(report.components['m-test-diag'].totalCreated).toBe(0);

    const element = document.createElement('m-test-diag');
    document.body.appendChild(element);
    await tick();

    report = api.getDiagnosticsReport();
    expect(report.components['m-test-diag'].totalCreated).toBe(1);
    expect(report.components['m-test-diag'].activeCount).toBe(1);
    expect(report.totalActiveComponents).toBe(1);
    expect(mountFn).toHaveBeenCalled();

    document.body.removeChild(element);
    await tick();

    report = api.getDiagnosticsReport();
    expect(report.components['m-test-diag'].activeCount).toBe(0);
    expect(report.totalActiveComponents).toBe(0);
    expect(cleanupFn).toHaveBeenCalled();

    api.defineMeld('m-test-diag-err', () => {
      throw new Error('Diag test error');
    });

    const errorElement = document.createElement('m-test-diag-err');
    expect(() => {
      errorElement.connectedCallback();
    }).toThrow('Diag test error');

    report = api.getDiagnosticsReport();
    expect(report.components['m-test-diag-err'].errorCount).toBe(1);
    expect(report.components['m-test-diag-err'].errors[0].message).toBe('Diag test error');

    api.defineMeld = originalDefineMeld;
  });

  it('provides helpers via setupHelpers', () => {
    const helpers = MeldDiagnostics.setupHelpers(api);
    expect(helpers.getDiagnosticsReport).toBe(api.getDiagnosticsReport);
  });
});

describe('MeldRouter Plugin', () => {
  it('installs router state, provides router globally, and handles views', async () => {
    MeldRouter.install(api, {
      routes: [
        { path: '/', component: 'home-test' },
        { path: '/other', component: 'other-test' }
      ]
    });

    let homeInstantiated = false;
    api.defineMeld('home-test', () => {
      homeInstantiated = true;
      return meldHtml`<div>home</div>`;
    });

    let receivedRouter = null;
    api.defineMeld('child-router-test', (el, { inject }) => {
      receivedRouter = inject('router');
      return meldHtml`<div></div>`;
    });

    // Check custom element meld-view is registered
    expect(customElements.get('meld-view')).toBeDefined();

    // Verify context injection works globally
    const child = document.createElement('child-router-test');
    document.body.appendChild(child);
    await tick();

    expect(receivedRouter).toBeDefined();
    expect(receivedRouter.currentPath).toBe('/');
    expect(typeof receivedRouter.push).toBe('function');

    // Mount meld-view and test routing
    const view = document.createElement('meld-view');
    document.body.appendChild(view);
    await tick();

    expect(homeInstantiated).toBe(true);

    child.remove();
    view.remove();
  });
});

describe('MeldMarkdown Plugin', () => {
  it('renders compiled markdown to raw HTML reactively', async () => {
    MeldMarkdown.install(api);

    const el = document.createElement('meld-markdown');
    el.setAttribute('content', '# Hello **Meld**');
    document.body.appendChild(el);
    await tick();

    expect(el.shadowRoot.innerHTML).toContain('<h1>Hello <strong>Meld</strong></h1>');

    // Test property updates
    el.content = '## Subheading';
    await tick();
    expect(el.shadowRoot.innerHTML).toContain('<h2>Subheading</h2>');

    el.remove();
  });
});

describe('MeldToast Plugin', () => {
  it('correctly manages toast message queue and renders overlay', async () => {
    MeldToast.install(api);

    // Overlay is automatically mounted
    const overlay = document.querySelector('m-toast-overlay');
    expect(overlay).toBeDefined();

    toast.success('Task Created');
    await tick();

    // Verify toast overlay contains the toast message
    expect(overlay.shadowRoot.innerHTML).toContain('Task Created');
    expect(overlay.shadowRoot.innerHTML).toContain('toast-success');

    toast.error('Failed Action');
    toast.warning('Warning Action');
    toast.info('Info Action');
    await tick();
    expect(overlay.shadowRoot.innerHTML).toContain('Failed Action');
    expect(overlay.shadowRoot.innerHTML).toContain('toast-error');
    expect(overlay.shadowRoot.innerHTML).toContain('Warning Action');
    expect(overlay.shadowRoot.innerHTML).toContain('toast-warning');
    expect(overlay.shadowRoot.innerHTML).toContain('Info Action');
    expect(overlay.shadowRoot.innerHTML).toContain('toast-info');

    // Test context request
    let receivedToast = null;
    window.dispatchEvent(new CustomEvent('meld-context-request', {
      detail: { key: 'toast', callback: (val) => receivedToast = val },
      bubbles: true, composed: true
    }));
    expect(receivedToast).toBe(toast);

    // Test setupHelpers
    const helpers = MeldToast.setupHelpers(api);
    expect(helpers.toast).toBe(toast);

    // Test auto-dismissal with short duration
    toast.show('Dismiss Me', 'info', 1);
    meld.flush();
    expect(overlay.shadowRoot.innerHTML).toContain('Dismiss Me');
    await new Promise(resolve => setTimeout(resolve, 5));
    meld.flush();
    expect(overlay.shadowRoot.innerHTML).not.toContain('Dismiss Me');

    overlay.remove();
  });
});



