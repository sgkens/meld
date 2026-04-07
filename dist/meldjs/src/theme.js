import { meld } from './meld.core.js';

export const initMeldUI = (config = {}) => {
  const tokens = `
    :root {
      --mui-font: 'Inter', system-ui, sans-serif;
      --mui-space-1: 4px;
      --mui-space-2: 8px;
      --mui-space-4: 16px;
      --mui-space-8: 32px;
      --mui-radius-sm: 4px;
      --mui-radius-md: 6px;
      --mui-radius-lg: 12px;
      --mui-bg: #ffffff;
      --mui-fg: #1a1a1a;
      --mui-primary: #D64045;
      --mui-primary-hover: #b53236;
      --mui-primary-fg: #ffffff;
      --mui-surface: #f4f4f5;
      --mui-border: #e4e4e7;
      --mui-shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
      --mui-shadow-md: 0 5px 10px rgba(0,0,0,0.12);
      --mui-ease: cubic-bezier(0.16, 1, 0.3, 1);
    }
    [data-theme='dark'] {
      --mui-bg: #09090b;
      --mui-fg: #fafafa;
      --mui-surface: #18181b;
      --mui-border: #27272a;
    }
    * { box-sizing: border-box; }
  `;
  meld.theme(tokens);
};
