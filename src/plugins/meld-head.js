/**
 * MeldHead plugin object.
 * Reactively manages document head tags (title, meta, open graph) based on component state.
 * 
 * @type {object}
 * @property {function} install - Installs head-managing helper on the Meld API.
 */
export const MeldHead = {
  /**
   * Installs the document head helper on the API object.
   * Registers the `api.useHead` helper method.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Reactively computes and updates the document title and meta elements in the head.
     * 
     * @param {function(): { title?: string, meta?: Array<{ name?: string, property?: string, content: string }> }} factoryFn - 
     *   Function returning document metadata properties.
     * @returns {void}
     */
    api.useHead = (factoryFn) => {
      api.computed(() => {
        const { title, meta = [] } = factoryFn();
        if (title) document.title = title;
        meta.forEach(m => {
          let el = document.querySelector(`meta[name="${m.name}"], meta[property="${m.property}"]`);
          if (!el) {
            el = document.createElement('meta');
            if (m.name) el.setAttribute('name', m.name);
            if (m.property) el.setAttribute('property', m.property);
            document.head.appendChild(el);
          }
          el.setAttribute('content', m.content);
        });
      });
    };
  }
};
