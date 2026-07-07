/**
 * MeldA11y plugin object.
 * Provides accessibility helper methods like announcing messages to screen readers
 * and trapping focus within elements.
 * 
 * @type {object}
 * @property {function} install - Installs accessibility helpers on the Meld API.
 * @property {function} setupHelpers - Sets up helpers for use in components.
 */
export const MeldA11y = {
  /**
   * Installs the accessibility helpers on the API object.
   * Creates a hidden live announcer element in the document body and registers
   * `announce` and `trapFocus` methods.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    const announcer = document.createElement('div');
    Object.assign(announcer.style, { position: 'absolute', height: '1px', width: '1px', overflow: 'hidden', clip: 'rect(1px, 1px, 1px, 1px)' });
    announcer.setAttribute('aria-live', 'polite');
    document.body.appendChild(announcer);

    /**
     * Announces a message to screen readers using a hidden live region.
     * 
     * @param {string} msg - The message to announce.
     * @returns {void}
     */
    api.announce = (msg) => {
      announcer.textContent = "";
      setTimeout(() => announcer.textContent = msg, 50);
    };

    /**
     * Traps focus within the specified container element (e.g., for modals).
     * Returns a cleanup function to remove the event listener.
     * 
     * @param {HTMLElement} el - The container element to trap focus inside.
     * @returns {function} Cleanup function that removes the keydown event listener.
     */
    api.trapFocus = (el) => {
      const getFocusable = (root) => {
        const list = [];
        const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        const walk = (node) => {
          if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
          
          if (node.matches(selector)) {
            list.push(node);
          }
          
          if (node.shadowRoot) {
            Array.from(node.shadowRoot.childNodes).forEach(walk);
          }
          
          if (node.localName === 'slot') {
            node.assignedElements({ flatten: true }).forEach(walk);
          }
          
          Array.from(node.childNodes).forEach(walk);
        };
        
        walk(root);
        return Array.from(new Set(list));
      };

      const getActiveElement = () => {
        let active = document.activeElement;
        while (active && active.shadowRoot && active.shadowRoot.activeElement) {
          active = active.shadowRoot.activeElement;
        }
        return active;
      };

      const handler = (e) => {
        if (e.key !== 'Tab') return;
        const focusable = getFocusable(el);
        if (focusable.length === 0) return;
        const active = getActiveElement();
        const index = focusable.indexOf(active);
        
        if (index === -1) {
          if (e.shiftKey) {
            focusable[focusable.length - 1].focus();
          } else {
            focusable[0].focus();
          }
          e.preventDefault();
        } else if (e.shiftKey && active === focusable[0]) {
          focusable[focusable.length - 1].focus();
          e.preventDefault();
        } else if (!e.shiftKey && active === focusable[focusable.length - 1]) {
          focusable[0].focus();
          e.preventDefault();
        }
      };
      
      // Listen on window to catch tabbing anywhere when modal is active,
      // but only target focus within/near el
      window.addEventListener('keydown', handler, true);
      return () => window.removeEventListener('keydown', handler, true);
    };
  },
  /**
   * Sets up helpers for components by returning an object containing `announce` and `trapFocus`.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {object} Object containing the accessibility helper functions.
   * @returns {function} returns.announce - The announce helper function.
   * @returns {function} returns.trapFocus - The trapFocus helper function.
   */
  setupHelpers(api) {
    return { announce: api.announce, trapFocus: api.trapFocus };
  }
};
