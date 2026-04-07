export const MeldMarkdown = {
  install(api) {
    api.defineMeld('meld-markdown', (el) => {
      return api.meldHtml`
        <div>${() => api.meld.raw(el.getAttribute('content') || '')}</div>
      `;
    });
  }
};
