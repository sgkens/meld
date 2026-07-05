export const MeldQuiver = {
  install(api, options = {}) {
    const baseURL = options.baseURL || '';
    const request = async (url, requestOptions = {}) => {
      const response = await fetch(baseURL + url, requestOptions);
      if (!response.ok) throw new Error(response.statusText || `HTTP ${response.status}`);
      return response.json();
    };

    api.useQuiver = () => ({
      get: (url) => request(url),
      post: (url, body) => request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    });
  }
};
