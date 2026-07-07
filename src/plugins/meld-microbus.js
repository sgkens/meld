/**
 * MeldMicrobus plugin object.
 * Implements a lightweight publish-subscribe pattern event bus.
 * 
 * @type {object}
 * @property {function} install - Installs microbus events manager on the Meld API.
 */
export const MeldMicrobus = {
  /**
   * Installs the microbus messaging system on the API object.
   * Registers `api.Microbus` with subscribe and publish helpers.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    const subs = new Map();

    /**
     * Microbus interface object.
     * 
     * @type {object}
     * @property {function(string, function): function} subscribe - Subscribes to a topic.
     * @property {function(string, any): void} publish - Publishes a message to all topic subscribers.
     */
    api.Microbus = {
      /**
       * Subscribes a callback to a topic.
       * Returns an unsubscribe function to remove the subscription.
       * 
       * @param {string} topic - The topic name to listen to.
       * @param {function(any): void} cb - The callback executed when a message is published.
       * @returns {function(): boolean} Function that unsubscribes the callback when invoked.
       */
      subscribe: (topic, cb) => {
        if (!subs.has(topic)) subs.set(topic, new Set());
        subs.get(topic).add(cb);
        return () => subs.get(topic).delete(cb);
      },
      /**
       * Publishes a message payload to all subscribers of a topic.
       * 
       * @param {string} topic - The topic name to publish to.
       * @param {any} payload - The message payload to dispatch to subscribers.
       * @returns {void}
       */
      publish: (topic, payload) => {
        if (subs.has(topic)) subs.get(topic).forEach(cb => cb(payload));
      }
    };
  }
};
