export const MeldUpload = {
  install(api) {
    api.defineMeld('meld-upload', (el, { emit }) => {
      const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) emit('file-selected', file);
      };
      return api.meldHtml`
        <div ondragover="${(e) => e.preventDefault()}" ondrop="${handleDrop}" style="border: 2px dashed #ccc; padding: 20px; text-align: center;">
          <slot>Drop files here</slot>
        </div>
      `;
    });
  }
};
