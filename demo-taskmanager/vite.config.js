import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      // Allow serving files from the parent project root
      allow: ['..']
    }
  },
  optimizeDeps: {
    // Exclude local source files from esbuild pre-bundling.
    // Vite's pre-bundler can silently lose named ESM exports from
    // raw local modules (e.g. inject, provide), causing runtime
    // "is not a function" errors. Serving them as native ESM is correct.
    exclude: ['../src/meld.core.js', '../src/plugins', '../src/components', '../src/theme.js']
  }
});

