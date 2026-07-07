/**
 * MeldTime plugin object.
 * Provides date formatting utilities and `<meld-time>` custom elements for relative or standard date presentation.
 * 
 * @type {object}
 * @property {function} install - Installs time formatting helper and custom element.
 */
export const MeldTime = {
  /**
   * Installs the time formatting helper and registers `<meld-time>` element on the API object.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Time formatting helpers.
     * 
     * @type {object}
     * @property {function(Date|string|number, string=): string} format - Formats dates reactively.
     */
    api.time = {
      /**
       * Formats a date string, number, or Date instance into relative or localized format.
       * 
       * @param {Date|string|number} date - The date to format.
       * @param {string} [style='medium'] - The formatting style ('relative', 'short', 'medium', 'long', 'full').
       * @returns {string} The formatted date text.
       */
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

    api.defineMeld('meld-time', (el, { attrs }) => {
      return api.meldHtml`<span>${() => api.time.format(attrs.date, attrs.format)}</span>`;
    }, { observedAttributes: ['date', 'format'] });
  }
};
