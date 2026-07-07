/**
 * MeldAI plugin object.
 * Integrates streaming AI completion features into Meld applications.
 * 
 * @type {object}
 * @property {function} install - Installs AI helpers on the Meld API.
 */
export const MeldAI = {
  /**
   * Installs AI helpers on the API object.
   * Registers the `useAI` helper method on the API.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Scopes an AI streaming state and prompt function to a URL endpoint.
     * 
     * @param {string} endpointUrl - The endpoint URL for the AI completions.
     * @returns {object} The AI controller object.
     * @returns {string} returns.completion - The accumulated streaming completion text.
     * @returns {boolean} returns.isLoading - Whether the prompt request is currently loading.
     * @returns {string|null} returns.error - The error message, if any request failed.
     * @returns {function(string): Promise<void>} returns.prompt - Function to trigger a prompt completion.
     */
    api.useAI = (endpointUrl) => {
      const state = api.meldState({ completion: '', isLoading: false, error: null });
      
      /**
       * Sends a text prompt payload to the AI endpoint and streams the response.
       * 
       * @param {string} textPayload - The prompt text to send.
       * @returns {Promise<void>} Resolves when the stream is fully read or fails.
       */
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
  },
  /**
   * Sets up helpers for components by returning an object containing `useAI`.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {object} Object containing the AI helper.
   * @returns {function} returns.useAI - The useAI helper function.
   */
  setupHelpers(api) {
    return { useAI: api.useAI };
  }
};
