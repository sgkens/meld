export const MeldAI = {
  install(api) {
    api.useAI = (endpointUrl) => {
      const state = api.meldState({ completion: '', isLoading: false, error: null });
      const prompt = async (textPayload) => {
        state.isLoading = true; state.completion = ''; state.error = null;
        try {
          const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: textPayload })
          });
          if (!response.ok) throw new Error(response.statusText || `HTTP ${response.status}`);
          if (!response.body) throw new Error("ReadableStream not supported");
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            state.completion += decoder.decode(value, { stream: true });
          }
        } catch (e) { state.error = e.message; } 
        finally { state.isLoading = false; }
      };
      return { 
        get completion() { return state.completion; },
        get isLoading() { return state.isLoading; },
        get error() { return state.error; },
        prompt 
      };
    };
  }
};
