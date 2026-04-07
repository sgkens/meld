export const MeldGrpc = {
  install(api) {
    api.useGrpc = (ClientClass, hostname) => {
      const client = new ClientClass(hostname);
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
