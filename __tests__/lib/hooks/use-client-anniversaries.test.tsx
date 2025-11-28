import { renderHook, waitFor } from '@testing-library/react';

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useClientAnniversaries } from '@/lib/hooks/use-client-anniversaries';
import * as analysisClient from '@/lib/analysis/entrypoints/client';
import type { ServerPrototypeAnalysis } from '@/lib/analysis/types';
import type { AnniversariesSlice } from '@/lib/analysis/types';

describe('useClientAnniversaries', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const baseServerAnalysis: ServerPrototypeAnalysis = {
    totalCount: 2,
    statusDistribution: {},
    prototypesWithAwards: 0,
    topTags: [],
    topMaterials: [],
    averageAgeInDays: 0,
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
      mmdd: [
        { id: 1, title: 'p1', releaseDate: '2020-01-01T00:00:00.000Z' },
        { id: 2, title: 'p2', releaseDate: '2020-01-02T00:00:00.000Z' },
      ],
    },
    createTimeDistribution: { dayOfWeek: [], hour: [], heatmap: [] },
    createDateDistribution: { month: [], year: {}, daily: {} },
    releaseTimeDistribution: { dayOfWeek: [], hour: [], heatmap: [] },
    releaseDateDistribution: { month: [], year: {}, daily: {} },
    updateTimeDistribution: { dayOfWeek: [], hour: [], heatmap: [] },
    updateDateDistribution: { month: [], year: {}, daily: {} },
    creationStreak: {
      currentStreak: 0,
      longestStreak: 0,
      longestStreakEndDate: null,
      totalActiveDays: 0,
    },
    earlyAdopters: [],
    firstPenguins: [],
    starAlignments: [],
    anniversaryEffect: [],
    laborOfLove: { longestGestation: [], distribution: {} },
    maternityHospital: { topEvents: [], independentRatio: 0 },
    powerOfDeadlines: { spikes: [] },
    weekendWarrior: {
      weekendHourlyCounts: [],
      totalWeekendCount: 0,
    },
    holyDay: { topDays: [] },
    longTermEvolution: {
      longestMaintenance: [],
      averageMaintenanceDays: 0,
      maintenanceRatio: 0,
    },
    _debugMetrics: {},
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
    const mockAnniversaries: AnniversariesSlice = {
      birthdayCount: 1,
      birthdayPrototypes: [
        {
          id: 1,
          title: 'p1',
          years: 1,
          releaseDate: '2020-01-01T00:00:00.000Z',
        },
      ],
      newbornCount: 0,
      newbornPrototypes: [],
    };
    const spy = vi.spyOn(analysisClient, 'analyzeCandidates').mockReturnValue({
      anniversaries: mockAnniversaries,
    });

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
    const mockAnniversaries: AnniversariesSlice = {
      birthdayCount: 1,
      birthdayPrototypes: [
        {
          id: 1,
          title: 'p1',
          years: 1,
          releaseDate: '2020-01-01T00:00:00.000Z',
        },
      ],
      newbornCount: 0,
      newbornPrototypes: [],
    };
    const spy = vi.spyOn(analysisClient, 'analyzeCandidates').mockReturnValue({
      anniversaries: mockAnniversaries,
    });

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
