import { renderHook, waitFor } from '@testing-library/react';

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useAllAnalyses, useLatestAnalysis } from '@/lib/hooks/use-analysis';
import type {
  GetAllAnalysesResult,
  GetAnalysisResult,
} from '@/app/actions/analysis';
import type { ServerPrototypeAnalysis } from '@/lib/utils/prototype-analysis.types';
import * as analysisActions from '@/app/actions/analysis';

describe('useLatestAnalysis', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads latest analysis successfully and exposes refresh', async () => {
    const mockAnalysis: ServerPrototypeAnalysis = {
      totalCount: 1,
      statusDistribution: {},
      prototypesWithAwards: 0,
      topTags: [],
      averageAgeInDays: 0,
      yearDistribution: {},
      topTeams: [],
      analyzedAt: '2025-01-01T00:00:00.000Z',
      anniversaryCandidates: {
        metadata: {
          computedAt: '2025-01-01T00:00:00.000Z',
          windowUTC: {
            fromISO: '2025-01-01T00:00:00.000Z',
            toISO: '2025-01-03T23:59:59.999Z',
          },
        },
        mmdd: [],
      },
    };
    const mockResult: GetAnalysisResult = {
      ok: true,
      data: mockAnalysis,
      cachedAt: '2025-01-01T00:00:00.000Z',
      params: {
        limit: 10,
        offset: 0,
        totalCount: 1,
      },
    };
    const spy = vi
      .spyOn(analysisActions, 'getLatestAnalysis')
      .mockResolvedValue(mockResult);

    const { result } = renderHook(() => useLatestAnalysis());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(mockResult.data);
    });

    expect(spy).toHaveBeenCalledTimes(1);

    // refresh should trigger another fetch
    await waitFor(() => {
      result.current.refresh({ forceRecompute: true });
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('sets error state when latest analysis fetch fails with error result', async () => {
    const mockResult: GetAnalysisResult = {
      ok: false,
      error: 'analysis failed',
    };
    vi.spyOn(analysisActions, 'getLatestAnalysis').mockResolvedValue(
      mockResult,
    );

    const { result } = renderHook(() => useLatestAnalysis());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('analysis failed');
    });
  });

  it('sets error state when latest analysis fetch throws', async () => {
    vi.spyOn(analysisActions, 'getLatestAnalysis').mockRejectedValue(
      new Error('boom'),
    );

    const { result } = renderHook(() => useLatestAnalysis());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('boom');
    });
  });
});

describe('useAllAnalyses', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads all analyses successfully and exposes refresh', async () => {
    const mockAnalysis: ServerPrototypeAnalysis = {
      totalCount: 1,
      statusDistribution: {},
      prototypesWithAwards: 0,
      topTags: [],
      averageAgeInDays: 0,
      yearDistribution: {},
      topTeams: [],
      analyzedAt: '2025-01-01T00:00:00.000Z',
      anniversaryCandidates: {
        metadata: {
          computedAt: '2025-01-01T00:00:00.000Z',
          windowUTC: {
            fromISO: '2025-01-01T00:00:00.000Z',
            toISO: '2025-01-03T23:59:59.999Z',
          },
        },
        mmdd: [],
      },
    };
    const mockResult: GetAllAnalysesResult = {
      ok: true,
      data: [
        {
          analysis: mockAnalysis,
          cachedAt: '2025-01-01T00:00:00.000Z',
          params: {
            limit: 10,
            offset: 0,
            totalCount: 1,
          },
          key: 'test',
        },
      ],
      stats: {
        size: 1,
        maxEntries: 10,
        ttlMs: 1000,
        oldestEntry: '2025-01-01T00:00:00.000Z',
        newestEntry: '2025-01-01T00:00:00.000Z',
      },
    };
    const spy = vi
      .spyOn(analysisActions, 'getAllAnalyses')
      .mockResolvedValue(mockResult);

    const { result } = renderHook(() => useAllAnalyses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(mockResult);
    });

    expect(spy).toHaveBeenCalledTimes(1);

    // refresh should trigger another fetch
    await waitFor(() => {
      result.current.refresh();
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('sets error state when all analyses fetch throws', async () => {
    vi.spyOn(analysisActions, 'getAllAnalyses').mockRejectedValue(
      new Error('boom-all'),
    );

    const { result } = renderHook(() => useAllAnalyses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('boom-all');
    });
  });
});
