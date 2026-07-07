/**
 * MeldDownload plugin object.
 * Provides client-side file download triggering helpers.
 * 
 * @type {object}
 * @property {function} install - Installs download helper on the Meld API.
 */
export const MeldDownload = {
  /**
   * Installs the download helper on the API object.
   * Registers the `api.download` helper method.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Triggers a client-side file download for the given data payload or Blob.
     * 
     * @param {string|ArrayBuffer|Blob|any} data - The raw data, buffer, or Blob to download.
     * @param {string} filename - The name to save the downloaded file as.
     * @param {string} [mimeType='text/plain'] - The MIME type for the Blob if a raw string/buffer is provided.
     * @returns {void}
     */
    api.download = (data, filename, mimeType = 'text/plain') => {
      const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    };
  },
  /**
   * Sets up helpers for components by returning an object containing `download`.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {object} Object containing the download helper.
   * @returns {function} returns.download - The download helper function.
   */
  setupHelpers(api) {
    return { download: api.download };
  }
};
