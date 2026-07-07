/**
 * MeldLogger plugin object.
 * Provides namespaced console logging helpers.
 * 
 * @type {object}
 * @property {function} install - Installs logger helpers on the Meld API.
 * @property {function} setupHelpers - Sets up helpers for use in components.
 */
export const MeldLogger = {
  /**
   * Installs the namespaced log helper on the API object.
   * Registers the `api.useLog` helper method.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Scopes console logger functions to a specific namespace.
     * 
     * @param {string} namespace - The logger prefix name.
     * @returns {object} Namespaced logging methods (info, error, warn).
     * @returns {function(string, ...any=): void} returns.info - Info level logger.
     * @returns {function(string, ...any=): void} returns.error - Error level logger.
     * @returns {function(string, ...any=): void} returns.warn - Warning level logger.
     */
    api.useLog = (namespace) => ({
      info: (msg, ...args) => console.log(`[${namespace}] INFO:`, msg, ...args),
      error: (msg, ...args) => console.error(`[${namespace}] ERROR:`, msg, ...args),
      warn: (msg, ...args) => console.warn(`[${namespace}] WARN:`, msg, ...args)
    });
  },
  /**
   * Sets up helpers for components by returning an object containing `useLog`.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {object} Object containing the namespace logger helper.
   * @returns {function} returns.useLog - The useLog helper function.
   */
  setupHelpers(api) {
    return { useLog: api.useLog };
  }
};
