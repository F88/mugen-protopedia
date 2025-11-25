'use server';

/**
 * @fileoverview Server actions for retrieving cached prototype analysis data.
 *
 * This module provides functions to access cached analysis results from memory,
 * allowing WebApp components to retrieve analysis insights without re-computation.
 */

import { getAllPrototypesFromMapOrFetch } from '@/app/actions/prototypes';
import { logger as baseLogger } from '@/lib/logger.server';
import {
  analysisCache,
  type CachedAnalysis,
} from '@/lib/stores/analysis-cache';
import { analyzePrototypesForServer } from '@/lib/utils/prototype-analysis.server';
import type { ServerPrototypeAnalysis } from '@/lib/utils/prototype-analysis.types';

/**
 * Successful response containing analysis data
 */
type GetAnalysisSuccess = {
  ok: true;
  data: ServerPrototypeAnalysis;
  cachedAt: string;
  params: {
    limit: number;
    offset: number;
    totalCount: number;
  };
};

/**
 * Failed response when no analysis is available
 */
type GetAnalysisFailure = {
  ok: false;
  error: string;
};

/**
 * Result type for analysis retrieval functions
 */
export type GetAnalysisResult = GetAnalysisSuccess | GetAnalysisFailure;

/**
 * Successful response containing all cached analyses
 */
type GetAllAnalysesSuccess = {
  ok: true;
  data: Array<{
    analysis: ServerPrototypeAnalysis;
    cachedAt: string;
    params: {
      limit: number;
      offset: number;
      totalCount: number;
    };
    key: string;
  }>;
  stats: {
    size: number;
    maxEntries: number;
    ttlMs: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  };
};

/**
 * Result type for getting all analyses
 */
export type GetAllAnalysesResult = GetAllAnalysesSuccess;

/**
 * Convert cached analysis to serializable format
 */
const serializeCachedAnalysis = (cached: CachedAnalysis) => ({
  analysis: cached.analysis,
  cachedAt: cached.cachedAt.toISOString(),
  params: cached.params,
  key: cached.key,
});

const pad2 = (value: number) => (value < 10 ? `0${value}` : String(value));

