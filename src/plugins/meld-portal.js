/**
 * MeldPortal plugin object.
 * Defines a `<meld-portal>` custom element to mount and render children outside the parent DOM hierarchy directly into the document body.
 * 
 * @type {object}
 * @property {function} install - Installs portal element on the Meld instance.
 */
export const MeldPortal = {
  /**
   * Installs the portal component on the API object.
   * Defines `<meld-portal>` custom element utilizing ref callbacks for portal relocation.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    api.defineMeld('meld-portal', () => {
       return api.meldHtml`
         <div ref="${(node) => {
           document.body.appendChild(node);
           api.onDestroy(() => node.remove());
         }}">
           <slot></slot>
         </div>
       `;
    });
  }
};
