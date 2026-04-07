export const MeldPersist = {
  install(api) {
    api.persist = (state, key, storage = localStorage) => {
      const saved = storage.getItem(key);
      if (saved) {
        try { Object.assign(state, JSON.parse(saved)); } 
        catch (e) { console.error("MeldPersist Error", e); }
      }
      
      api.computed(() => {
        storage.setItem(key, JSON.stringify(state));
        return state;
      });
      return state;
    };
  }
};
