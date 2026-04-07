export const MeldTerminal = {
  install(api) {
    api.defineMeld('meld-terminal', (el) => {
      const state = api.meldState({ lines: [] });
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
