/**
 * MeldTestUtils helper object.
 * Provides testing utilities for mounting and querying Meld components in a DOM environment.
 * 
 * @type {object}
 * @property {function} render - Renders a custom element into the document body with optional properties.
 */
export const MeldTestUtils = {
  /**
   * Instantiates and mounts a component tag in the DOM for testing.
   * 
   * @param {string} tagName - The custom element tag name (e.g. `my-component`).
   * @param {object} [props={}] - Element properties or attributes to assign.
   * @returns {object} Testing handles for the mounted element.
   * @returns {HTMLElement} returns.element - The mounted custom element instance.
   * @returns {function(string): HTMLElement|null} returns.shadowQuery - Queries an element inside the shadow DOM tree.
   * @returns {function(): void} returns.cleanup - Unmounts/removes the element from the document body.
   */
  render: (tagName, props = {}) => {
    const el = document.createElement(tagName);
    Object.assign(el, props);
    document.body.appendChild(el);
    return {
      /**
       * Queries the shadow root of the element using the provided selector.
       * 
       * @param {string} sel - Selector string to search inside shadow DOM.
       * @returns {HTMLElement|null} The matched element or null if not found.
       */
      shadowQuery: (sel) => el.shadowRoot.querySelector(sel),
      /**
       * Removes the rendered element from the document body.
       * 
       * @returns {void}
       */
      cleanup: () => document.body.removeChild(el)
    };
  }
};
