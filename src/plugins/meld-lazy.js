/**
 * MeldLazy plugin object.
 * Provides lazy-loading component capabilities using the Intersection Observer API.
 * 
 * @type {object}
 * @property {function} install - Installs `<meld-lazy>` custom element wrappers on the Meld instance.
 */
export const MeldLazy = {
  /**
   * Installs the lazy-loading component container.
   * Defines `<meld-lazy>` custom element that dynamically loads modules when they intersect the viewport.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    const { defineMeld, meldHtml, meldState, onMount, onDestroy } = api;

    defineMeld('meld-lazy', (el) => {
      const state = meldState({ loaded: false });
      let observer;
      onMount(() => {
        observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            import(el.getAttribute('src')).then(() => state.loaded = true);
            observer.disconnect();
          }
        });
        observer.observe(el);
      });
      onDestroy(() => observer && observer.disconnect());

      return meldHtml`
        <div>${() => state.loaded 
          ? document.createElement(el.getAttribute('tag')) 
          : (el.querySelector('[slot="loading"]') || "Loading...")}
        </div>`;
    });
  }
};
