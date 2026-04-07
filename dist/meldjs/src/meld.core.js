// --------------------------------------------------------
// 🔗 MELD CORE (v1.4.0-rc1)
// --------------------------------------------------------

export const VERSION = '1.4.0-rc1';

let activeEffect = null;
let currentComponent = null;
let globalStyles = []; // Store for adopted stylesheets
const installedPlugins = new Set();
const extensionContext = {};

// 1. REACTIVITY ENGINE
// --------------------------------------------------------
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
          [...deps.get(prop)].forEach(effect => effect.run());
        }
      }
      return true;
    }
  });
}

function createEffect(fn) {
  const effect = {
    run: () => {
      cleanupEffect(effect);
      activeEffect = effect;
      fn();
      activeEffect = null;
    },
    deps: new Set()
  };
  effect.run();
  if (currentComponent) currentComponent.effects.push(effect);
}

function cleanupEffect(effect) {
  effect.deps.forEach(depSet => depSet.delete(effect));
  effect.deps.clear();
}

// 2. UTILITIES & HELPERS
// --------------------------------------------------------
export const computed = (getterFn) => {
  const internal = meldState({ value: null });
  createEffect(() => internal.value = getterFn());
  return () => internal.value;
};

export const meld = {
  theme: (cssString) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssString);
    globalStyles.push(sheet);
  },
  raw: (html) => ({ __raw: html }),
  css: (obj) => Object.entries(obj).filter(([,v]) => v).map(([k]) => k).join(" "),
  style: (obj) => Object.entries(obj).map(([k,v]) => `${k}:${v}`).join(";"),
  list: (arr, keyFn, renderFn) => {
    let nodeCache = new Map(); 
    return () => {
      const frag = document.createDocumentFragment();
      const nextCache = new Map();
      const items = typeof arr === 'function' ? arr() : arr;
      items.forEach((item, i) => {
        const key = keyFn ? keyFn(item) : i;
        if (nodeCache.has(key)) {
          const node = nodeCache.get(key);
          frag.appendChild(node);
          nextCache.set(key, node);
        } else {
          const res = renderFn(item, i);
          const node = res instanceof Node ? res : document.createTextNode(String(res));
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
export function onMount(fn) {
  if (currentComponent) currentComponent.mountHooks.push(fn);
}
export function onDestroy(fn) {
  if (currentComponent) currentComponent.destroyHooks.push(fn);
}
export function provide(key, value) {
  if (currentComponent) {
    if (!currentComponent._meldContext) currentComponent._meldContext = new Map();
    currentComponent._meldContext.set(key, value);
  }
}
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

// 5. THE RENDERER
// --------------------------------------------------------
export function meldHtml(strings, ...values) {
  const markers = values.map((_, i) => `__meld_${i}__`);
  const htmlString = strings.reduce((acc, str, i) => acc + str + (markers[i] || ''), '');
  const template = document.createElement("template");
  template.innerHTML = htmlString;
  const fragment = template.content.cloneNode(true);

  const walk = (node) => {
    if (node.nodeType === 1) { 
      [...node.attributes].forEach(attr => {
        if (attr.value.startsWith("__meld_")) {
          const idx = parseInt(attr.value.replace("__meld_", "").replace("__", ""));
          const value = values[idx];

          if (attr.name === "ref") {
            if (typeof value === "function") value(node);
            node.removeAttribute("ref");
          } else if (attr.name.startsWith("on")) {
            const evt = attr.name.slice(2).toLowerCase();
            node.removeEventListener(evt, value);
            node.addEventListener(evt, value);
            node.removeAttribute(attr.name);
          } else {
            if (typeof value === "function") {
              createEffect(() => {
                 const res = value();
                 if (res === false || res === null || res === undefined) node.removeAttribute(attr.name);
                 else if (res === true) node.setAttribute(attr.name, "");
                 else node.setAttribute(attr.name, res);
              });
            } else {
              node.setAttribute(attr.name, value);
            }
          }
        }
      });
    }

    if (node.nodeType === 3 && node.nodeValue.includes("__meld_")) {
      const idx = parseInt(node.nodeValue.replace("__meld_", "").replace("__", ""));
      const value = values[idx];
      const parent = node.parentNode;

      if (typeof value === "function") {
        const anchor = document.createTextNode("");
        parent.replaceChild(anchor, node);
        createEffect(() => {
          const res = value();
          if (res && res.__raw) {
             const tempDiv = document.createElement('div');
             tempDiv.innerHTML = res.__raw;
             parent.innerHTML = '';
             while(tempDiv.firstChild) parent.appendChild(tempDiv.firstChild);
          } else if (res instanceof Node) {
             if (parent.replaceChildren) parent.replaceChildren(res);
             else { parent.innerHTML = ''; parent.appendChild(res); }
          } else {
             anchor.data = res;
          }
        });
      } else {
        node.nodeValue = value;
      }
    }
    let child = node.firstChild;
    while (child) {
      walk(child);
      child = child.nextSibling;
    }
  };
  walk(fragment);
  return fragment;
}

// 6. COMPONENT DEFINITION (Updated for v1.4 Hydration)
// --------------------------------------------------------
export function defineMeld(tagName, setupFn) {
  customElements.define(tagName, class extends HTMLElement {
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
    }

    connectedCallback() {
      if (globalStyles.length > 0) this.shadowRoot.adoptedStyleSheets = [...globalStyles];
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

      const template = setupFn(this, { emit, ...extensionContext });
      if (template) {
        if (this._isHydrating) {
          this.shadowRoot.innerHTML = ''; 
          this._isHydrating = false;
        }
        this.shadowRoot.appendChild(template);
      }
      this.mountHooks.forEach(fn => fn());
      currentComponent = null;
    }

    disconnectedCallback() {
      this.effects.forEach(effect => cleanupEffect(effect));
      this.effects = [];
      this.destroyHooks.forEach(fn => fn());
    }
  });
}
