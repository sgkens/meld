export const MeldTime = {
  install(api) {
    api.time = {
      format: (date, style = 'medium') => {
        const d = new Date(date);
        if (style === 'relative') {
          const diff = (new Date() - d) / 1000;
          if (diff < 60) return 'Just now';
          if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
          return `${Math.floor(diff / 3600)}h ago`;
        }
        return new Intl.DateTimeFormat('en-US', { dateStyle: style }).format(d);
      }
    };
    api.defineMeld('meld-time', (el) => {
      return api.meldHtml`<span>${() => api.time.format(el.getAttribute('date'), el.getAttribute('format'))}</span>`;
    });
  }
};
