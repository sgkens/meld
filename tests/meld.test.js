import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { computed, defineMeld, meld, meldHtml, meldState, onDestroy, provide, inject, use, effect } from '../src/meld.core.js';
import { MeldA11y } from '../src/plugins/meld-a11y.js';
import { MeldAI } from '../src/plugins/meld-ai.js';
import { MeldPortal } from '../src/plugins/meld-portal.js';
import { MeldQuery } from '../src/plugins/meld-query.js';
import { MeldQuiver } from '../src/plugins/meld-quiver.js';
import { MeldWasm } from '../src/plugins/meld-wasm.js';
import { MeldRouter } from '../src/plugins/meld-router.js';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

beforeEach(() => {
  document.body.innerHTML = '';
  jest.restoreAllMocks();
});

describe('Meld Core Reactivity', () => {
  it('triggers computed updates when state changes', () => {
    const state = meldState({ count: 0 });
    const double = computed(() => state.count * 2);

    expect(double()).toBe(0);
    state.count++;
    expect(double()).toBe(2);
  });

  it('restores parent dependency tracking after nested effects', () => {
    const state = meldState({ outer: 1, inner: 2 });
    const result = computed(() => {
      const nested = computed(() => state.inner * 2);
      return nested() + state.outer;
    });

    expect(result()).toBe(5);
    state.outer = 10;
    expect(result()).toBe(14);
  });
});

