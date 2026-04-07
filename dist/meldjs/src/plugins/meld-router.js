/**
 * @fileoverview Plugin for Client-Side Routing with View Transitions.
 * @plugin MeldRouter
 * @version 1.4.0
 */
export const MeldRouter = {
  install(api, options) {
    const { defineMeld, meldState, meldHtml, computed, provide } = api;
    const routes = options.routes || [];

    const routerState = meldState({
      currentPath: window.location.hash.slice(1) || '/'
    });

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
    const routerApi = { 
      get currentPath() { return routerState.currentPath; },
      get params() { return params(); },
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
