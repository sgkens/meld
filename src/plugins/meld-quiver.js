export const MeldQuiver = {
  install(api, options = {}) {
    const baseURL = options.baseURL || '';
    api.useQuiver = () => ({
      get: (url) => fetch(baseURL + url).then(r => r.json()),
      post: (url, body) => fetch(baseURL + url, { method: 'POST', body: JSON.stringify(body) }).then(r => r.json())
    });
  }
};
