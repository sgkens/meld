/**
 * MeldQuiver plugin object.
 * Provides a lightweight REST API client (Quiver client) wrapper over fetch with a predefined base URL.
 * 
 * @type {object}
 * @property {function} install - Installs Quiver HTTP client helpers on the Meld API.
 */
export const MeldQuiver = {
  /**
   * Installs the Quiver HTTP client helper on the API object.
   * Registers the `api.useQuiver` helper method.
   * 
   * @param {object} api - The Meld API instance.
   * @param {object} [options={}] - Plugin options.
   * @param {string} [options.baseURL=''] - The base URL prefix for request endpoints.
   * @returns {void}
   */
  install(api, options = {}) {
    const baseURL = options.baseURL || '';

    /**
     * Executes a fetch request prefixed with the configured baseURL.
     * 
     * @param {string} url - The target endpoint URL.
     * @param {RequestInit} [requestOptions={}] - Additional fetch options.
     * @returns {Promise<any>} The parsed JSON response.
     * @throws {Error} If response is not ok.
     */
    const request = async (url, requestOptions = {}) => {
      const response = await fetch(baseURL + url, requestOptions);
      if (!response.ok) throw new Error(response.statusText || `HTTP ${response.status}`);
      return response.json();
    };

    /**
     * Instantiates a scoped Quiver API client containing HTTP methods (get, post).
     * 
     * @returns {object} Scoped HTTP request helpers.
     * @returns {function(string): Promise<any>} returns.get - Performs a GET request.
     * @returns {function(string, any): Promise<any>} returns.post - Performs a JSON POST request.
     */
    api.useQuiver = () => ({
      /**
       * Performs a GET request to the specified endpoint relative to baseURL.
       * 
       * @param {string} url - Target URL endpoint.
       * @returns {Promise<any>} Response JSON content.
       */
      get: (url) => request(url),
      /**
       * Performs a POST request with JSON body payload.
       * 
       * @param {string} url - Target URL endpoint.
       * @param {any} body - Payload to stringify and send.
       * @returns {Promise<any>} Response JSON content.
       */
      post: (url, body) => request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    });
  }
};
