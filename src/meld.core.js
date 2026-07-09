// --------------------------------------------------------
//  MELD CORE (v1.4.0)
// --------------------------------------------------------

export const VERSION = '1.4.0';

let activeEffect = null;
const effectStack = [];
let currentComponent = null;
let globalStyles = []; // Store for adopted stylesheets
const installedPlugins = new Set();
const extensionContext = {};

const effectQueue = new Set();
let pendingTick = false;

function flushEffects() {
  pendingTick = false;
  const queue = Array.from(effectQueue);
  effectQueue.clear();
  queue.forEach(effect => {
    if (effect.active) {
      effect.run();
    }
  });
}

function queueEffect(effect) {
  effectQueue.add(effect);
  if (!pendingTick) {
    pendingTick = true;
    Promise.resolve().then(flushEffects);
  }
}

// 1. REACTIVITY ENGINE
// --------------------------------------------------------
/**
 * Creates a reactive state proxy wrapper around an object.
 * Reads during active effects will register dependencies, and writes will trigger effect re-runs.
 * 
 * @template T
 * @param {T} initialObj - The initial state object to make reactive.
 * @returns {T} The reactive proxy state object.
 */
export function meldState(initialObj) {
  const deps = new Map();
  return new Proxy(initialObj, {
    get(target, prop) {
      if (activeEffect) {
        if (!deps.has(prop)) deps.set(prop, new Set());
        const depSet = deps.get(prop);
        depSet.add(activeEffect);
        activeEffect.deps.add(depSet);
      }
      return target[prop];
    },
    set(target, prop, value) {
      if (target[prop] !== value) {
        target[prop] = value;
        if (deps.has(prop)) {
          [...deps.get(prop)].forEach(effect => {
            queueEffect(effect);
          });
        }
      }
      return true;
    }
  });
}

function createEffect(fn) {
  const effect = {
    active: true,
    run: () => {
      if (!effect.active) return;
      cleanupEffect(effect);
      effectStack.push(effect);
      activeEffect = effect;
      try {
        fn();
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1] || null;
      }
    },
    deps: new Set()
  };
  effect.run();
  if (currentComponent) currentComponent.effects.push(effect);
}

function cleanupEffect(effect) {
  effect.deps.forEach(depSet => depSet.delete(effect));
  effect.deps.clear();
  effectQueue.delete(effect);
}

// 2. UTILITIES & HELPERS
// --------------------------------------------------------
/**
 * Creates a read-only computed reactive getter.
 * The getter caches the returned value and only updates when dependencies inside it change.
 * 
 * @template T
 * @param {function(): T} getterFn - The function that calculates the computed value.
 * @returns {function(): T} A getter function returning the calculated value.
 */
export const computed = (getterFn) => {
  const internal = meldState({ value: null });
  createEffect(() => internal.value = getterFn());
  return () => {
    meld.flush();
    return internal.value;
  };
};

/**
 * Core utility namespaces and functions for the Meld engine.
 * @type {object}
 */
