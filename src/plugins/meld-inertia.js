/**
 * MeldInertia plugin object.
 * Integrates Inertia.js client-side page routing and rendering by dynamically resolving page components.
 * 
 * @type {object}
 * @property {function} install - Installs Inertia components and app setup routines.
 */
export const MeldInertia = {
  /**
   * Installs the Inertia page wrapper component.
   * Defines `<inertia-root>` custom element to hook into `@inertiajs/core`.
   * 
   * @param {object} api - The Meld API instance.
   * @param {object} _options - Plugin configuration options.
   * @returns {void}
   */
  install(api, _options) {
    const { defineMeld, meldHtml, meldState, onMount } = api;

    defineMeld('inertia-root', (_el) => {
      const state = meldState({ componentTag: null, props: {} });
      onMount(async () => {
        const { createInertiaApp } = await import('https://esm.sh/@inertiajs/core@1.0.14');
        createInertiaApp({
          resolve: name => import(`./Pages/${name}.js`),
          setup({ el: _rootEl, App, props }) {
            state.componentTag = App.default; 
            state.props = props;
          },
        });
      });
      return meldHtml`
        <div id="inertia-page">
          ${() => state.componentTag 
            ? (() => {
                const page = document.createElement(state.componentTag);
                Object.keys(state.props).forEach(key => {
                  const val = state.props[key];
                  if (typeof val === 'string') page.setAttribute(key, val);
                  else page[key] = val;
                });
                return page;
              })()
            : "Loading..."
          }
        </div>
      `;
    });
  }
};
