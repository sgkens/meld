export const MeldTestUtils = {
  render: (tagName, props = {}) => {
    const el = document.createElement(tagName);
    Object.assign(el, props);
    document.body.appendChild(el);
    return {
      element: el,
      shadowQuery: (sel) => el.shadowRoot.querySelector(sel),
      cleanup: () => document.body.removeChild(el)
    };
  }
};
