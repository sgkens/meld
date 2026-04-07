export const MeldBroadcast = {
  install(api) {
    api.useBroadcast = (channelName, store, keys = null) => {
      const channel = new BroadcastChannel(channelName);
      let isReceiving = false;
      channel.onmessage = (event) => {
        isReceiving = true;
        const { key, value } = event.data;
        store[key] = value;
        setTimeout(() => isReceiving = false, 0);
      };
      const keysToWatch = keys || Object.keys(store);
      keysToWatch.forEach(key => {
        api.computed(() => {
          const val = store[key];
          if (!isReceiving) channel.postMessage({ key, value: val });
        });
      });
      api.onDestroy(() => channel.close());
    };
  }
};