export const meld = {
  /**
   * Synchronously flushes any pending reactive effect updates.
   * 
   * @returns {void}
   */
  flush: () => {
    if (pendingTick) {
      flushEffects();
    }
  },
  /**
   * Registers a global CSS style sheet to be adopted by all subsequently connected Meld components.
   * 
   * @param {string} cssString - The CSS stylesheet string.
   * @returns {void}
   */
  theme: (cssString) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssString);
    globalStyles.push(sheet);
  },
  /**
   * Wraps an HTML string to mark it as raw/unsafe HTML for bypassing escaping during rendering.
   * 
   * @param {string} html - The raw HTML string.
   * @returns {{__raw: string}} The wrapped raw HTML object.
   */
  raw: (html) => ({ __raw: html }),
  /**
   * Helper utility to convert a class object configuration into a space-separated class string.
   * 
   * @param {Record<string, boolean>} obj - Key-value map where key is class name, value is condition.
   * @returns {string} Space-separated class list string.
   */
  css: (obj) => Object.entries(obj).filter(([,v]) => v).map(([k]) => k).join(" "),
  /**
   * Helper utility to serialize an inline style object configuration into a valid style string.
   * 
   * @param {Record<string, string|number>} obj - Key-value map of CSS properties and values.
   * @returns {string} Semicolon-separated style string.
   */
  style: (obj) => Object.entries(obj).map(([k,v]) => `${k}:${v}`).join(";"),
  /**
   * Creates a reactive list reconciliation helper.
   * Reconciles DOM nodes in-place efficiently using unique keys.
   * 
   * @template T
   * @param {T[]|function(): T[]} arr - An array of items or a reactive function returning an array.
   * @param {function(T): any} keyFn - Function returning a unique key identifier for each item.
   * @param {function(T, number): (Node|DocumentFragment|string|number)} renderFn - Function rendering each item to DOM.
   * @param {function(Node, T, number): void} [updateFn] - Optional function called when a node is created or reused to update its properties/state.
   * @returns {function(): DocumentFragment} A function that evaluates list changes and returns a reconciled DocumentFragment.
   */
  list: (arr, keyFn, renderFn, updateFn) => {
    let nodeCache = new Map(); 
    return () => {
      const frag = document.createDocumentFragment();
      const nextCache = new Map();
      const rawItems = typeof arr === 'function' ? arr() : arr;
      const items = Array.isArray(rawItems) ? rawItems : [];
      items.forEach((item, i) => {
        const key = keyFn ? keyFn(item) : i;
        if (nodeCache.has(key)) {
          const node = nodeCache.get(key);
          if (updateFn) updateFn(node, item, i);
          frag.appendChild(node);
          nextCache.set(key, node);
        } else {
          const res = renderFn(item, i);
          const node = res instanceof DocumentFragment
            ? (res.firstElementChild || res.firstChild || res)
            : (res instanceof Node ? res : document.createTextNode(String(res)));
          if (updateFn) updateFn(node, item, i);
          frag.appendChild(node);
          nextCache.set(key, node);
        }
      });
      nodeCache = nextCache;
      return frag;
    };
  }
};

// 3. PLUGIN SYSTEM
// --------------------------------------------------------
/**
 * Installs a plugin into the Meld framework.
 * 
 * @param {object} plugin - The plugin module containing an install method.
 * @param {function(object, object): void} plugin.install - The install function called with Meld API and options.
 * @param {function(object, object): object} [plugin.setupHelpers] - Optional method to return helper functions registered globally on setup.
 * @param {object} [options={}] - Options passed directly to the plugin during installation.
 * @returns {void}
 */
export function use(plugin, options = {}) {
  if (installedPlugins.has(plugin)) return;
  const api = { 
    defineMeld, meldState, meldHtml, computed, 
    provide, inject, onMount, onDestroy, meld 
  };
  plugin.install(api, options);
  if (plugin.setupHelpers) {
    Object.assign(extensionContext, plugin.setupHelpers(api, options));
  }
  installedPlugins.add(plugin);
}

// 4. LIFECYCLE & CONTEXT
// --------------------------------------------------------
/**
 * Registers a mount lifecycle hook that executes when the current component connects to the DOM.
 * Must be called synchronously during component setup function.
 * 
 * @param {function(): void} fn - The callback to run when the component is mounted.
 * @returns {void}
 */
export function onMount(fn) {
  if (currentComponent) currentComponent.mountHooks.push(fn);
}
/**
 * Registers a destroy lifecycle hook that executes when the current component is permanently disconnected.
 * Must be called synchronously during component setup function.
 * 
 * @param {function(): void} fn - The callback to run when the component is destroyed.
 * @returns {void}
 */
export function onDestroy(fn) {
  if (currentComponent) currentComponent.destroyHooks.push(fn);
}
/**
 * Provides a context value to all child elements nested under the current component.
 * Must be called synchronously during component setup function.
 * 
 * @param {any} key - The context identifier.
 * @param {any} value - The context value to provide.
 * @returns {void}
 */
export function provide(key, value) {
  if (currentComponent) {
    if (!currentComponent._meldContext) currentComponent._meldContext = new Map();
    currentComponent._meldContext.set(key, value);
  }
}
/**
 * Injects a context value provided by an ancestor component.
 * Must be called synchronously during component setup function.
 * 
 * @template T
 * @param {any} key - The context identifier.
 * @param {T} [defaultValue=null] - Fallback value if context key is not provided.
 * @returns {T} The injected context value or defaultValue.
 */
export function inject(key, defaultValue = null) {
  if (!currentComponent) return defaultValue;
  let result = defaultValue;
  const event = new CustomEvent('meld-context-request', {
    detail: { key, callback: (val) => result = val },
    bubbles: true, composed: true, cancelable: true
  });
  currentComponent.dispatchEvent(event);
  return result;
}

