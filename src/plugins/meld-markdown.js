import { marked } from 'marked';

/**
 * MeldMarkdown plugin object.
 * Defines a `<meld-markdown>` custom element for rendering compiled Markdown content.
 * 
 * @type {object}
 * @property {function} install - Installs markdown element on the Meld instance.
 */
export const MeldMarkdown = {
  /**
   * Installs the markdown component on the API object.
   * Defines `<meld-markdown>` custom element using raw HTML interpolation and marked compiler.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    api.defineMeld('meld-markdown', (el, { props, attrs }) => {
      return api.meldHtml`
        <div>${() => {
          const content = props.content || el.content || attrs.content || '';
          const html = marked.parse(content);
          return api.meld.raw(html);
        }}</div>
      `;
    }, {
      observedAttributes: ['content'],
      properties: ['content']
    });
  }
};
