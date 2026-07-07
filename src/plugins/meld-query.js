/**
 * MeldQuery plugin object.
 * Integrates reactive data fetching capabilities (loading/data/error states + refetching) into Meld.
 * 
 * @type {object}
 * @property {function} install - Installs data querying helpers on the Meld API.
 * @property {function} setupHelpers - Sets up helpers for use in components.
 */
export const MeldQuery = {
  /**
   * Installs the query manager on the API object.
   * Registers the `api.useQuery` helper method.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Reactively executes and manages a fetch query.
     * 
     * @param {string|(function(): string)} urlOrFn - The target URL string or a function returning the URL.
     * @param {RequestInit} [options={}] - Standard fetch RequestInit configurations.
     * @returns {object} Reactive query state object.
     * @returns {any|null} returns.data - The parsed JSON response data.
     * @returns {boolean} returns.loading - Whether the request is currently active.
     * @returns {string|null} returns.error - The error message if the fetch failed.
     * @returns {function(): Promise<void>} returns.refetch - Triggers manually refetching the query.
     */
    api.useQuery = (urlOrFn, options = {}) => {
      const query = api.meldState({ data: null, loading: true, error: null });

      /**
       * Executes the fetch operation and updates query states.
       * 
       * @returns {Promise<void>} Resolves when the query completion updates state.
       */
      const execute = async () => {
        query.loading = true; query.error = null;
        try {
          const url = typeof urlOrFn === 'function' ? urlOrFn() : urlOrFn;
          const res = await fetch(url, options);
          if (!res.ok) throw new Error(res.statusText);
          query.data = await res.json();
        } catch (err) { query.error = err.message; } 
        finally { query.loading = false; }
      };
      execute();
      query.refetch = execute;
      return query;
    };
  },
  /**
   * Sets up helpers for components by returning an object containing `useQuery`.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {object} Object containing the query helper.
   * @returns {function} returns.useQuery - The useQuery helper function.
   */
  setupHelpers(api) {
    return { useQuery: api.useQuery };
  }
};
