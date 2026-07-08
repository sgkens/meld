/**
 * MeldHotkeys plugin object.
 * Reactively manages keyboard shortcuts for components, automatically cleaning them up upon destruction.
 * 
 * @type {object}
 * @property {function} install - Installs hotkey hooks on the Meld instance.
 */
export const MeldHotkeys = {
  /**
   * Installs hotkey hooks on the API object.
   * Registers the `api.useHotkeys` helper method.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    const { onDestroy } = api;

    /**
     * Binds keyboard shortcuts to handlers.
     * Automatically removes listener when component is destroyed.
     * 
     * @param {Record<string, function(KeyboardEvent): void>} bindings - Map of key combinations (e.g. "ctrl+s", "escape", "/") to handlers.
     * @param {HTMLElement|Window|Document} [target=window] - Event target.
     * @returns {void}
     */
    api.useHotkeys = (bindings, target = window) => {
      const handler = (e) => {
        const keys = [];
        if (e.ctrlKey) keys.push("ctrl");
        if (e.shiftKey) keys.push("shift");
        if (e.altKey) keys.push("alt");
        if (e.metaKey) keys.push("meta");
        
        const keyName = e.key.toLowerCase();
        if (!["control", "shift", "alt", "meta"].includes(keyName)) {
          keys.push(keyName);
        }
        
        const combo = keys.join("+");
        
        Object.keys(bindings).forEach(bindCombo => {
          const formattedBindCombo = bindCombo.toLowerCase().replace(/\s+/g, "");
          if (formattedBindCombo === combo) {
            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
            const isEditing = ["input", "textarea", "select"].includes(activeTag) || 
                              (document.activeElement && document.activeElement.isContentEditable);
            
            // Allow combo modifiers (like ctrl+s) or escape, but block single character keys (like "n") when typing in fields
            if (isEditing && combo.length === 1) {
              return;
            }
            
            e.preventDefault();
            bindings[bindCombo](e);
          }
        });
      };

      target.addEventListener("keydown", handler);
      onDestroy(() => {
        target.removeEventListener("keydown", handler);
      });
    };
  },
  /**
   * Sets up helpers for components by returning an object containing `useHotkeys`.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {object} Object containing the hotkey helper.
   * @returns {function} returns.useHotkeys - The useHotkeys helper function.
   */
  setupHelpers(api) {
    return { useHotkeys: api.useHotkeys };
  }
};
