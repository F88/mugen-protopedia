'use server';

/**
 * @fileoverview Server actions for retrieving cached prototype analysis data.
 *
 * This module provides functions to access cached analysis results from memory,
 * allowing WebApp components to retrieve analysis insights without re-computation.
 */

import { getAllPrototypesFromMapOrFetch } from '@/app/actions/prototypes';
import { logger as baseLogger } from '@/lib/logger';
import {
  analysisCache,
  type CachedAnalysis,
} from '@/lib/stores/analysis-cache';
import type { PrototypeAnalysis } from '@/lib/utils/prototype-analysis';
import { analyzePrototypes } from '@/lib/utils/prototype-analysis';

/**
 * Successful response containing analysis data
 */
type GetAnalysisSuccess = {
  ok: true;
  data: PrototypeAnalysis;
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
    analysis: PrototypeAnalysis;
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
export async function getLatestAnalysis(): Promise<GetAnalysisResult> {
  const logger = baseLogger.child({ action: 'getLatestAnalysis' });
  const startTime = performance.now();

  logger.debug('Getting latest analysis from cache');

  let cached = analysisCache.getLatest();

  if (!cached) {
    const hydrationStart = performance.now();
    logger.debug(
      'No cached analysis found, attempting to hydrate from prototype map',
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
        const analysis = analyzePrototypes(hydrateResult.data);
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
    },
    'Latest analysis retrieved from cache',
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
