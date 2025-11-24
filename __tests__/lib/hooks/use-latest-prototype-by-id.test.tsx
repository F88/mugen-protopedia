import { renderHook, waitFor } from '@testing-library/react';

import { describe, expect, it, vi, beforeEach } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { useLatestPrototypeById } from '@/lib/hooks/use-latest-prototype-by-id';
import * as fetcherModule from '@/lib/fetcher/get-latest-prototype-by-id';

describe('useLatestPrototypeById (fetch behavior)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns null prototype and no loading state when id is not provided', () => {
    const { result } = renderHook(() => useLatestPrototypeById());

    expect(result.current.prototype).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches and returns a prototype when id is provided', async () => {
    const mockPrototype: NormalizedPrototype = {
      id: 123,
      title: 'Test Prototype',
      url: 'https://example.com',
      // The rest of the fields are not used by the hook, so we can cast.
    } as unknown as NormalizedPrototype;

    const spy = vi
      .spyOn(fetcherModule, 'getLatestPrototypeById')
      .mockResolvedValueOnce(mockPrototype);

    const { result } = renderHook(() => useLatestPrototypeById({ id: 123 }));

    await waitFor(() => {
      expect(result.current.prototype).toEqual(mockPrototype);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(spy).toHaveBeenCalledWith(123);
  });

  it('exposes error message when fetcher throws', async () => {
    const error = new Error('boom');
    const spy = vi
      .spyOn(fetcherModule, 'getLatestPrototypeById')
      .mockRejectedValueOnce(error);

    const { result } = renderHook(() => useLatestPrototypeById({ id: 999 }));

    await waitFor(() => {
      expect(result.current.prototype).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('boom');
    });

    expect(spy).toHaveBeenCalledWith(999);
  });
});
