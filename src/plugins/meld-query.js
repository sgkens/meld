export const MeldQuery = {
  install(api) {
    api.useQuery = (urlOrFn, options = {}) => {
      const query = api.meldState({ data: null, loading: true, error: null });
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
  }
};
