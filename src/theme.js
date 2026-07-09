import { meld } from './meld.core.js';

export const initMeldUI = (config = {}) => {
  const tokens = `
    :root {
      --mui-font: 'Outfit', 'Inter', system-ui, sans-serif;
      --mui-space-1: 4px;
      --mui-space-2: 8px;
      --mui-space-4: 16px;
      --mui-space-8: 32px;
      --mui-radius-sm: 8px;
      --mui-radius-md: 16px;
      --mui-radius-lg: 24px;
      --mui-bg: #f8fafc;
      --mui-fg: #0f172a;
      --mui-primary: #4f46e5;
      --mui-primary-hover: #4338ca;
      --mui-primary-fg: #ffffff;
      --mui-surface: #ffffff;
      --mui-border: #e2e8f0;
      --mui-shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
      --mui-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.05);
      --mui-ease: cubic-bezier(0.16, 1, 0.3, 1);
    }
    [data-theme='dark'] {
      --mui-bg: #090b11;
      --mui-fg: #f8fafc;
      --mui-surface: #121826;
      --mui-border: #1f293d;
      --mui-shadow-sm: 0 2px 4px rgba(0,0,0,0.2);
      --mui-shadow-md: 0 6px 16px rgba(0,0,0,0.4);
    }
    * { box-sizing: border-box; }
  `;
  meld.theme(tokens);
};
