/**
 * MeldFederation plugin object.
 * Configures dynamic native ES module importmaps for micro-frontend federation and remote loading.
 * 
 * @type {object}
 * @property {function} install - Installs federation remote loader on the Meld API.
 */
export const MeldFederation = {
  /**
   * Installs the importmap and dynamic federation helpers on the API object.
   * Registers the `api.importRemote` helper method.
   * 
   * @param {object} api - The Meld API instance.
   * @param {object} options - Configuration options for federation.
   * @param {Object<string, string>} [options.remotes={}] - Mapping of remote module aliases to their respective URLs.
   * @returns {void}
   */
  install(api, options) {
    const remotes = options.remotes || {};
    const mapEl = document.createElement('script');
    mapEl.type = "importmap";
    mapEl.textContent = JSON.stringify({ imports: remotes });
    document.head.appendChild(mapEl);

    /**
     * Dynamically imports a federated remote module by its alias.
     * Fallbacks to returning the whole module if default export is not present.
     * 
     * @param {string} alias - The configured alias/import name for the remote module.
     * @returns {Promise<any|null>} The imported module, its default export, or null if loading fails.
     */
    api.importRemote = async (alias) => {
      try {
        const module = await import(alias);
        return module.default ? module.default : module;
      } catch (e) {
        console.error(`[Meld Federation] Failed to load remote: ${alias}`, e);
        return null;
      }
    };
  }
};
