export const MeldHead = {
  install(api) {
    api.useHead = (factoryFn) => {
      api.computed(() => {
        const { title, meta = [] } = factoryFn();
        if (title) document.title = title;
        meta.forEach(m => {
          let el = document.querySelector(`meta[name="${m.name}"], meta[property="${m.property}"]`);
          if (!el) {
            el = document.createElement('meta');
            if (m.name) el.setAttribute('name', m.name);
            if (m.property) el.setAttribute('property', m.property);
            document.head.appendChild(el);
          }
          el.setAttribute('content', m.content);
        });
      });
    };
  }
};
