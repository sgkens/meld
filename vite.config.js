import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';
import { resolve } from 'path';
import fs from 'fs';
import terser from '@rollup/plugin-terser';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const packageName = pkg.name.split('/').pop();

const bannertext = `/**
  Meld.js
  ${pkg.description}
  @Version v${pkg.version}
  @License ${pkg.license}
  @Homepage ${pkg.homepage}
  @Compiled ${new Date().toISOString()}
*/`;

export default defineConfig({
  optimizeDeps: {
    entries: ['index.html', 'demo-taskmanager/index.html']
  },
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
          dir: `dist/${packageName}/dist`,
          entryFileNames: `meld.core.js`,
          exports: 'named',
          plugins: [terser({ compress: false, mangle: false, format: { comments: true, preamble: bannertext } })],
        },
        {
          format: 'umd',
          name: 'Meld',
          dir: `dist/${packageName}/dist`,
          entryFileNames: `meld.core.min.js`,
          exports: 'named',
          plugins: [terser({ compress: true, mangle: true, format: { preamble: bannertext } })],
        },
        {
          format: 'es',
          dir: `dist/${packageName}/dist`,
          entryFileNames: `meld.core.esm.js`,
          plugins: [terser({ compress: false, mangle: false, format: { comments: true, preamble: bannertext } })],
        },
        {
          format: 'es',
          dir: `dist/${packageName}/dist`,
          entryFileNames: `meld.core.esm.min.js`,
          plugins: [terser({ compress: true, mangle: true, format: { preamble: bannertext } })],
        }
      ]
    }
  },
  plugins: [
    copy({
      targets: [
        { src: 'package.json', dest: `dist/${packageName}`, transform: (c) => {
            const j = JSON.parse(c.toString());
            delete j.scripts;
            delete j.devDependencies;
            delete j.jest;
            j.main = 'dist/meld.core.js';
            j.module = 'dist/meld.core.esm.js';
            j.types = 'src/meld.d.ts';
            j.jsdelivr = 'dist/meld.core.min.js';
            j.unpkg = 'dist/meld.core.min.js';
            j.exports = {
              '.': {
                types: './src/meld.d.ts',
                import: './dist/meld.core.esm.js',
                default: './dist/meld.core.esm.js'
              },
              './core': {
                types: './src/meld.d.ts',
                import: './dist/meld.core.esm.js',
                default: './dist/meld.core.esm.js'
              },
              './plugins/*': './src/plugins/meld-*.js',
              './components/*': './src/components/*',
              './bin/*': './bin/*',
              './package.json': './package.json'
            };
            return JSON.stringify(j, null, 2);
        }},
        { src: 'src', dest: `dist/${packageName}` },
        { src: 'bin', dest: `dist/${packageName}` },
        { src: 'README.md', dest: `dist/${packageName}` },
        { src: 'meld-env.d.ts', dest: `dist/${packageName}` },
        { src: 'jsr.jsonc', dest: `dist/${packageName}` }
      ],
      hook: 'writeBundle'
    })
  ]
});
