/**
 * MeldCookie plugin object.
 * Provides cookie getter, setter, and removal helper methods.
 * 
 * @type {object}
 * @property {function} install - Installs cookie helper utilities on the Meld API.
 */
export const MeldCookie = {
  /**
   * Installs the cookie manager object on the API object.
   * Registers the `api.cookie` helper object.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Cookie manager utilities.
     * 
     * @type {object}
     * @property {function(string): (string|null)} get - Gets a cookie value by name.
     * @property {function(string, string, number=): void} set - Sets a cookie with value and expiration days.
     * @property {function(string): void} remove - Removes a cookie by name.
     */
    api.cookie = {
      /**
       * Gets a cookie value by name.
       * 
       * @param {string} name - The name of the cookie.
       * @returns {string|null} The cookie value, or null if not found.
       */
      get: (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
      },
      /**
       * Sets a cookie with a name, value, and expiration in days.
       * 
       * @param {string} name - The name of the cookie.
       * @param {string} value - The value to set.
       * @param {number} [days=365] - Number of days until cookie expiration.
       * @returns {void}
       */
      set: (name, value, days = 365) => {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
      },
      /**
       * Removes a cookie by setting its expiration to the past.
       * 
       * @param {string} name - The name of the cookie.
       * @returns {void}
       */
      remove: (name) => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    };
  }
};
