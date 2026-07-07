/**
 * MeldPersist plugin object.
 * Automatically synchronizes and dehydrates/rehydrates a reactive state object to/from web storage (localStorage or sessionStorage).
 * 
 * @type {object}
 * @property {function} install - Installs persistence helpers on the Meld API.
 * @property {function} setupHelpers - Sets up helpers for use in components.
 */
export const MeldPersist = {
  /**
   * Installs the state persistence helper on the API object.
   * Registers the `api.persist` helper method.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Synchronizes a state object with a storage key.
     * Reactively writes updates to storage whenever state values change.
     * 
     * @param {object} state - The reactive state object to persist.
     * @param {string} key - The unique storage key.
     * @param {Storage} [storage=localStorage] - The web storage implementation (e.g. `localStorage` or `sessionStorage`).
     * @returns {object} The synchronized reactive state object.
     */
    api.persist = (state, key, storage = localStorage) => {
      const saved = storage.getItem(key);
      if (saved) {
        try { Object.assign(state, JSON.parse(saved)); } 
        catch (e) { console.error("MeldPersist Error", e); }
      }
      
      api.computed(() => {
        storage.setItem(key, JSON.stringify(state));
        return state;
      });
      return state;
    };
  },
  /**
   * Sets up helpers for components by returning an object containing `persist`.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {object} Object containing the persistence helper.
   * @returns {function} returns.persist - The persist helper function.
   */
  setupHelpers(api) {
    return { persist: api.persist };
  }
};
