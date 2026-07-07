/**
 * MeldStore plugin object.
 * Provides a global reactive state store constructor (createStore).
 * 
 * @type {object}
 * @property {function} install - Installs store constructor on the Meld API.
 */
export const MeldStore = {
  /**
   * Installs the state store creator on the API object.
   * Registers the `api.createStore` helper method.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Creates a reactive state store initialized with the given state template.
     * 
     * @param {object} init - The initial key-value state template.
     * @returns {object} The created reactive state proxy object.
     */
    api.createStore = (init) => api.meldState(init);
  }
};
