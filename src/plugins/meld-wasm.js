/**
 * MeldWasm plugin object.
 * Integrates WebAssembly instances dynamically with reactive load-state tracking.
 * 
 * @type {object}
 * @property {function} install - Installs WebAssembly loader on the Meld API.
 */
export const MeldWasm = {
  /**
   * Installs WebAssembly loader helper on the API object.
   * Registers the `api.useWasm` helper method.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Reactively loads and instantiates a WebAssembly module from a URL.
     * Uses instantiateStreaming if available, falling back to standard instantiate buffer.
     * 
     * @param {string} url - The URL endpoint of the WASM binary.
     * @param {object} [importObject={}] - The WebAssembly imports mapping object.
     * @returns {object} Reactive state of the WebAssembly loading process and instance.
     * @returns {WebAssembly.Instance|null} returns.instance - The WebAssembly Instance if loaded, otherwise null.
     * @returns {object|null} returns.exports - The WebAssembly exports object if loaded, otherwise null.
     * @returns {boolean} returns.loading - Whether the WebAssembly is loading.
     * @returns {string|null} returns.error - The error message if loading/instantiating failed.
     */
    api.useWasm = (url, importObject = {}) => {
      const state = api.meldState({ instance: null, exports: null, loading: true, error: null });

      /**
       * Dynamically fetches and instantiates the WASM binary.
       * 
       * @returns {Promise<void>} Resolves when module load completes or fails.
       */
      const load = async () => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(response.statusText || `HTTP ${response.status}`);
          const canStream = typeof WebAssembly.instantiateStreaming === 'function';
          const result = canStream
            ? await WebAssembly.instantiateStreaming(response, importObject)
            : await WebAssembly.instantiate(await response.arrayBuffer(), importObject);
          const { instance } = result;
          state.instance = instance; state.exports = instance.exports;
        } catch (e) { state.error = e.message; } 
        finally { state.loading = false; }
      };
      load();
      return state;
    };
  }
};
