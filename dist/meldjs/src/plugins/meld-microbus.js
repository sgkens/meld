export const MeldMicrobus = {
  install(api) {
    const subs = new Map();
    api.Microbus = {
      subscribe: (topic, cb) => {
        if (!subs.has(topic)) subs.set(topic, new Set());
        subs.get(topic).add(cb);
        return () => subs.get(topic).delete(cb);
      },
      publish: (topic, payload) => {
        if (subs.has(topic)) subs.get(topic).forEach(cb => cb(payload));
      }
    };
  }
};