describe('Meld Core Rendering', () => {
  it('updates raw dynamic content without removing sibling bindings', () => {
    const state = meldState({ left: '<b>A</b>', right: 'B' });
    const fragment = meldHtml`<p>${() => meld.raw(state.left)}<span>${() => state.right}</span></p>`;
    document.body.appendChild(fragment);

    expect(document.body.querySelector('b').textContent).toBe('A');
    expect(document.body.querySelector('span').textContent).toBe('B');

    state.left = '<i>C</i>';
    meld.flush();
    expect(document.body.querySelector('i').textContent).toBe('C');
    expect(document.body.querySelector('span').textContent).toBe('B');

    state.right = 'D';
    meld.flush();
    expect(document.body.querySelector('i').textContent).toBe('C');
    expect(document.body.querySelector('span').textContent).toBe('D');
  });

  it('updates Node dynamic content without replacing the parent element', () => {
    const state = meldState({ tag: 'strong' });
    const fragment = meldHtml`<section><em>before</em>${() => document.createElement(state.tag)}<em>after</em></section>`;
    document.body.appendChild(fragment);

    expect(document.body.querySelector('section').children[0].tagName).toBe('EM');
    expect(document.body.querySelector('section').children[1].tagName).toBe('STRONG');
    expect(document.body.querySelector('section').children[2].tagName).toBe('EM');

    state.tag = 'small';
    meld.flush();
    expect(document.body.querySelector('section').children[0].tagName).toBe('EM');
    expect(document.body.querySelector('section').children[1].tagName).toBe('SMALL');
    expect(document.body.querySelector('section').children[2].tagName).toBe('EM');
  });

  it('ignores duplicate component definitions', () => {
    const tagName = `m-test-${Date.now()}`;
    defineMeld(tagName, () => meldHtml`<span>one</span>`);

    expect(() => defineMeld(tagName, () => meldHtml`<span>two</span>`)).not.toThrow();
  });

  it('updates reactive attributes dynamically', async () => {
    const tagName = `m-test-attrs-${Date.now()}`;
    defineMeld(tagName, (el, { attrs }) => {
      return meldHtml`<div>Label: <span>${() => attrs.label || 'none'}</span></div>`;
    }, { observedAttributes: ['label'] });

    const element = document.createElement(tagName);
    document.body.appendChild(element);

    expect(element.shadowRoot.textContent).toContain('Label: none');

    element.setAttribute('label', 'hello');
    await tick();
    expect(element.shadowRoot.textContent).toContain('Label: hello');

    element.setAttribute('label', 'world');
    await tick();
    expect(element.shadowRoot.textContent).toContain('Label: world');
  });

  it('hydrates pre-rendered Declarative Shadow DOM non-destructively', async () => {
    const tagName = `m-test-hydrate-${Date.now()}`;
    
    // 1. Create element BEFORE defining it (so it is not upgraded yet)
    const element = document.createElement(tagName);
    element.setAttribute('label', 'Pre-rendered Label');
    
    // 2. Attach shadow root manually to simulate Declarative Shadow DOM
    const shadow = element.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<div>Label: <span>Pre-rendered Label</span></div>';

    const preSpan = shadow.querySelector('span');
    expect(shadow.innerHTML).toBe('<div>Label: <span>Pre-rendered Label</span></div>');

    // 3. Define the component now
    defineMeld(tagName, (el, { attrs }) => {
      return meldHtml`<div>Label: <span>${() => attrs.label || 'none'}</span></div>`;
    }, { observedAttributes: ['label'] });

    // 4. Upgrade the element
    customElements.upgrade(element);

    // 5. Connect to DOM
    document.body.appendChild(element);

    // Should NOT wipe out the shadowRoot, maintaining DOM node identity!
    const postSpan = shadow.querySelector('span');
    expect(postSpan).toBe(preSpan);
    expect(shadow.innerHTML).toBe('<div>Label: <span>Pre-rendered Label</span></div>');

    // Should bind reactivity and update the same node in-place
    element.setAttribute('label', 'hydrated-and-updated');
    await tick();
    expect(shadow.querySelector('span')).toBe(preSpan);
    expect(shadow.innerHTML).toBe('<div>Label: <span>hydrated-and-updated</span></div>');
  });

  it('handles element disconnect and reconnect (moving) without duplicating content or breaking reactivity', async () => {
    const tagName = `m-test-move-${Date.now()}`;
    let setupCount = 0;
    
    defineMeld(tagName, (el, { attrs }) => {
      setupCount++;
      return meldHtml`<div>Count: <span>${() => attrs.val}</span></div>`;
    }, { observedAttributes: ['val'] });

    const parent1 = document.createElement('div');
    const parent2 = document.createElement('div');
    document.body.appendChild(parent1);
    document.body.appendChild(parent2);

    const element = document.createElement(tagName);
    element.setAttribute('val', '10');
    parent1.appendChild(element);
    await tick();

    // Verify initial setup
    expect(setupCount).toBe(1);
    expect(element.shadowRoot.querySelectorAll('div').length).toBe(1);
    expect(element.shadowRoot.querySelector('span').textContent).toBe('10');

    // Move element to parent2 (disconnects and reconnects in same tick)
    parent2.appendChild(element);
    await tick();

    // Verify it was NOT re-initialized, did NOT duplicate, and kept reactivity
    expect(setupCount).toBe(1); // setupFn should not run again
    expect(element.shadowRoot.querySelectorAll('div').length).toBe(1); // no duplicate templates
    
    // Verify it still responds to attribute updates
    element.setAttribute('val', '20');
    await tick();
    expect(element.shadowRoot.querySelector('span').textContent).toBe('20');

    // Remove element permanently, wait for microtask cleanup
    element.remove();
    await tick();

    // Re-append element, it should now re-initialize as it was permanently destroyed
    parent1.appendChild(element);
    await tick();
    expect(setupCount).toBe(2);
    expect(element.shadowRoot.querySelectorAll('div').length).toBe(1); // old template cleared before appending new one
  });

  it('meld.list defaults gracefully to an empty array when given null, undefined, or invalid array data', () => {
    const listFn = meld.list(null, (x) => x, (x) => meldHtml`<li>${x}</li>`);
    const fragment1 = listFn();
    expect(fragment1.childNodes.length).toBe(0);

    const listFn2 = meld.list(undefined, (x) => x, (x) => meldHtml`<li>${x}</li>`);
    const fragment2 = listFn2();
    expect(fragment2.childNodes.length).toBe(0);

    const listFn3 = meld.list('invalid', (x) => x, (x) => meldHtml`<li>${x}</li>`);
    const fragment3 = listFn3();
    expect(fragment3.childNodes.length).toBe(0);
  });

  it('supports reactive properties option in defineMeld', async () => {
    const tagName = `m-test-props-${Date.now()}`;
    defineMeld(tagName, (el, { props }) => {
      return meldHtml`<div>Value: <span>${() => props.val || 'empty'}</span></div>`;
    }, { properties: ['val'] });

    const element = document.createElement(tagName);
    document.body.appendChild(element);

    expect(element.shadowRoot.textContent).toContain('Value: empty');

    element.val = 'prop-updated';
    await tick();
    expect(element.shadowRoot.textContent).toContain('Value: prop-updated');
    expect(element.val).toBe('prop-updated');
  });

  it('supports optional updateFn in meld.list', () => {
    const items = [{ id: 1, text: 'A' }];
    const updateFn = jest.fn((node, item) => {
      node.textContent = item.text;
    });
    
    const listFn = meld.list(items, (x) => x.id, (x) => document.createElement('div'), updateFn);
    const fragment = listFn();
    expect(fragment.childNodes.length).toBe(1);
    expect(fragment.childNodes[0].textContent).toBe('A');
    expect(updateFn).toHaveBeenCalledTimes(1);

    // Reuse node in list and verify updateFn is called on update
    items[0].text = 'B';
    const fragment2 = listFn();
    expect(fragment2.childNodes.length).toBe(1);
    expect(fragment2.childNodes[0].textContent).toBe('B');
    expect(updateFn).toHaveBeenCalledTimes(2);
  });
});

