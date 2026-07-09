import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

export default {
  version: pkg.version,              // single source of truth
  name: pkg.name,                    // e.g. @meldjs/meld
  npmName: '@meldjs/meld',
  nodeMin: '18',                     // minimum Node LTS
  releaseDate: '2026-07',            // current release cycle
  cdnUrl: `https://unpkg.com/${pkg.name}@${pkg.version}/dist/meld.core.esm.js`,
  releaseId: 'meld-launch-2026-07',
};
