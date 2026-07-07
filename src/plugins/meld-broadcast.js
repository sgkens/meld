/**
 * MeldBroadcast plugin object.
 * Synchronizes reactive state store keys across browser contexts (e.g. tabs, windows, iframes) using the BroadcastChannel API.
 * 
 * @type {object}
 * @property {function} install - Installs broadcast helper on the Meld API.
 * @property {function} setupHelpers - Sets up helpers for use in components.
 */
export const MeldBroadcast = {
  /**
   * Installs the broadcast synchronizer on the API object.
   * Registers the `useBroadcast` helper method on the API.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Synchronizes specified keys of a reactive store over a BroadcastChannel.
     * Automatically closes the channel when the scoping component is destroyed.
     * 
     * @param {string} channelName - The name of the broadcast channel.
     * @param {object} store - The reactive store state object.
     * @param {string[]|null} [keys=null] - The keys of the store to synchronize. Defaults to all keys in the store.
     * @returns {void}
     */
    api.useBroadcast = (channelName, store, keys = null) => {
      const channel = new BroadcastChannel(channelName);
      let isReceiving = false;
      channel.onmessage = (event) => {
        isReceiving = true;
        const { key, value } = event.data;
        store[key] = value;
        setTimeout(() => isReceiving = false, 0);
      };
      const keysToWatch = keys || Object.keys(store);
      keysToWatch.forEach(key => {
        api.computed(() => {
          const val = store[key];
          if (!isReceiving) channel.postMessage({ key, value: val });
        });
      });
      api.onDestroy(() => channel.close());
    };
  },
  /**
   * Sets up helpers for components by returning an object containing `useBroadcast`.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {object} Object containing the broadcast synchronization helper.
   * @returns {function} returns.useBroadcast - The useBroadcast helper function.
   */
  setupHelpers(api) {
    return { useBroadcast: api.useBroadcast };
  }
};