describe('Meld Plugins', () => {
  it('does not trap focus when no focusable elements exist', () => {
    const api = {};
    MeldA11y.install(api);
    const el = document.createElement('div');
    document.body.appendChild(el);

    api.trapFocus(el);
    expect(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))).not.toThrow();
  });

  it('wraps focus and returns a focus-trap cleanup function', () => {
    const api = {};
    MeldA11y.install(api);
    const el = document.createElement('div');
    el.innerHTML = '<button id="first"></button><button id="last"></button>';
    document.body.appendChild(el);

    const cleanup = api.trapFocus(el);
    el.querySelector('#last').focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    el.dispatchEvent(event);

    expect(document.activeElement).toBe(el.querySelector('#first'));
    cleanup();
  });

  it('removes portal body nodes on component disconnect', () => {
    MeldPortal.install({ defineMeld, meldHtml, onDestroy: (fn) => fn && window.__portalDestroyHooks.push(fn) });
    window.__portalDestroyHooks = [];

    const portal = document.createElement('meld-portal');
    document.body.appendChild(portal);
    const teleported = document.body.querySelector('body > div');

    expect(teleported).not.toBeNull();
    portal.remove();
    window.__portalDestroyHooks.forEach(fn => fn());
    expect(document.body.contains(teleported)).toBe(false);
    delete window.__portalDestroyHooks;
  });

  it('stores query errors from non-ok responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' });
    const api = { meldState };
    MeldQuery.install(api);

    const query = api.useQuery('/api');
    await tick();

    expect(query.loading).toBe(false);
    expect(query.error).toBe('Server Error');
  });

  it('stores AI errors from non-ok streaming responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429, statusText: 'Too Many Requests', body: null });
    const api = { meldState };
    MeldAI.install(api);

    const ai = api.useAI('/ai');
    await ai.prompt('test');

    expect(ai.isLoading).toBe(false);
    expect(ai.error).toBe('Too Many Requests');
  });

  it('throws quiver errors for non-ok responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' });
    const api = {};
    MeldQuiver.install(api, { baseURL: '/base' });

    await expect(api.useQuiver().get('/missing')).rejects.toThrow('Not Found');
  });

  it('stores wasm load errors from non-ok responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'Missing' });
    const api = { meldState };
    MeldWasm.install(api);

    const wasm = api.useWasm('/module.wasm');
    await tick();

    expect(wasm.loading).toBe(false);
    expect(wasm.error).toBe('Missing');
  });

  it('navigates between client-side routes and extracts parameters', async () => {
    defineMeld('m-home', () => meldHtml`<div id="home">Welcome Home</div>`);
    defineMeld('m-user', (el) => {
      const userId = el.params ? el.params.id : 'unknown';
      return meldHtml`<div id="user">User Profile: <span>${userId}</span></div>`;
    });

    const api = { defineMeld, meldState, meldHtml, computed, provide: () => {} };
    MeldRouter.install(api, {
      routes: [
        { path: '/', component: 'm-home' },
        { path: '/user/:id', component: 'm-user' }
      ]
    });

    const view = document.createElement('meld-view');
    document.body.appendChild(view);

    window.location.hash = '#/';
    await tick();
    const homeEl = view.shadowRoot.querySelector('m-home');
    expect(homeEl).not.toBeNull();
    expect(homeEl.shadowRoot.querySelector('#home')).not.toBeNull();
    expect(homeEl.shadowRoot.querySelector('#home').textContent).toBe('Welcome Home');

    window.location.hash = '#/user/42';
    await tick();
    const userEl = view.shadowRoot.querySelector('m-user');
    expect(userEl).not.toBeNull();
    expect(userEl.shadowRoot.querySelector('#user')).not.toBeNull();
    expect(userEl.shadowRoot.querySelector('#user').textContent).toBe('User Profile: 42');
  });
});

