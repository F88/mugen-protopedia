import { renderHook, waitFor } from '@testing-library/react';

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useClientAnniversaries } from '@/lib/hooks/use-client-anniversaries';
import * as analysisClient from '@/lib/utils/prototype-analysis.client';

describe('useClientAnniversaries', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const baseServerAnalysis: any = {
    anniversaryCandidates: {
      mmdd: [{ id: 1 }, { id: 2 }],
    },
  };

  it('does nothing when disabled', async () => {
    const spy = vi.spyOn(analysisClient, 'analyzeCandidates');

    const { result } = renderHook(() =>
      useClientAnniversaries(baseServerAnalysis, { enabled: false }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.anniversaries).toBeNull();
    expect(result.current.error).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it('computes anniversaries when enabled and serverAnalysis is provided', async () => {
    const mockAnniversaries = [{ id: 1 }];
    const spy = vi.spyOn(analysisClient, 'analyzeCandidates').mockReturnValue({
      anniversaries: mockAnniversaries,
    } as any);

    const { result } = renderHook(() =>
      useClientAnniversaries(baseServerAnalysis, { enabled: true }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.anniversaries).toEqual(mockAnniversaries);
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('sets error when analyzeCandidates throws', async () => {
    vi.spyOn(analysisClient, 'analyzeCandidates').mockImplementation(() => {
      throw new Error('analysis-failed');
    });

    const { result } = renderHook(() =>
      useClientAnniversaries(baseServerAnalysis, { enabled: true }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.anniversaries).toBeNull();
      expect(result.current.error).toBe('analysis-failed');
    });
  });

  it('refresh recomputes anniversaries', async () => {
    const mockAnniversaries = [{ id: 1 }];
    const spy = vi.spyOn(analysisClient, 'analyzeCandidates').mockReturnValue({
      anniversaries: mockAnniversaries,
    } as any);

    const { result } = renderHook(() =>
      useClientAnniversaries(baseServerAnalysis, { enabled: true }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.refresh();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });
});
