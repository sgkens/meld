/**
 * MeldI18n plugin object.
 * Provides basic translation and localization helpers.
 * 
 * @type {object}
 * @property {function} install - Installs internationalization helpers on the Meld API.
 */
export const MeldI18n = {
  /**
   * Installs the translation dictionary and locale helpers on the API object.
   * Registers the `api.t` translation lookup and `api.setLocale` update methods.
   * 
   * @param {object} api - The Meld API instance.
   * @param {object} [options={}] - Translations and setup configurations.
   * @param {string} [options.default='en'] - The initial locale tag.
   * @param {Object<string, Object<string, string>>} options - Dictionary of locale key-value translation objects.
   * @returns {void}
   */
  install(api, options = {}) {
    const state = api.meldState({ locale: options.default || 'en', translations: options });
    
    /**
     * Translates a dictionary key according to the active locale.
     * Fallbacks to returning the key if no match is found.
     * 
     * @param {string} key - The lookup translation key.
     * @returns {string} The translated string or the original key.
     */
    api.t = (key) => {
      return state.translations[state.locale]?.[key] || key;
    };

    /**
     * Updates the active locale, dynamically triggering re-computations of translated text.
     * 
     * @param {string} newLocale - The new locale tag to set.
     * @returns {void}
     */
    api.setLocale = (newLocale) => {
      state.locale = newLocale;
    };
  }
};
