// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { usePrototypeSlots } from '@/lib/hooks/use-prototype-slots';
import { renderHook, act } from '@testing-library/react';
import type { NormalizedPrototype } from '@/lib/api/prototypes';

// Minimal valid NormalizedPrototype factory for tests focused on slot state.
// Only required (non-optional) fields are populated; optional fields omitted.
const makePrototype = (id: number): NormalizedPrototype => ({
  id,
  prototypeNm: `Prototype ${id}`,
  teamNm: 'Team',
  users: ['User'],
  summary: 'summary',
  systemDescription: 'system description',
  tags: [],
  materials: [],
  events: [],
  awards: [],
  status: 1,
  releaseFlg: 1,
  createDate: '2024-01-01',
  updateDate: '2024-01-01',
  releaseDate: '2024-01-01',
  revision: 1,
  freeComment: '',
  viewCount: 0,
  goodCount: 0,
  commentCount: 0,
  mainUrl: '',
  licenseType: 0,
  thanksFlg: 0,
});

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
      await result.current.replacePrototypeInSlot(slotId!, makePrototype(1));
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
