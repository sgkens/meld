export const MeldLogger = {
  install(api) {
    api.useLog = (namespace) => ({
      info: (msg, ...args) => console.log(`[${namespace}] INFO:`, msg, ...args),
      error: (msg, ...args) => console.error(`[${namespace}] ERROR:`, msg, ...args),
      warn: (msg, ...args) => console.warn(`[${namespace}] WARN:`, msg, ...args)
    });
  }
};
