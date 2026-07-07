import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { computed, defineMeld, meld, meldHtml, meldState } from '../src/meld.core.js';
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
    expect(document.body.querySelector('i').textContent).toBe('C');
    expect(document.body.querySelector('span').textContent).toBe('B');

    state.right = 'D';
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
