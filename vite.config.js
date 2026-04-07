import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';
import { resolve } from 'path';
import fs from 'fs';
import terser from '@rollup/plugin-terser';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const bannertext = `/**
  Meld.js
  @Version v${pkg.version}
*/`;

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: ['es2015'],
    lib: {
      entry: resolve(__dirname, `src/meld.core.js`),
      name: 'Meld',
      fileName: 'meld.core',
    },
    minify: false,
    rollupOptions: {
      output: [
        {
          format: 'umd',
          name: 'Meld',
          dir: `dist/meldjs/dist`,
          entryFileNames: `meld.core.js`,
          exports: 'named',
          plugins: [terser({ compress: false, mangle: false, format: { comments: true, preamble: bannertext } })],
        },
        {
          format: 'umd',
          name: 'Meld',
          dir: `dist/meldjs/dist`,
          entryFileNames: `meld.core.min.js`,
          exports: 'named',
          plugins: [terser({ compress: true, mangle: true, format: { preamble: bannertext } })],
        },
        {
          format: 'es',
          dir: `dist/meldjs/dist`,
          entryFileNames: `meld.core.esm.js`,
          plugins: [terser({ compress: false, mangle: false, format: { comments: true, preamble: bannertext } })],
        },
        {
          format: 'es',
          dir: `dist/meldjs/dist`,
          entryFileNames: `meld.core.esm.min.js`,
          plugins: [terser({ compress: true, mangle: true, format: { preamble: bannertext } })],
        }
      ]
    }
  },
  plugins: [
    copy({
      targets: [
        { src: 'package.json', dest: `dist/meldjs`, transform: (c) => {
            const j = JSON.parse(c.toString()); 
            delete j.scripts; 
            delete j.devDependencies; 
            return JSON.stringify(j, null, 2);
        }},
        { src: 'src', dest: `dist/meldjs` },
        { src: 'bin', dest: `dist/meldjs` },
        { src: 'README.md', dest: `dist/meldjs` }
      ],
      hook: 'writeBundle'
    })
  ]
});
