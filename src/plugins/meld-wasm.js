export const MeldWasm = {
  install(api) {
    api.useWasm = (url, importObject = {}) => {
      const state = api.meldState({ instance: null, exports: null, loading: true, error: null });
      const load = async () => {
        try {
          const response = await fetch(url);
          const { instance } = await WebAssembly.instantiateStreaming(response, importObject);
          state.instance = instance; state.exports = instance.exports;
        } catch (e) { state.error = e.message; } 
        finally { state.loading = false; }
      };
      load();
      return state;
    };
  }
};