/**
 * Tagged template literal function for rendering HTML templates.
 * Binds reactivity, event listeners, references, properties, and dynamic elements.
 * 
 * @param {string[]} strings - Raw template HTML strings.
 * @param {...any} values - Reactive getters, raw values, event handlers, or nested nodes.
 * @returns {DocumentFragment} The hydrated DocumentFragment ready for DOM insertion.
 */
export function meldHtml(strings, ...values) {
  const markers = values.map((_, i) => `__meld_${i}__`);
  const htmlString = strings.reduce((acc, str, i) => acc + str + (markers[i] || ''), '');
  const template = document.createElement("template");
  template.innerHTML = htmlString;
  const fragment = template.content.cloneNode(true);

  const hydrationNode = currentComponent && currentComponent._isHydrating ? currentComponent._hydrationTarget : null;

  const walk = (node, hydNode) => {
    const targetNode = hydNode || node;

    if (node.nodeType === 1) { 
      [...node.attributes].forEach(attr => {
        if (attr.value.startsWith("__meld_")) {
          const idx = parseInt(attr.value.replace("__meld_", "").replace("__", ""));
          const value = values[idx];

          if (attr.name === "ref") {
            if (typeof value === "function") value(targetNode);
            targetNode.removeAttribute("ref");
          } else if (attr.name.startsWith(".")) {
            const rawProp = attr.name.slice(1);
            // Search prototype and instance keys for a case-insensitive match (recovering camelCase properties lost to browser lowercasing)
            const protoKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(targetNode) || {});
            const instanceKeys = Object.keys(targetNode);
            const matchedKey = [...protoKeys, ...instanceKeys].find(k => k.toLowerCase() === rawProp.toLowerCase());
            
            const propName = matchedKey || rawProp.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            
            if (typeof value === "function") {
              createEffect(() => {
                targetNode[propName] = value();
              });
            } else {
              targetNode[propName] = value;
            }
            targetNode.removeAttribute(attr.name);
          } else if (attr.name.startsWith("on")) {
            const evt = attr.name.slice(2).toLowerCase();
            targetNode.removeEventListener(evt, value);
            targetNode.addEventListener(evt, value);
            targetNode.removeAttribute(attr.name);
          } else if (attr.name === "style") {
            if (typeof value === "function") {
              let prevStyleObj = {};
              createEffect(() => {
                const res = value();
                if (typeof res === "object" && res !== null) {
                  Object.keys(prevStyleObj).forEach(key => {
                    if (!(key in res)) {
                      if (key.startsWith("--")) {
                        targetNode.style.removeProperty(key);
                      } else {
                        targetNode.style[key] = "";
                      }
                    }
                  });
                  Object.keys(res).forEach(key => {
                    if (res[key] !== prevStyleObj[key]) {
                      const val = res[key] == null ? "" : res[key];
                      if (key.startsWith("--")) {
                        targetNode.style.setProperty(key, val);
                      } else {
                        targetNode.style[key] = val;
                      }
                    }
                  });
                  prevStyleObj = { ...res };
                } else {
                  targetNode.setAttribute("style", res || "");
                  prevStyleObj = {};
                }
              });
            } else if (typeof value === "object" && value !== null) {
              Object.keys(value).forEach(key => {
                const val = value[key] == null ? "" : value[key];
                if (key.startsWith("--")) {
                  targetNode.style.setProperty(key, val);
                } else {
                  targetNode.style[key] = val;
                }
              });
            } else {
              targetNode.setAttribute("style", value || "");
            }
          } else {
            if (typeof value === "function") {
              createEffect(() => {
                 const res = value();
                 if (res === false || res === null || res === undefined) targetNode.removeAttribute(attr.name);
                 else if (res === true) targetNode.setAttribute(attr.name, "");
                 else targetNode.setAttribute(attr.name, res);
              });
            } else {
              targetNode.setAttribute(attr.name, value);
            }
          }
        }
      });
    }

    if (node.nodeType === 3 && node.nodeValue.includes("__meld_")) {
      const idx = parseInt(node.nodeValue.replace("__meld_", "").replace("__", ""));
      const value = values[idx];
      const parent = targetNode.parentNode;

      if (typeof value === "function") {
        const start = document.createTextNode("");
        const end = document.createTextNode("");
        parent.replaceChild(end, targetNode);
        parent.insertBefore(start, end);

        const clearDynamicNodes = () => {
          let current = start.nextSibling;
          while (current && current !== end) {
            const next = current.nextSibling;
            current.remove();
            current = next;
          }
        };

        createEffect(() => {
          const res = value();
          clearDynamicNodes();
          const actualParent = start.parentNode || parent;
          if (!actualParent) return;
          if (res && res.__raw) {
             start.data = "";
             const template = document.createElement('template');
             template.innerHTML = res.__raw;
             actualParent.insertBefore(template.content.cloneNode(true), end);
          } else if (res instanceof Node) {
             start.data = "";
             actualParent.insertBefore(res, end);
          } else {
             start.data = res == null ? "" : String(res);
          }
        });
      } else {
        targetNode.nodeValue = value;
      }
    }
    let child = node.firstChild;
    let hydChild = hydNode ? hydNode.firstChild : null;
    while (child) {
      const next = child.nextSibling;
      const hydNext = hydChild ? hydChild.nextSibling : null;
      walk(child, hydChild);
      child = next;
      hydChild = hydNext;
    }
  };
  walk(fragment, hydrationNode);
  return fragment;
}

