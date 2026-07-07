/**
 * MeldGrpc plugin object.
 * Integrates gRPC-Web clients into Meld with reactive request-state tracking.
 * 
 * @type {object}
 * @property {function} install - Installs gRPC client wrappers on the Meld API.
 */
export const MeldGrpc = {
  /**
   * Installs gRPC-Web helper on the API object.
   * Registers the `api.useGrpc` helper method.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Initializes a gRPC-Web client instance and exposes a reactive remote call helper.
     * 
     * @param {new (hostname: string) => any} ClientClass - The constructor for the gRPC client.
     * @param {string} hostname - The hostname/base URL for the gRPC endpoint.
     * @returns {object} gRPC wrapper object containing the client and call runner.
     * @returns {any} returns.client - The instantiated client class instance.
     * @returns {function(string, any, object=): object} returns.call - Helper to execute gRPC methods reactively.
     */
    api.useGrpc = (ClientClass, hostname) => {
      const client = new ClientClass(hostname);

      /**
       * Executes a gRPC request reactively, tracking loading state, error, and response.
       * 
       * @param {string} methodName - The name of the client method to invoke.
       * @param {any} requestMessage - The gRPC request message object.
       * @param {object} [metadata={}] - Key-value metadata headers for the request.
       * @returns {object} Reactive state representing the request status and result.
       * @returns {any|null} returns.response - The response object, or null if loading/failed.
       * @returns {boolean} returns.loading - Whether the call is currently loading.
       * @returns {string|null} returns.error - Error message if the call failed.
       */
      const call = (methodName, requestMessage, metadata = {}) => {
        const state = api.meldState({ response: null, loading: true, error: null });
        client[methodName](requestMessage, metadata, (err, response) => {
          state.loading = false;
          if (err) state.error = err.message;
          else state.response = response.toObject();
        });
        return state;
      };
      return { client, call };
    };
  }
};
