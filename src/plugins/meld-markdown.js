/**
 * MeldMarkdown plugin object.
 * Defines a `<meld-markdown>` custom element for rendering raw HTML/Markdown content without escaping.
 * 
 * @type {object}
 * @property {function} install - Installs markdown element on the Meld instance.
 */
export const MeldMarkdown = {
  /**
   * Installs the markdown component on the API object.
   * Defines `<meld-markdown>` custom element using raw HTML interpolation.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    api.defineMeld('meld-markdown', (el) => {
      return api.meldHtml`
        <div>${() => api.meld.raw(el.getAttribute('content') || '')}</div>
      `;
    });
  }
};