/**
 * Registers a custom custom element (Meld component) with the browser's Custom Element Registry.
 * Handles component instantiation, shadow DOM attachment, attribute changes, hydration, and lifecycles.
 * 
 * @param {string} tagName - The custom element tag name (must contain a hyphen).
 * @param {function(HTMLElement, object): DocumentFragment|string|number|void} setupFn - Setup function running when connected. Returns template.
 * @param {object} [options={}] - Custom element configuration options.
 * @param {string[]} [options.observedAttributes] - Array of attribute names to observe for reactive updates.
 * @param {string[]} [options.properties] - Array of property names to expose as reactive properties on the element.
 * @returns {void}
 */
export function defineMeld(tagName, setupFn, options = {}) {
  if (customElements.get(tagName)) return;
  const observed = options.observedAttributes || [];
  const propsList = options.properties || [];
  customElements.define(tagName, class extends HTMLElement {
    static get observedAttributes() {
      return observed;
    }

    constructor() {
      super();
      // v1.4 Change: Check if Declarative Shadow DOM exists
      if (this.shadowRoot) {
        // Hydration Mode: Destructive Hydration for v1.4
        this._isHydrating = true;
      } else {
        this.attachShadow({ mode: "open" });
      }
      this.mountHooks = [];
      this.destroyHooks = [];
      this.effects = [];
      this._initialized = false;

      const attrsObj = {};
      observed.forEach(attr => {
        attrsObj[attr] = this.getAttribute(attr);
      });
      this._meldAttrs = meldState(attrsObj);

      const propsObj = {};
      propsList.forEach(prop => {
        propsObj[prop] = undefined;
      });
      this._meldProps = meldState(propsObj);

      propsList.forEach(prop => {
        const preUpgradeVal = this[prop];
        if (preUpgradeVal !== undefined) {
          delete this[prop];
        }
        Object.defineProperty(this, prop, {
          get() {
            return this._meldProps[prop];
          },
          set(val) {
            this._meldProps[prop] = val;
          },
          configurable: true,
          enumerable: true
        });
        if (preUpgradeVal !== undefined) {
          this._meldProps[prop] = preUpgradeVal;
        }
      });
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue && this._meldAttrs) {
        this._meldAttrs[name] = newValue;
      }
    }

    connectedCallback() {
      if (globalStyles.length > 0) this.shadowRoot.adoptedStyleSheets = [...globalStyles];
      if (this._initialized) return;
      this._initialized = true;

      const previousComponent = currentComponent;
      currentComponent = this;
      
      this.addEventListener('meld-context-request', (e) => {
        const key = e.detail.key;
        if (this._meldContext && this._meldContext.has(key)) {
          e.detail.callback(this._meldContext.get(key));
          e.stopPropagation();
        }
      });

      const emit = (name, detail) => {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
      };

      try {
        if (this._isHydrating) {
          this._hydrationTarget = this.shadowRoot;
        }
        const template = setupFn(this, { emit, inject, provide, attrs: this._meldAttrs, props: this._meldProps, ...extensionContext });
        if (template && !this._isHydrating) {
          this.shadowRoot.innerHTML = '';
          this.shadowRoot.appendChild(template);
        }
        this._isHydrating = false;
        this._hydrationTarget = null;
        this.mountHooks.forEach(fn => fn());
      } finally {
        currentComponent = previousComponent;
      }
    }

    disconnectedCallback() {
      Promise.resolve().then(() => {
        if (!this.isConnected) {
          this.effects.forEach(effect => {
            effect.active = false;
            cleanupEffect(effect);
          });
          this.effects = [];
          this.destroyHooks.forEach(fn => fn());
          this._initialized = false;
        }
      });
    }
  });
}
