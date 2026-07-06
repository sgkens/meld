// --------------------------------------------------------
//  MELD CORE (v1.4.0-rc1)
// --------------------------------------------------------

export const VERSION = '1.4.0-rc1';

let activeEffect = null;
const effectStack = [];
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
          } else if (attr.name.startsWith("on")) {
            const evt = attr.name.slice(2).toLowerCase();
            targetNode.removeEventListener(evt, value);
            targetNode.addEventListener(evt, value);
            targetNode.removeAttribute(attr.name);
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
          if (res && res.__raw) {
             start.data = "";
             const template = document.createElement('template');
             template.innerHTML = res.__raw;
             parent.insertBefore(template.content.cloneNode(true), end);
          } else if (res instanceof Node) {
             start.data = "";
             parent.insertBefore(res, end);
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

// 6. COMPONENT DEFINITION (Updated for v1.4 Hydration)
// --------------------------------------------------------
export function defineMeld(tagName, setupFn, options = {}) {
  if (customElements.get(tagName)) return;
  const observed = options.observedAttributes || [];
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

      const attrsObj = {};
      observed.forEach(attr => {
        attrsObj[attr] = this.getAttribute(attr);
      });
      this._meldAttrs = meldState(attrsObj);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue && this._meldAttrs) {
        this._meldAttrs[name] = newValue;
      }
    }

    connectedCallback() {
      if (globalStyles.length > 0) this.shadowRoot.adoptedStyleSheets = [...globalStyles];
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
        const template = setupFn(this, { emit, attrs: this._meldAttrs, ...extensionContext });
        if (template && !this._isHydrating) {
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
      this.effects.forEach(effect => cleanupEffect(effect));
      this.effects = [];
      this.destroyHooks.forEach(fn => fn());
    }
  });
}
