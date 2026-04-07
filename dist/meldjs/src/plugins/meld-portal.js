export const MeldPortal = {
  install(api) {
    api.defineMeld('meld-portal', () => {
       return api.meldHtml`
         <div ref="${(node) => document.body.appendChild(node)}">
           <slot></slot>
         </div>
       `;
    });
  }
};
