export const MeldWasm = {
  install(api) {
    api.useWasm = (url, importObject = {}) => {
      const state = api.meldState({ instance: null, exports: null, loading: true, error: null });
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
