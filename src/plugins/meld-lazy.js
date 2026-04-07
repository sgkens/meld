export const MeldLazy = {
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
