export const MeldA11y = {
  install(api) {
    const announcer = document.createElement('div');
    Object.assign(announcer.style, { position: 'absolute', height: '1px', width: '1px', overflow: 'hidden', clip: 'rect(1px, 1px, 1px, 1px)' });
    announcer.setAttribute('aria-live', 'polite');
    document.body.appendChild(announcer);

    api.announce = (msg) => {
      announcer.textContent = "";
      setTimeout(() => announcer.textContent = msg, 50);
    };

    api.trapFocus = (el) => {
      el.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (e.shiftKey && document.activeElement === focusable[0]) {
          focusable[focusable.length - 1].focus(); e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
          focusable[0].focus(); e.preventDefault();
        }
      });
    };
  }
};
