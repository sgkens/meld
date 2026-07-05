import { describe, expect, it } from '@jest/globals';

const pluginModules = [
  ['a11y', '../src/plugins/meld-a11y.js', 'MeldA11y'],
  ['ai', '../src/plugins/meld-ai.js', 'MeldAI'],
  ['broadcast', '../src/plugins/meld-broadcast.js', 'MeldBroadcast'],
  ['cookie', '../src/plugins/meld-cookie.js', 'MeldCookie'],
  ['devtools', '../src/plugins/meld-devtools.js', 'MeldDevtools'],
  ['diagnostics', '../src/plugins/meld-diagnostics.js', 'MeldDiagnostics'],
  ['download', '../src/plugins/meld-download.js', 'MeldDownload'],
  ['federation', '../src/plugins/meld-federation.js', 'MeldFederation'],
  ['forms', '../src/plugins/meld-forms.js', 'MeldForms'],
  ['grpc', '../src/plugins/meld-grpc.js', 'MeldGrpc'],
  ['head', '../src/plugins/meld-head.js', 'MeldHead'],
  ['i18n', '../src/plugins/meld-i18n.js', 'MeldI18n'],
  ['inertia', '../src/plugins/meld-inertia.js', 'MeldInertia'],
  ['lazy', '../src/plugins/meld-lazy.js', 'MeldLazy'],
  ['logger', '../src/plugins/meld-logger.js', 'MeldLogger'],
  ['markdown', '../src/plugins/meld-markdown.js', 'MeldMarkdown'],
  ['microbus', '../src/plugins/meld-microbus.js', 'MeldMicrobus'],
  ['motion', '../src/plugins/meld-motion.js', 'MeldMotion'],
  ['persist', '../src/plugins/meld-persist.js', 'MeldPersist'],
  ['portal', '../src/plugins/meld-portal.js', 'MeldPortal'],
  ['query', '../src/plugins/meld-query.js', 'MeldQuery'],
  ['quiver', '../src/plugins/meld-quiver.js', 'MeldQuiver'],
  ['router', '../src/plugins/meld-router.js', 'MeldRouter'],
  ['skeleton', '../src/plugins/meld-skeleton.js', 'MeldSkeleton'],
  ['socket', '../src/plugins/meld-socket.js', 'MeldSocket'],
  ['store', '../src/plugins/meld-store.js', 'MeldStore'],
  ['terminal', '../src/plugins/meld-terminal.js', 'MeldTerminal'],
  ['test-utils', '../src/plugins/meld-test-utils.js', 'MeldTestUtils'],
  ['time', '../src/plugins/meld-time.js', 'MeldTime'],
  ['upload', '../src/plugins/meld-upload.js', 'MeldUpload'],
  ['versioning', '../src/plugins/meld-versioning.js', 'MeldVersioning'],
  ['wasm', '../src/plugins/meld-wasm.js', 'MeldWasm']
];

describe('Meld plugin exports', () => {
  it.each(pluginModules)('%s exposes its documented export', async (_name, modulePath, exportName) => {
    const mod = await import(modulePath);
    expect(mod[exportName]).toBeDefined();
  });

  it.each(pluginModules.filter(([_name]) => _name !== 'test-utils'))(
    '%s exposes an install hook',
    async (_name, modulePath, exportName) => {
      const mod = await import(modulePath);
      expect(typeof mod[exportName].install).toBe('function');
    }
  );
});
