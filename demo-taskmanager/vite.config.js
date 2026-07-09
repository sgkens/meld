import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    fs: {
      // Allow serving files from the parent project root
      allow: ['..']
    }
  }
});
