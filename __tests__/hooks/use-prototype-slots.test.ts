import { describe, it, expect } from 'vitest';
import { usePrototypeSlots } from '@/lib/hooks/use-prototype-slots';
import { renderHook, act } from '@testing-library/react';

type DummyPrototype = { id: number };
const dummyPrototype = (id: number): DummyPrototype => ({ id });

describe('usePrototypeSlots', () => {
  it('appends placeholder and replaces prototype', async () => {
    const { result } = renderHook(() =>
      usePrototypeSlots({
        maxConcurrentFetches: 2,
        simulateDelayRangeMs: null,
      }),
    );
    let slotId: number;
    act(() => {
      slotId = result.current.appendPlaceholder();
    });
    expect(result.current.prototypeSlots).toHaveLength(1);
    expect(result.current.prototypeSlots[0].isLoading).toBe(true);
    await act(async () => {
      await result.current.replacePrototypeInSlot(slotId!, dummyPrototype(1));
    });
    expect(result.current.prototypeSlots[0].prototype?.id).toBe(1);
    expect(result.current.prototypeSlots[0].isLoading).toBe(false);
  });

  it('sets error on slot', () => {
    const { result } = renderHook(() =>
      usePrototypeSlots({ simulateDelayRangeMs: null }),
    );
    let slotId: number;
    act(() => {
      slotId = result.current.appendPlaceholder();
    });
    act(() => {
      result.current.setSlotError(slotId!, 'Not found');
    });
    expect(result.current.prototypeSlots[0].errorMessage).toBe('Not found');
    expect(result.current.prototypeSlots[0].isLoading).toBe(false);
  });

  it('enforces max concurrency', () => {
    const { result } = renderHook(() =>
      usePrototypeSlots({
        maxConcurrentFetches: 1,
        simulateDelayRangeMs: null,
      }),
    );
    act(() => {
      const ok = result.current.tryIncrementInFlightRequests();
      expect(ok).toBe(true);
    });
    act(() => {
      const second = result.current.tryIncrementInFlightRequests();
      expect(second).toBe(false);
    });
    act(() => {
      result.current.decrementInFlightRequests();
    });
    expect(result.current.inFlightRequests).toBe(0);
  });
});
