'use server';

/**
 * @fileoverview Server actions for retrieving cached prototype analysis data.
 *
 * This module provides functions to access cached analysis results from memory,
 * allowing WebApp components to retrieve analysis insights without re-computation.
 */

import { logger as baseLogger } from '@/lib/logger.server';
import {
  analysisCache,
  type CachedAnalysis,
} from '@/lib/stores/analysis-cache';
import { analysisRepository } from '@/lib/repositories/analysis-repository';
import type { ServerPrototypeAnalysis } from '@/lib/analysis/types';

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
  },
  temporal: {
    releaseTimeDistribution: analysis.releaseTimeDistribution,
    updateTimeDistribution: analysis.updateTimeDistribution,
    creationStreak: analysis.creationStreak,
  },
  insights: {
    maternityHospital: analysis.maternityHospital,
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
  // Delegates to the Analysis Repository, which owns the home fetch + compute +
  // cache. Kept as a server action so existing consumers (the dashboard hook)
  // and the API surface are unchanged.
  return analysisRepository.getHomeAnalysis(options);
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
