/**
 * MeldVersioning plugin object.
 * Setup hook helper for component version mapping on mount.
 * 
 * @type {object}
 * @property {function} install - Installs version tagger on the Meld instance.
 */
export const MeldVersioning = {
  /**
   * Installs the versioning tagging helper on the API object.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    api.onMount(() => {
      // Automatic version tagging
      const _version = '1.4.0';
      // In real build, this would be injected
    });
  }
};
