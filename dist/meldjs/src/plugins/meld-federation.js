export const MeldFederation = {
  install(api, options) {
    const remotes = options.remotes || {};
    const mapEl = document.createElement('script');
    mapEl.type = "importmap";
    mapEl.textContent = JSON.stringify({ imports: remotes });
    document.head.appendChild(mapEl);
    api.importRemote = async (alias) => {
      try {
        const module = await import(alias);
        return module.default ? module.default : module;
      } catch (e) {
        console.error(`[Meld Federation] Failed to load remote: ${alias}`, e);
        return null;
      }
    };
  }
};
