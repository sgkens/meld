/**
 * MeldMotion plugin object.
 * Provides `<meld-transition>` custom element for enter and exit animations.
 * 
 * @type {object}
 * @property {function} install - Installs `<meld-transition>` on the Meld instance.
 */
export const MeldMotion = {
  /**
   * Installs motion/animation helper engine on the API object.
   * Defines `<meld-transition>` custom element.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    const { defineMeld, meldHtml, meldState, computed, onDestroy } = api;

    /**
     * Helper to parse CSS transition/animation duration from element styles.
     * 
     * @param {HTMLElement} el - The element to read styles from.
     * @returns {number} The duration in milliseconds.
     */
    function getTransitionDuration(el) {
      if (!el) return 0;
      const styles = window.getComputedStyle(el);
      const transitionDur = parseFloat(styles.transitionDuration) || 0;
      const animationDur = parseFloat(styles.animationDuration) || 0;
      const maxDur = Math.max(transitionDur, animationDur);
      return maxDur * 1000;
    }

    defineMeld('meld-transition', (el, { attrs }) => {
      const name = el.getAttribute('name') || 'v';
      const childRef = el.firstElementChild; // Save direct reference immediately

      // Determine initial show state
      const initialShow = el.hasAttribute('show') 
        ? (el.getAttribute('show') === 'true' || el.getAttribute('show') === '') 
        : true;

      const state = meldState({ 
        rendered: initialShow 
      });

      let transitionTimeout = null;

      computed(() => {
        // Resolve show state reactively
        const show = attrs.show === 'true' || attrs.show === true || (el.hasAttribute('show') && attrs.show !== 'false');

        if (show) {
          if (transitionTimeout) {
            clearTimeout(transitionTimeout);
            transitionTimeout = null;
          }
          state.rendered = true;

          // Tick to wait for element insertion
          setTimeout(() => {
            if (childRef) {
              childRef.classList.remove(`${name}-leave-active`, `${name}-leave-to`);
              childRef.classList.add(`${name}-enter`, `${name}-enter-active`);

              // Double requestAnimationFrame to ensure CSS style application ticks
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  childRef.classList.remove(`${name}-enter`);
                  childRef.classList.add(`${name}-enter-to`);
                });
              });

              const onEnd = (e) => {
                if (e && e.target !== childRef) return;
                childRef.classList.remove(`${name}-enter-active`, `${name}-enter-to`);
                childRef.removeEventListener('transitionend', onEnd);
                childRef.removeEventListener('animationend', onEnd);
              };

              childRef.addEventListener('transitionend', onEnd);
              childRef.addEventListener('animationend', onEnd);
            }
          }, 0);
        } else {
          // Exit transition
          if (childRef && state.rendered) {
            childRef.classList.remove(`${name}-enter-active`, `${name}-enter-to`);
            childRef.classList.add(`${name}-leave`, `${name}-leave-active`);

            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                childRef.classList.remove(`${name}-leave`);
                childRef.classList.add(`${name}-leave-to`);
              });
            });

            const onEnd = (e) => {
              if (e && e.target !== childRef) return;
              childRef.classList.remove(`${name}-leave-active`, `${name}-leave-to`);
              childRef.removeEventListener('transitionend', onEnd);
              childRef.removeEventListener('animationend', onEnd);
              state.rendered = false;
            };

            childRef.addEventListener('transitionend', onEnd);
            childRef.addEventListener('animationend', onEnd);

            // Safety timeout fallback
            const duration = getTransitionDuration(childRef) || 300;
            transitionTimeout = setTimeout(() => {
              if (state.rendered && !show) {
                onEnd();
              }
            }, duration + 50);
          } else {
            state.rendered = false;
          }
        }
      });

      onDestroy(() => {
        if (transitionTimeout) clearTimeout(transitionTimeout);
      });

      return meldHtml`
        <div>
          ${() => state.rendered ? childRef : ''}
        </div>
      `;
    }, { observedAttributes: ['show'] });
  }
};
