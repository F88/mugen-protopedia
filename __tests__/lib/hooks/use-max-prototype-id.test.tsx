import { renderHook, waitFor } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as prototypeActions from '@/app/actions/prototypes';
import { useMaxPrototypeId } from '@/lib/hooks/use-max-prototype-id';

const FALLBACK_MAX_PROTOTYPE_ID = 7_777;

describe('useMaxPrototypeId', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the resolved max id when the server provides a valid value', async () => {
    const spy = vi
      .spyOn(prototypeActions, 'getMaxPrototypeId')
      .mockResolvedValue(1234);

    const { result } = renderHook(() => useMaxPrototypeId());

    // Starts at the fallback, then resolves to the server value.
    expect(result.current).toBe(FALLBACK_MAX_PROTOTYPE_ID);
    await waitFor(() => expect(result.current).toBe(1234));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('falls back when the server returns null', async () => {
    const spy = vi
      .spyOn(prototypeActions, 'getMaxPrototypeId')
      .mockResolvedValue(null);

    const { result } = renderHook(() => useMaxPrototypeId());

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    expect(result.current).toBe(FALLBACK_MAX_PROTOTYPE_ID);
  });

  it.each([0, -5, Number.NaN])(
    'falls back when the server returns an invalid value (%s)',
    async (value) => {
      const spy = vi
        .spyOn(prototypeActions, 'getMaxPrototypeId')
        .mockResolvedValue(value);

      const { result } = renderHook(() => useMaxPrototypeId());

      await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
      expect(result.current).toBe(FALLBACK_MAX_PROTOTYPE_ID);
    },
  );

  it('falls back and warns when the lookup throws', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(prototypeActions, 'getMaxPrototypeId').mockRejectedValue(
      new Error('boom'),
    );

    const { result } = renderHook(() => useMaxPrototypeId());

    await waitFor(() => expect(warn).toHaveBeenCalledTimes(1));
    expect(result.current).toBe(FALLBACK_MAX_PROTOTYPE_ID);
  });
});
