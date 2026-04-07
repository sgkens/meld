export const MeldI18n = {
  install(api, options = {}) {
    const state = api.meldState({ locale: options.default || 'en', translations: options });
    
    api.t = (key) => {
      return state.translations[state.locale]?.[key] || key;
    };

    api.setLocale = (newLocale) => {
      state.locale = newLocale;
    };
  }
};
