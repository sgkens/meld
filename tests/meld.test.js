import { meldState, computed } from '../src/meld.core.js';

describe('Meld Core Reactivity', () => {
  it('should trigger computed updates when state changes', () => {
    const state = meldState({ count: 0 });
    const double = computed(() => state.count * 2);

    expect(double()).toBe(0);
    state.count++;
    expect(double()).toBe(2);
  });
});
