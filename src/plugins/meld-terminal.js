/**
 * MeldTerminal plugin object.
 * Defines a `<meld-terminal>` custom element simulating a monospace green-on-black command line shell interface.
 * 
 * @type {object}
 * @property {function} install - Installs terminal element on the Meld instance.
 */
export const MeldTerminal = {
  /**
   * Installs the terminal component on the API object.
   * Defines `<meld-terminal>` custom element and registers `el.pushLine` method on instance elements.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    api.defineMeld('meld-terminal', (el) => {
      const state = api.meldState({ lines: [] });

      /**
       * Appends a new message line to the terminal viewport.
       * 
       * @param {string} txt - The line text to print.
       * @returns {string[]} The updated array of all terminal lines.
       */
      el.pushLine = (txt) => state.lines = [...state.lines, txt];

      return api.meldHtml`
        <style>
          .term { background: #000; color: #0f0; font-family: monospace; padding: 10px; height: 200px; overflow-y: auto; }
        </style>
        <div class="term">
          ${() => state.lines.map(l => api.meldHtml`<div>> ${l}</div>`)}
        </div>
      `;
    });
  }
};
