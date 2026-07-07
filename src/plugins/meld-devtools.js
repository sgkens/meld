/**
 * MeldDevtools plugin object.
 * Visualizes and inspects reactivity update flashes for custom elements when dev mode is enabled.
 * 
 * @type {object}
 * @property {function} install - Installs devtools wrappers and overlays on the Meld instance.
 */
export const MeldDevtools = {
  /**
   * Installs the devtools utilities on the API object.
   * Wraps `defineMeld` and `meldHtml` to intercept rendering updates and trigger overlay highlights.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    console.log("Meld Devtools Active");
    
    // Check if devmode is enabled (toggled via localstorage or window global)
    window.meldDevMode = window.localStorage.getItem('meld-devmode') === 'true';
    
    /**
     * Highlights the updated element on the screen with an overlay badge and border.
     * 
     * @param {HTMLElement} el - The element to visually flash.
     * @returns {void}
     */
    const triggerFlash = (el) => {
      if (!window.meldDevMode) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      el._updateCount = (el._updateCount || 0) + 1;
      
      // Generate a unique selector or ID per element instance
      const overlayId = `meld-devtools-overlay-${el.tagName.toLowerCase()}-${Array.from(el.parentElement?.children || []).indexOf(el)}`;
      let overlay = document.getElementById(overlayId);
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.position = 'absolute';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '999999';
        overlay.style.border = '2px solid #a855f7'; // Purple highlight border
        overlay.style.background = 'rgba(168, 85, 247, 0.08)';
        overlay.style.borderRadius = '4px';
        overlay.style.boxShadow = '0 0 8px rgba(168, 85, 247, 0.4)';
        overlay.style.transition = 'opacity 0.2s ease-out';
        
        const badge = document.createElement('div');
        badge.className = 'meld-devtools-badge';
        badge.style.position = 'absolute';
        badge.style.top = '-18px';
        badge.style.left = '0';
        badge.style.background = '#a855f7';
        badge.style.color = '#fff';
        badge.style.fontSize = '10px';
        badge.style.fontFamily = 'monospace';
        badge.style.padding = '2px 6px';
        badge.style.borderRadius = '3px';
        badge.style.fontWeight = 'bold';
        badge.style.whiteSpace = 'nowrap';
        badge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';
        overlay.appendChild(badge);
        
        document.body.appendChild(overlay);
      }
      
      overlay.style.left = `${rect.left + window.scrollX}px`;
      overlay.style.top = `${rect.top + window.scrollY}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.opacity = '1';
      
      const badge = overlay.querySelector('.meld-devtools-badge');
      if (badge) {
        badge.textContent = `<${el.tagName.toLowerCase()}> update: ${el._updateCount}`;
      }

      // Dispatch event for telemetry panel
      window.dispatchEvent(new CustomEvent('meld-devtools-update', {
        detail: {
          tagName: el.tagName.toLowerCase(),
          updateCount: el._updateCount,
          time: new Date().toLocaleTimeString()
        }
      }));
      
      if (overlay._timeout) clearTimeout(overlay._timeout);
      
      overlay._timeout = setTimeout(() => {
        overlay.style.opacity = '0';
        overlay._timeout = setTimeout(() => {
          overlay.remove();
        }, 200);
      }, 800);
    };

    // Override defineMeld to wrap setupFn and intercept meldHtml calls
    const originalDefineMeld = api.defineMeld;
    api.defineMeld = function(tagName, setupFn, options) {
      const wrappedSetupFn = function(el, context) {
        const originalMeldHtml = api.meldHtml;
        api.meldHtml = function(strings, ...values) {
          const wrappedValues = values.map(val => {
            if (typeof val === 'function') {
              return () => {
                if (el._isMounted && window.meldDevMode) {
                  triggerFlash(el);
                }
                return val();
              };
            }
            return val;
          });
          return originalMeldHtml.call(this, strings, ...wrappedValues);
        };
        
        try {
          const res = setupFn(el, context);
          api.onMount(() => {
            setTimeout(() => {
              el._isMounted = true;
            }, 100);
          });
          return res;
        } finally {
          api.meldHtml = originalMeldHtml;
        }
      };
      
      return originalDefineMeld.call(this, tagName, wrappedSetupFn, options);
    };
  }
};
