/**
 * @fileoverview Plugin for Client-Side Routing with View Transitions.
 * @plugin MeldRouter
 * @version 1.4.0
 */

/**
 * MeldRouter plugin object.
 * Implements client-side hash routing, reactive active route views, route parameters parsing,
 * global routing context provision, and support for the View Transitions API.
 * 
 * @type {object}
 * @property {function} install - Installs routing capabilities and <meld-view> custom element.
 */
export const MeldRouter = {
  /**
   * Installs hash routing and configures routes on the API object.
   * Defines `<meld-view>` and provides `router` globally.
   * 
   * @param {object} api - The Meld API instance.
   * @param {object} options - Configuration options.
   * @param {Array<{path: string, component: string}>} [options.routes=[]] - List of route configurations.
   * @returns {void}
   */
  install(api, options) {
    const { defineMeld, meldState, meldHtml, computed, provide } = api;
    const routes = options.routes || [];

    const routerState = meldState({
      currentPath: window.location.hash.slice(1) || '/'
    });

    /**
     * Internal listener to update routing state on hash change.
     * Integrates View Transitions API if supported by the browser.
     * 
     * @returns {void}
     */
    const updateRoute = () => {
      const newPath = window.location.hash.slice(1) || '/';
      
      // v1.4 Feature: View Transitions
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          routerState.currentPath = newPath;
        });
      } else {
        routerState.currentPath = newPath;
      }
    };

    window.addEventListener('hashchange', updateRoute);

    const params = computed(() => {
      const match = routes.find(r => {
        if (r.path.includes(':')) {
           const parts = r.path.split('/');
           const currParts = routerState.currentPath.split('/');
           if (parts.length !== currParts.length) return false;
           return parts.every((p, i) => p.startsWith(':') || p === currParts[i]);
        }
        return r.path === routerState.currentPath;
      });
      if (!match || !match.path.includes(':')) return {};
      const parts = match.path.split('/');
      const currParts = routerState.currentPath.split('/');
      const p = {};
      parts.forEach((part, i) => {
        if (part.startsWith(':')) p[part.slice(1)] = currParts[i];
      });
      return p;
    });

    defineMeld('meld-view', () => {
      const activeComponentTag = computed(() => {
        const match = routes.find(r => {
          if (r.path.includes(':')) {
             const parts = r.path.split('/');
             const currParts = routerState.currentPath.split('/');
             if (parts.length !== currParts.length) return false;
             return parts.every((p, i) => p.startsWith(':') || p === currParts[i]);
          }
          return r.path === routerState.currentPath;
        });
        return match ? match.component : null;
      });

      return meldHtml`
        <div class="router-container" style="height: 100%;">
          ${() => {
            const tag = activeComponentTag();
            if (!tag) return document.createTextNode("404 - Not Found");
            const el = document.createElement(tag);
            const p = params();
            Object.assign(el, { params: p });
            return el;
          }}
        </div>
      `;
    });

    // Provide globally if needed, or to document.body, but for now we'll just mock it if it's meant to be global.
    // Expose router state globally or via context
    
    /**
     * Global router API controller.
     * 
     * @type {object}
     * @property {string} currentPath - Gets the active location hash path.
     * @property {object} params - Gets parsed dynamic route parameters.
     * @property {function(string): void} push - Navigates to a new hash path.
     */
    const routerApi = { 
      get currentPath() { return routerState.currentPath; },
      get params() { return params(); },
      /**
       * Updates the window location hash to trigger routing.
       * 
       * @param {string} path - The target route path (e.g. `/home`).
       * @returns {void}
       */
      push: (path) => { window.location.hash = path; }
    };

    // Inject a special global provider if we are at root
    if (!document.querySelector('meld-view')) {
       // Naive global mock
     }

    provide('router', routerApi);
    
    // Also attach to window for deep debugging / global access in RC
    window.MeldRouter = routerApi;
  }
};
