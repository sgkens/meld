/**
 * MeldDiagnostics plugin object.
 * Transparently monitors component setups, mount durations, active instances, and reactive effect counts.
 * 
 * @type {object}
 * @property {function} install - Installs diagnostics engine.
 */

const registry = {
  components: {}
};

const activeElements = new Set();

export const MeldDiagnostics = {
  /**
   * Installs the diagnostics engine on the API object.
   * Intercepts `defineMeld` to profile and track components.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    const originalDefineMeld = api.defineMeld;

    api.defineMeld = (tagName, setupFn, options = {}) => {
      registry.components[tagName] = {
        instances: 0,
        activeInstances: 0,
        setupDurations: [],
        mountDurations: [],
        errors: []
      };

      const wrappedSetupFn = (el, helpers) => {
        activeElements.add(el);
        registry.components[tagName].instances++;
        registry.components[tagName].activeInstances++;

        // Wrap mountHooks to profile mount execution time
        const originalMountHooks = [...el.mountHooks];
        el.mountHooks = [];

        let template;
        const setupStart = performance.now();
        try {
          template = setupFn(el, helpers);
        } catch (err) {
          registry.components[tagName].errors.push({
            message: err.message,
            stack: err.stack,
            timestamp: Date.now()
          });
          throw err;
        }
        const setupDuration = performance.now() - setupStart;
        registry.components[tagName].setupDurations.push(setupDuration);

        // Wrap user-registered mount hooks
        const userMountHooks = [...el.mountHooks];
        el.mountHooks = [...originalMountHooks, ...userMountHooks].map(hook => {
          return () => {
            const mountStart = performance.now();
            hook();
            const mountDuration = performance.now() - mountStart;
            registry.components[tagName].mountDurations.push(mountDuration);
          };
        });

        // Add cleanup to destroyHooks to track active instances and activeElements set
        el.destroyHooks.push(() => {
          activeElements.delete(el);
          registry.components[tagName].activeInstances--;
        });

        return template;
      };

      return originalDefineMeld(tagName, wrappedSetupFn, options);
    };

    /**
     * Generates a performance and health report of the Meld application.
     * 
     * @returns {object} The diagnostics report.
     */
    api.getDiagnosticsReport = () => {
      const componentReports = {};
      let totalActiveEffects = 0;

      activeElements.forEach(el => {
        totalActiveEffects += el.effects ? el.effects.length : 0;
      });

      Object.keys(registry.components).forEach(tagName => {
        const stats = registry.components[tagName];
        const avgSetup = stats.setupDurations.length > 0
          ? stats.setupDurations.reduce((a, b) => a + b, 0) / stats.setupDurations.length
          : 0;
        const avgMount = stats.mountDurations.length > 0
          ? stats.mountDurations.reduce((a, b) => a + b, 0) / stats.mountDurations.length
          : 0;

        componentReports[tagName] = {
          totalCreated: stats.instances,
          activeCount: stats.activeInstances,
          averageSetupMs: parseFloat(avgSetup.toFixed(3)),
          averageMountMs: parseFloat(avgMount.toFixed(3)),
          errorCount: stats.errors.length,
          errors: stats.errors
        };
      });

      return {
        totalActiveComponents: activeElements.size,
        totalActiveEffects,
        components: componentReports
      };
    };
  },
  /**
   * Sets up helpers for components.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {object} Object containing getDiagnosticsReport.
   */
  setupHelpers(api) {
    return { getDiagnosticsReport: api.getDiagnosticsReport };
  }
};
