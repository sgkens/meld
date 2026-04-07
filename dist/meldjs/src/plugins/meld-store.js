export const MeldStore = {
  install(api) {
    api.createStore = (init) => api.meldState(init);
  }
};