describe('Meld Core Hardening Matrix', () => {
  it('cleans up old dependencies in computed getters', () => {
    const state = meldState({ flag: true, a: 1, b: 2 });
    let count = 0;
    const val = computed(() => {
      count++;
      return state.flag ? state.a : state.b;
    });

    expect(val()).toBe(1);
    expect(count).toBe(1);

    state.a = 10;
    expect(val()).toBe(10);
    expect(count).toBe(2);

    state.flag = false;
    expect(val()).toBe(2);
    expect(count).toBe(3);

    state.a = 20;
    expect(val()).toBe(2);
    expect(count).toBe(3);
  });

  it('prevents reactivity triggers on no-op same-value sets', () => {
    const state = meldState({ count: 0 });
    let triggerCount = 0;
    
    const double = computed(() => {
      state.count;
      triggerCount++;
      return state.count * 2;
    });

    expect(double()).toBe(0);
    expect(triggerCount).toBe(1);

    state.count = 0;
    expect(double()).toBe(0);
    expect(triggerCount).toBe(1);

    state.count = 1;
    expect(double()).toBe(2);
    expect(triggerCount).toBe(2);
  });

  it('runs onDestroy hooks when elements disconnect permanently', async () => {
    const tagName = `m-test-destroy-${Date.now()}`;
    let destroyedCount = 0;
    
    defineMeld(tagName, () => {
      onDestroy(() => {
        destroyedCount++;
      });
      return meldHtml`<div>component</div>`;
    });

    const element = document.createElement(tagName);
    document.body.appendChild(element);
    await tick();

    expect(destroyedCount).toBe(0);

    element.remove();
    await tick();

    expect(destroyedCount).toBe(1);
  });

  it('bubbles context request to resolve provide/inject values', async () => {
    const parentTag = `m-parent-${Date.now()}`;
    const childTag = `m-child-${Date.now()}`;

    defineMeld(parentTag, () => {
      provide('message', 'hello-world');
      return meldHtml`<div><slot></slot></div>`;
    });

    let receivedMessage = '';
    defineMeld(childTag, () => {
      receivedMessage = inject('message', 'fallback');
      return meldHtml`<span>child</span>`;
    });

    const parentEl = document.createElement(parentTag);
    const childEl = document.createElement(childTag);
    parentEl.appendChild(childEl);
    document.body.appendChild(parentEl);
    await tick();

    expect(receivedMessage).toBe('hello-world');
  });

  it('adopts global stylesheets on connected elements shadowRoot', async () => {
    const originalCSSStyleSheet = global.CSSStyleSheet;
    // Always override CSSStyleSheet during the test to avoid JSDOM stubs failing on replaceSync
    global.CSSStyleSheet = class {
      constructor() {
        this.cssRules = [];
      }
      replaceSync(css) {
        this.cssRules = [{ cssText: css }];
      }
    };

    const tagName = `m-test-theme-${Date.now()}`;
    defineMeld(tagName, () => meldHtml`<p>styled text</p>`);

    meld.theme('p { color: red; }');

    const element = document.createElement(tagName);
    document.body.appendChild(element);
    await tick();

    expect(element.shadowRoot.adoptedStyleSheets.length).toBeGreaterThan(0);
    const sheet = element.shadowRoot.adoptedStyleSheets[element.shadowRoot.adoptedStyleSheets.length - 1];
    expect(sheet.cssRules[0].cssText).toBe('p { color: red; }');

    if (originalCSSStyleSheet) {
      global.CSSStyleSheet = originalCSSStyleSheet;
    } else {
      delete global.CSSStyleSheet;
    }
  });

  it('supports high-performance style object diffing and custom properties', async () => {
    const state = meldState({
      styleObj: { color: 'red', '--primary-var': '10px' }
    });

    const fragment = meldHtml`<div id="styled" style="${() => state.styleObj}"></div>`;
    document.body.appendChild(fragment);
    await tick();

    const el = document.getElementById('styled');
    expect(el.style.color).toBe('red');
    expect(el.style.getPropertyValue('--primary-var')).toBe('10px');

    // Update style property and add a new one, remove '--primary-var'
    state.styleObj = { color: 'blue', display: 'flex' };
    await tick();

    expect(el.style.color).toBe('blue');
    expect(el.style.display).toBe('flex');
    expect(el.style.getPropertyValue('--primary-var')).toBe('');

    // Remove a standard style property (covers line 308)
    state.styleObj = { display: 'block' };
    await tick();
    expect(el.style.color).toBe('');
    expect(el.style.display).toBe('block');

    // Static object test
    const staticFragment = meldHtml`<div id="static-style" style="${{ color: 'green', '--static-var': '20px' }}"></div>`;
    document.body.appendChild(staticFragment);
    const staticEl = document.getElementById('static-style');
    expect(staticEl.style.color).toBe('green');
    expect(staticEl.style.getPropertyValue('--static-var')).toBe('20px');

    // Static string style binding (covers line 338 fallback)
    const staticStrFragment = meldHtml`<div id="static-str" style="${'color: teal;'}"></div>`;
    document.body.appendChild(staticStrFragment);
    expect(document.getElementById('static-str').style.color).toBe('teal');

    // String fallback test
    state.styleObj = 'color: purple; margin: 5px;';
    await tick();
    expect(el.style.color).toBe('purple');
    expect(el.style.margin).toBe('5px');
  });

  it('updates dynamic reactive attributes (boolean and string)', async () => {
    const state = meldState({ active: true, title: 'hello' });
    const fragment = meldHtml`<div id="reactive-attr" disabled="${() => state.active}" title="${() => state.title}"></div>`;
    document.body.appendChild(fragment);
    await tick();

    const el = document.getElementById('reactive-attr');
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.getAttribute('title')).toBe('hello');

    state.active = false;
    state.title = null;
    await tick();

    expect(el.hasAttribute('disabled')).toBe(false);
    expect(el.hasAttribute('title')).toBe(false);
  });

  it('ignores duplicate plugin installations and registers setupHelpers', () => {
    const dummyPlugin = {
      install: jest.fn(),
      setupHelpers: jest.fn().mockReturnValue({ myGlobalHelper: () => 'hello' })
    };
    use(dummyPlugin);
    use(dummyPlugin);
    expect(dummyPlugin.install).toHaveBeenCalledTimes(1);
    expect(dummyPlugin.setupHelpers).toHaveBeenCalledTimes(1);
  });

  it('provides static css and style serialization helpers', () => {
    expect(meld.css({ active: true, hidden: false, primary: true })).toBe('active primary');
    expect(meld.style({ color: 'red', display: 'block' })).toBe('color:red;display:block');
  });

  it('supports dynamic property bindings with dot prefix in templates', async () => {
    if (!customElements.get('m-test-dot-binding')) {
      defineMeld('m-test-dot-binding', (el, { props }) => {
        return meldHtml`<span>${() => props.val || 'empty'}</span>`;
      }, { properties: ['val'] });
    }

    const state = meldState({ value: 'hello' });
    const fragment = meldHtml`<m-test-dot-binding .val="${() => state.value}"></m-test-dot-binding>`;
    document.body.appendChild(fragment);
    await tick();

    const element = document.body.querySelector('m-test-dot-binding');
    expect(element.val).toBe('hello');
    expect(element.shadowRoot.textContent).toBe('hello');

    // Test static property value setting (covers line 289)
    const staticFragment = meldHtml`<m-test-dot-binding .val="${'world'}"></m-test-dot-binding>`;
    document.body.appendChild(staticFragment);
    await tick();

    const staticElement = document.body.querySelectorAll('m-test-dot-binding')[1];
    expect(staticElement.val).toBe('world');
  });

  it('batches reactive updates in microtasks and supports manual flushing', async () => {
    const state = meldState({ count: 0 });
    let triggerCount = 0;

    const double = computed(() => {
      triggerCount++;
      return state.count * 2;
    });

    expect(double()).toBe(0);
    expect(triggerCount).toBe(1);

    state.count = 1;
    state.count = 2;
    state.count = 3;

    expect(triggerCount).toBe(1);

    meld.flush();
    expect(triggerCount).toBe(2);

    state.count = 4;
    state.count = 5;
    expect(triggerCount).toBe(2);

    await tick();
    expect(triggerCount).toBe(3);
  });

  it('passes inject and provide in the setup function context argument', async () => {
    const tagName = `m-ctx-args-${Date.now()}`;
    let passedInject = null;
    let passedProvide = null;

    defineMeld(tagName, (el, { inject, provide }) => {
      passedInject = inject;
      passedProvide = provide;
      return meldHtml`<div></div>`;
    });

    const el = document.createElement(tagName);
    document.body.appendChild(el);
    await tick();

    expect(typeof passedInject).toBe('function');
    expect(typeof passedProvide).toBe('function');
    expect(passedInject).toBe(inject);
    expect(passedProvide).toBe(provide);

    el.remove();
  });

  it('provides public effect function that runs immediately and reactively updates on state change', async () => {
    const state = meldState({ count: 0 });
    let runCount = 0;
    let valueSeen = -1;

    effect(() => {
      runCount++;
      valueSeen = state.count;
    });

    expect(runCount).toBe(1);
    expect(valueSeen).toBe(0);

    state.count = 5;
    meld.flush();

    expect(runCount).toBe(2);
    expect(valueSeen).toBe(5);
  });

  it('passes effect in the setup function context argument', async () => {
    const tagName = `m-effect-ctx-${Date.now()}`;
    let passedEffect = null;

    defineMeld(tagName, (el, { effect: gotEffect }) => {
      passedEffect = gotEffect;
      return meldHtml`<div></div>`;
    });

    const el = document.createElement(tagName);
    document.body.appendChild(el);
    await tick();

    expect(typeof passedEffect).toBe('function');
    expect(passedEffect).toBe(effect);

    el.remove();
  });
});

