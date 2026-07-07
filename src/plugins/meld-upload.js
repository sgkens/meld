/**
 * MeldUpload plugin object.
 * Defines a `<meld-upload>` custom element providing a drag-and-drop file upload zone.
 * 
 * @type {object}
 * @property {function} install - Installs upload element on the Meld instance.
 */
export const MeldUpload = {
  /**
   * Installs the upload component zone on the API object.
   * Defines `<meld-upload>` custom element that emits `file-selected` events.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    api.defineMeld('meld-upload', (el, { emit }) => {
      /**
       * Handles files drop event and emits selected file.
       * 
       * @param {DragEvent} e - The HTML DragEvent.
       * @returns {void}
       */
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