const buildTimezoneSnapshot = (now: Date) => {
  const tz = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'unknown';
    } catch {
      return 'unknown';
    }
  })();
  const offsetMin = -now.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMin);
  const offset = `${sign}${pad2(Math.trunc(absMin / 60))}:${pad2(absMin % 60)}`;

  return {
    timeZone: tz,
    offsetMinutes: offsetMin,
    offset,
    nowUTC: now.toISOString(),
    nowLocal: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}T${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}${offset}`,
    todayLocalYMD: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
    todayUTCYMD: now.toISOString().slice(0, 10),
  };
};

const buildAnalysisSummary = (
  analysis: ServerPrototypeAnalysis,
  elapsedMs: number,
) => ({
  totalCount: analysis.totalCount,
  statusKinds: Object.keys(analysis.statusDistribution).length,
  uniqueTags: analysis.topTags.length,
  uniqueTeams: analysis.topTeams.length,
  averageAgeInDays: analysis.averageAgeInDays,
  elapsedMs,
});

const buildAnalysisDebugSample = (analysis: ServerPrototypeAnalysis) => ({
  overview: {
    totalCount: analysis.totalCount,
    analyzedAt: analysis.analyzedAt,
    averageAgeInDays: analysis.averageAgeInDays,
    prototypesWithAwards: analysis.prototypesWithAwards,
    statusDistribution: analysis.statusDistribution,
  },
  rankings: {
    topTags: analysis.topTags,
    topMaterials: analysis.topMaterials,
    topTeams: analysis.topTeams,
  },
  temporal: {
    yearDistribution: analysis.yearDistribution,
    releaseTimeDistribution: analysis.releaseTimeDistribution,
    updateTimeDistribution: analysis.updateTimeDistribution,
    creationStreak: analysis.creationStreak,
  },
  insights: {
    earlyAdopters: analysis.earlyAdopters,
    firstPenguins: analysis.firstPenguins,
    starAlignments: analysis.starAlignments,
    anniversaryEffect: analysis.anniversaryEffect,
    laborOfLove: analysis.laborOfLove,
    maternityHospital: analysis.maternityHospital,
    powerOfDeadlines: analysis.powerOfDeadlines,
    weekendWarrior: analysis.weekendWarrior,
    holyDay: analysis.holyDay,
  },
  technical: {
    anniversaryCandidates: analysis.anniversaryCandidates,
    _debugMetrics: analysis._debugMetrics,
  },
});

const logAnalysisDebugSample = (
  logger: Pick<typeof baseLogger, 'debug'>,
  analysis: ServerPrototypeAnalysis,
  message: string,
  failureMessage: string,
) => {
  try {
    logger.debug({ analysis: buildAnalysisDebugSample(analysis) }, message);
  } catch (err) {
    logger.debug({ err }, failureMessage);
  }
};

/**
 * Get the most recent analysis from cache.
 *
 * This function retrieves the latest analysis result regardless of the parameters
 * used to generate it. Useful for displaying general statistics on dashboard.
 *
 * @returns Promise resolving to the latest analysis or error if none available
 *
 * @example
 * ```typescript
 * const result = await getLatestAnalysis();
 * if (result.ok) {
 *   console.log('Latest analysis:', result.data);
 *   console.log('Cached at:', result.cachedAt);
 * }
 * ```
 */
export async function getLatestAnalysis(options?: {
  forceRecompute?: boolean;
}): Promise<GetAnalysisResult> {
  const logger = baseLogger.child({ action: 'getLatestAnalysis' });
  const startTime = performance.now();

  const forceRecompute = options?.forceRecompute === true;
  logger.debug(
    { forceRecompute },
    'Getting latest analysis (cache + recompute control)',
  );

  let cached: CachedAnalysis | null = null;
  let computedDuringCall = false;

  if (!forceRecompute) {
    cached = analysisCache.getLatest();
  }

  if (!cached) {
    const hydrationStart = performance.now();
    logger.debug(
      forceRecompute
        ? 'Force recompute requested, hydrating prototype map'
        : 'No cached analysis found, attempting to hydrate from prototype map',
    );

    const hydrateResult = await getAllPrototypesFromMapOrFetch();
    const hydrationElapsedMs =
      Math.round((performance.now() - hydrationStart) * 100) / 100;

    if (!hydrateResult.ok) {
      logger.warn(
        {
          status: hydrateResult.status,
          error: hydrateResult.error,
          hydrationElapsedMs,
        },
        'Failed to hydrate analysis from prototype map',
      );
    } else {
      logger.info(
        {
          count: hydrateResult.data.length,
          hydrationElapsedMs,
        },
        'Prototype map hydrated while retrieving latest analysis',
      );

      if (hydrateResult.data.length > 0) {
        const analysisStart = performance.now();
        const analysis = analyzePrototypesForServer(hydrateResult.data, {
          logger,
        });
        const analysisElapsedMs =
          Math.round((performance.now() - analysisStart) * 100) / 100;

        analysisCache.set(analysis, {
          limit: hydrateResult.data.length,
          offset: 0,
          totalCount: hydrateResult.data.length,
        });

        logger.info(
          {
            analysisTotalCount: analysis.totalCount,
            analysisElapsedMs,
          },
          'Generated analysis during cache hydration',
        );
        computedDuringCall = true;
      }
    }

    cached = analysisCache.getLatest();
  }

  if (!cached) {
    logger.debug('No analysis found in cache after hydration attempt');
    return {
      ok: false,
      error: 'No analysis available in cache',
    };
  }

  const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;

  logger.info(
    {
      totalCount: cached.analysis.totalCount,
      cachedAt: cached.cachedAt,
      elapsedMs,
      hasReleaseTimeDistribution: !!cached.analysis.releaseTimeDistribution, // DEBUG
    },
    'Latest analysis retrieved from cache',
  );

  // Emit a summary log even when using cached analysis (to mirror the
  // analyzePrototypes info line) if we did not compute it during this call.
  if (!computedDuringCall) {
    const now = new Date();
    logger.info(
      {
        environment: { runtime: 'server', source: 'cache' },
        timezone: buildTimezoneSnapshot(now),
        summary: buildAnalysisSummary(cached.analysis, elapsedMs),
      },
      'Prototype analysis completed (timezone + summary)',
    );
  }
  logAnalysisDebugSample(
    logger,
    cached.analysis,
    'Returning latest analysis payload',
    'Failed to build debug sample for latest analysis',
  );
  return {
    ok: true,
    data: cached.analysis,
    cachedAt: cached.cachedAt.toISOString(),
    params: cached.params,
  };
}

/**
 * Get analysis for specific parameters from cache.
 *
 * This function retrieves analysis results for exact parameter matches.
 * Useful when you need analysis for specific limit/offset combinations.
 *
 * @param params - Parameters to match against cached analyses
 * @returns Promise resolving to matching analysis or error if not found
 *
 * @example
 * ```typescript
 * const result = await getAnalysisForParams({
 *   limit: 100,
 *   offset: 0,
 *   totalCount: 100
 * });
 * if (result.ok) {
 *   console.log('Matching analysis:', result.data);
 * }
 * ```
 */
export async function getAnalysisForParams(params: {
  limit: number;
  offset: number;
  totalCount: number;
}): Promise<GetAnalysisResult> {
  const logger = baseLogger.child({ action: 'getAnalysisForParams' });
  const startTime = performance.now();

  logger.debug({ params }, 'Getting analysis for specific parameters');

  const cached = analysisCache.get(params);

  if (!cached) {
    logger.debug({ params }, 'No matching analysis found in cache');
    return {
      ok: false,
      error: 'No matching analysis found in cache',
    };
  }

  const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;

  logger.info(
    {
      params,
      totalCount: cached.analysis.totalCount,
      cachedAt: cached.cachedAt,
      elapsedMs,
    },
    'Matching analysis retrieved from cache',
  );

  logAnalysisDebugSample(
    logger,
    cached.analysis,
    'Returning parameter-specific analysis payload',
    'Failed to build debug sample for parameter analysis',
  );

  return {
    ok: true,
    data: cached.analysis,
    cachedAt: cached.cachedAt.toISOString(),
    params: cached.params,
  };
}

/**
 * Get all cached analyses with statistics.
 *
 * This function retrieves all available analyses from cache along with
 * cache statistics. Useful for administrative interfaces or debugging.
 *
 * @returns Promise resolving to all cached analyses and statistics
 *
 * @example
 * ```typescript
 * const result = await getAllAnalyses();
 * console.log('Total cached:', result.data.length);
 * console.log('Cache stats:', result.stats);
 *
 * result.data.forEach(item => {
 *   console.log(`Analysis from ${item.cachedAt}:`, item.analysis.totalCount);
 * });
 * ```
 */
export async function getAllAnalyses(): Promise<GetAllAnalysesResult> {
  const logger = baseLogger.child({ action: 'getAllAnalyses' });
  const startTime = performance.now();

  logger.debug('Getting all cached analyses');

  const cached = analysisCache.getAll();
  const stats = analysisCache.getStats();

  const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;

  logger.info(
    {
      count: cached.length,
      cacheSize: stats.size,
      elapsedMs,
    },
    'All analyses retrieved from cache',
  );

  // Debug-level aggregated snapshot (limit to first few entries)
  try {
    const summaries = cached.slice(0, 3).map((c) => ({
      key: c.key,
      cachedAt: c.cachedAt.toISOString(),
      totalCount: c.analysis.totalCount,
    }));
    logger.debug(
      {
        summaries,
        stats: {
          size: stats.size,
          maxEntries: stats.maxEntries,
          ttlMs: stats.ttlMs,
        },
      },
      'Returning all cached analyses payload (summary only)',
    );
  } catch (err) {
    logger.debug({ err }, 'Failed to build debug summaries for all analyses');
  }

  return {
    ok: true,
    data: cached.map(serializeCachedAnalysis),
    stats: {
      ...stats,
      oldestEntry: stats.oldestEntry?.toISOString() ?? null,
      newestEntry: stats.newestEntry?.toISOString() ?? null,
    },
  };
}

/**
 * Clear all cached analyses.
 *
 * This function removes all analyses from the cache. Use with caution
 * as it will force re-computation on next analysis requests.
 *
 * @returns Promise resolving to success confirmation
 *
 * @example
 * ```typescript
 * await clearAnalysisCache();
 * console.log('Cache cleared successfully');
 * ```
 */
export async function clearAnalysisCache(): Promise<{
  ok: true;
  message: string;
}> {
  const logger = baseLogger.child({ action: 'clearAnalysisCache' });

  logger.info('Clearing analysis cache');

  analysisCache.clear();

  logger.info('Analysis cache cleared successfully');

  return {
    ok: true,
    message: 'Analysis cache cleared successfully',
  };
}
