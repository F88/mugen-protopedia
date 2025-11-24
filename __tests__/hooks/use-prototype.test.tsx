import { renderHook } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLatestPrototypeById } from '@/lib/hooks/use-latest-prototype-by-id';

describe('useLatestPrototypeById', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns null prototype and no loading state when id is not provided', () => {
    const { result } = renderHook(() => useLatestPrototypeById());

    expect(result.current.prototype).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // Additional behavior of useLatestPrototypeById (e.g. SWR revalidation) is covered
  // indirectly in integration tests. Here we only verify the basic shape
  // of the hook result when no id is provided.
});
