'use server';

/**
 * @fileoverview Server actions for fetching prototype data from the ProtoPedia API.
 *
 * This module provides server functions for retrieving prototypes with various filtering options:
 * - Fetch multiple prototypes with pagination
 * - Fetch a random prototype from available results
 * - Fetch a specific prototype by ID
 *
 * All functions return standardized result objects with success/failure indicators
 * and include comprehensive logging for performance monitoring and debugging.
 */

import {
  normalizePrototype,
  type NormalizedPrototype,
  type UpstreamPrototype,
} from '@/lib/api/prototypes';
import { parsePositiveId } from '@/lib/api/validation';
import { logger as baseLogger } from '@/lib/logger.server';
import { protopedia } from '@/lib/protopedia-client';
import { analyzePrototypesForServer } from '@/lib/utils/prototype-analysis.server';
import { analysisCache } from '@/lib/stores/analysis-cache';
import { prototypeMapStore } from '@/lib/stores/prototype-map-store';

/**
 * Parameters for fetching prototypes from the API.
 */
type FetchPrototypesParams = {
  /** Maximum number of prototypes to fetch (default: 50, max: 100) */
  limit?: number;
  /** Number of prototypes to skip for pagination (default: 0) */
  offset?: number;
  /** Specific prototype ID to fetch (if provided, returns only that prototype) */
  prototypeId?: number;
};

/**
 * Successful response from fetchPrototypes containing an array of prototypes.
 */
type FetchPrototypesSuccess = {
  ok: true;
  data: NormalizedPrototype[];
};

/**
 * Failed response from fetchPrototypes with error details.
 */
type FetchPrototypesFailure = {
  ok: false;
  status: number;
  error: string;
};

/**
 * Result type for fetchPrototypes function - either success with data or failure with error.
 */
export type FetchPrototypesResult =
  | FetchPrototypesSuccess
  | FetchPrototypesFailure;

/**
 * Successful response from fetchRandomPrototype containing a single prototype.
 */
type FetchRandomPrototypeSuccess = {
  ok: true;
  data: NormalizedPrototype;
};

/**
 * Failed response from fetchRandomPrototype (same as FetchPrototypesFailure).
 */
type FetchRandomPrototypeFailure = FetchPrototypesFailure;

/**
 * Result type for fetchRandomPrototype function - either success with single prototype or failure.
 */
export type FetchRandomPrototypeResult =
  | FetchRandomPrototypeSuccess
  | FetchRandomPrototypeFailure;

/**
 * Result type for fetchPrototypeById function - either success with single prototype or failure.
 */
export type FetchPrototypeByIdResult =
  | { ok: true; data: NormalizedPrototype }
  | FetchPrototypesFailure;

/** Default limit for prototype fetching from environment variable or fallback to 100 */
const DEFAULT_LIMIT = Number.parseInt(
  process.env.PROTOTYPE_PAGE_LIMIT ?? '100',
  10,
);

/** Maximum allowed limit to prevent excessive API calls */
const MAX_LIMIT = 10_000;

const CANONICAL_FETCH_PARAMS: FetchPrototypesParams = {
  limit: MAX_LIMIT,
  offset: 0,
};

/**
 * Clamps the limit parameter to a valid range.
 *
 * @param limit - The requested limit (optional)
 * @returns A valid limit between 1 and MAX_LIMIT, or DEFAULT_LIMIT if invalid
 */
const clampLimit = (limit?: number) => {
  if (typeof limit !== 'number' || Number.isNaN(limit)) {
    return DEFAULT_LIMIT;
  }
  const integerLimit = Math.floor(limit);
  if (integerLimit <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(integerLimit, MAX_LIMIT);
};

/**
 * Clamps the offset parameter to a valid range.
 *
 * @param offset - The requested offset for pagination (optional)
 * @returns A valid offset >= 0, or 0 if invalid
 */
const clampOffset = (offset?: number) => {
  if (typeof offset !== 'number' || Number.isNaN(offset)) {
    return 0;
  }
  return Math.max(0, Math.floor(offset));
};

/**
 * Validates a prototype ID parameter.
 *
 * @param prototypeId - The prototype ID to validate (optional)
 * @returns Validation result with either the valid ID or an error message
 */
const validatePrototypeId = (prototypeId?: number) => {
  if (prototypeId === undefined) {
    return { ok: true as const, value: undefined };
  }
  if (!Number.isInteger(prototypeId) || prototypeId <= 0) {
    return {
      ok: false as const,
      error: 'Prototype ID must be a positive integer',
    };
  }
  return { ok: true as const, value: prototypeId };
};

/**
 * Fetches prototypes from the ProtoPedia API with optional filtering and pagination.
 *
 * This is the core server function for retrieving prototype data. It supports:
 * - Pagination via limit/offset parameters
 * - Filtering by specific prototype ID
 * - Comprehensive logging and performance monitoring
 * - Automatic parameter validation and clamping
 *
 * @param params - Configuration object for the fetch operation
 * @param params.limit - Maximum number of prototypes to fetch (clamped to 1-10,000, default: 100)
 * @param params.offset - Number of prototypes to skip for pagination (minimum: 0, default: 0)
 * @param params.prototypeId - Specific prototype ID to fetch (if provided, returns only that prototype)
 * @returns Promise resolving to either success with prototype data or failure with error details
 *
 * @see Data Cache for Next.js https://vercel.com/docs/data-cache
 *
 * @remarks
 * ProtoPedia responses can be sizeable. Recent exports (as of 2025/11/01) measured approximately:
 * - 220 KB for 100 prototypes in JSON (TSV ≈ 41 KB)
 * - 2.7 MB for 1,000 prototypes in JSON (TSV ≈ 0.44 MB)
 * - 16.5 MB for 10,000 prototypes in JSON (TSV ≈ 3.3 MB)
 * Consider these sizes when choosing limits for client calls.
 *
 * Next.js data cache only persists payloads up to roughly 2 MB. Requests such as
 * `https://protopedia.net/v2/api/prototype/list?limit=1000&offset=0` exceed that
 * boundary and therefore bypass caching. Favor smaller page sizes when caching is
 * desired.
 * Upstream performance (2025/11/01): the provider returns 100, 1,000, and 10,000 prototype
 * pages in under 10 seconds each; responses for 10,000 items are only ~2–3 seconds slower than
 * those for 1,000 items, indicating sufficient capacity for current usage.
 *
 * @example
 * ```typescript
 * // Fetch first 10 prototypes
 * const result = await fetchPrototypes({ limit: 10, offset: 0 });
 * if (result.ok) {
 *   console.log('Fetched prototypes:', result.data);
 * }
 *
 * // Fetch specific prototype by ID
 * const specific = await fetchPrototypes({ prototypeId: 3877 });
 * if (specific.ok && specific.data.length > 0) {
 *   console.log('Found prototype:', specific.data[0]);
 * }
 * ```
 */
/**
 * Low-level server action that always calls the upstream ProtoPedia API.
 *
 * - Does not read or populate the in-memory map store.
 * - Callers that want to benefit from caching or refresh semantics should
 *   prefer {@link getPrototypesFromCacheOrFetch} instead.
 */
export async function fetchPrototypes(
  params: FetchPrototypesParams = {},
): Promise<FetchPrototypesResult> {
  const logger = baseLogger.child({ action: 'fetchPrototypes' });
  const startTime = performance.now();

  logger.debug({ params }, 'fetchPrototypes called');

  const limit = clampLimit(params.limit);
  const offset = clampOffset(params.offset);
  const prototypeIdValidation = validatePrototypeId(params.prototypeId);

  if (!prototypeIdValidation.ok) {
    logger.debug(
      { prototypeId: params.prototypeId, error: prototypeIdValidation.error },
      'Prototype ID validation failed',
    );
    return {
      ok: false,
      status: 400,
      error: prototypeIdValidation.error,
    };
  }

  const prototypeId = prototypeIdValidation.value;
  logger.debug(
    { limit, offset, prototypeId },
    'Calling protopedia.listPrototypes',
  );

  try {
    const apiCallStart = performance.now();
    const upstream = await protopedia.listPrototypes({
      limit,
      offset,
      prototypeId,
    });
    const apiCallEnd = performance.now();
    const apiElapsedMs = Math.round((apiCallEnd - apiCallStart) * 100) / 100;
    const approxResponseSizeBytes = Buffer.byteLength(
      JSON.stringify(upstream),
      'utf8',
    );

    let sampleLogContext: {
      upstreamSampleSelection: string;
      upstreamSamplePrototypeId: number | null;
      upstreamSamplePrototype: UpstreamPrototype | null;
    } | null = null;

    // Log a sampled prototype from the upstream results for debugging purposes
    if (logger.isLevelEnabled('debug')) {
      const rawResults = Array.isArray(upstream.results)
        ? (upstream.results as UpstreamPrototype[])
        : [];
      let sampledPrototype: UpstreamPrototype | null = null;
      let sampledId = -Infinity;

      for (const candidate of rawResults) {
        if (!candidate || typeof candidate.id !== 'number') {
          continue;
        }

        if (candidate.id > sampledId) {
          sampledId = candidate.id;
          sampledPrototype = candidate;
        }
      }

      sampleLogContext = sampledPrototype
        ? {
            upstreamSampleSelection: 'max-id',
            upstreamSamplePrototypeId: sampledId,
            upstreamSamplePrototype: sampledPrototype,
          }
        : {
            upstreamSampleSelection: 'max-id',
            upstreamSamplePrototypeId: null,
            upstreamSamplePrototype: null,
          };

      logger.debug(sampleLogContext, 'Sampled upstream prototype payload');
    }

    logger.debug(
      {
        apiElapsedMs,
        upstreamResultsCount: Array.isArray(upstream.results)
          ? upstream.results.length
          : 0,
        hasResults: Array.isArray(upstream.results),
        approxResponseSizeBytes,
      },
      'API call completed',
    );

    const normalizeStart = performance.now();
    const normalized = Array.isArray(upstream.results)
      ? upstream.results.map(normalizePrototype)
      : [];
    const normalizeEnd = performance.now();
    const normalizeElapsedMs =
      Math.round((normalizeEnd - normalizeStart) * 100) / 100;

    // Log the normalized sample for comparison
    if (sampleLogContext) {
      const normalizedSample =
        sampleLogContext.upstreamSamplePrototypeId !== null
          ? (normalized.find(
              (prototype) =>
                prototype.id === sampleLogContext?.upstreamSamplePrototypeId,
            ) ?? null)
          : null;

      logger.debug(
        {
          ...sampleLogContext,
          normalizedSamplePrototype: normalizedSample,
        },
        'Sampled prototype after normalization',
      );
    }

    if (prototypeId !== undefined && normalized.length === 0) {
      logger.debug(
        { prototypeId },
        'Specific prototype ID requested but not found',
      );
      return {
        ok: false,
        status: 404,
        error: 'Not found',
      };
    }

    const totalElapsedMs =
      Math.round((performance.now() - startTime) * 100) / 100;
    logger.info(
      {
        params,
        totalElapsedMs,
        apiElapsedMs,
        normalizeElapsedMs,
        resultCount: normalized.length,
        approxResponseSizeBytes,
      },
      'fetchPrototypes completed successfully',
    );

    return {
      ok: true,
      data: normalized,
    };
  } catch (error) {
    const totalElapsedMs =
      Math.round((performance.now() - startTime) * 100) / 100;
    logger.error(
      { limit, offset, prototypeId, error, totalElapsedMs },
      'Failed to fetch prototypes',
    );

    if (typeof error === 'object' && error !== null && 'status' in error) {
      const status = Number((error as { status?: number }).status ?? 500);
      logger.debug(
        { status, errorType: 'HTTP error' },
        'Returning HTTP error response',
      );
      return {
        ok: false,
        status,
        error:
          error instanceof Error ? error.message : 'Failed to fetch prototypes',
      };
    }

    logger.debug(
      { errorType: 'General error' },
      'Returning general error response',
    );
    return {
      ok: false,
      status: 500,
      error:
        error instanceof Error ? error.message : 'Failed to fetch prototypes',
    };
  }
}

/**
 * Cache-aware variant of {@link fetchPrototypes} for list endpoints.
 *
 * Fallback / refresh behavior:
 * - Always calls {@link fetchPrototypes} to retrieve the requested page.
 * - When no specific `prototypeId` is requested and the canonical
 *   snapshot is empty or expired, it schedules a background refresh of
 *   {@link prototypeMapStore} and the analysis cache.
 * - Returns the direct upstream result; callers never see partial or
 *   stale data from the map store.
 */
export async function getPrototypesFromCacheOrFetch(
  params: FetchPrototypesParams = {},
): Promise<FetchPrototypesResult> {
  const logger = baseLogger.child({ action: 'getPrototypesFromCacheOrFetch' });

  logger.info({ params }, 'getPrototypesFromCacheOrFetch called');

  const limit = clampLimit(params.limit);
  const offset = clampOffset(params.offset);
  const prototypeIdValidation = validatePrototypeId(params.prototypeId);

  if (!prototypeIdValidation.ok) {
    logger.debug(
      { prototypeId: params.prototypeId, error: prototypeIdValidation.error },
      'Prototype ID validation failed',
    );
    return {
      ok: false,
      status: 400,
      error: prototypeIdValidation.error,
    };
  }

  const prototypeId = prototypeIdValidation.value;

  const result = await fetchPrototypes({ limit, offset, prototypeId });

  if (result.ok && prototypeId === undefined) {
    const snapshot = prototypeMapStore.getSnapshot();
    const shouldBootstrap = snapshot.data.length === 0;
    const shouldRefresh = shouldBootstrap || snapshot.isExpired;

    if (shouldRefresh && !prototypeMapStore.isRefreshInFlight()) {
      const reason = shouldBootstrap
        ? 'bootstrap-after-page-fetch'
        : 'ttl-expired-on-page-fetch';
      schedulePrototypeMapRefresh(logger, reason);
    }
  }

  if (result.ok) {
    logger.info(
      {
        params,
        resultCount: result.data.length,
      },
      'Fetched prototypes directly from upstream',
    );
  }

  return result;
}

/**
 * Populate {@link prototypeMapStore} and analysis cache from the canonical
 * upstream snapshot.
 *
 * Fallback behavior:
 * - When the upstream request fails or exceeds size limits, the map store
 *   is left unchanged and the error is propagated to the caller.
 */
const populatePrototypeMap = async (
  logger: ReturnType<typeof baseLogger.child>,
  reason: string,
): Promise<FetchPrototypesResult> => {
  logger.info({ reason }, 'Refreshing prototype map store');

  const result = await fetchPrototypes(CANONICAL_FETCH_PARAMS);

  if (!result.ok) {
    logger.warn(
      { reason, status: result.status, error: result.error },
      'Map refresh failed',
    );
    return result;
  }

  const analysisStart = performance.now();
  const analysis = analyzePrototypesForServer(result.data);
  const analysisElapsedMs =
    Math.round((performance.now() - analysisStart) * 100) / 100;

  analysisCache.set(analysis, {
    limit: CANONICAL_FETCH_PARAMS.limit ?? MAX_LIMIT,
    offset: CANONICAL_FETCH_PARAMS.offset ?? 0,
    totalCount: result.data.length,
  });

  logger.info(
    {
      reason,
      analysisElapsedMs,
      analysisTotalCount: analysis.totalCount,
    },
    'Prototype analysis refreshed from canonical snapshot',
  );

  if (result.data.length === 0) {
    prototypeMapStore.clear();
    logger.info({ reason }, 'Prototype map cleared because snapshot was empty');
    return result;
  }

  const metadata = prototypeMapStore.setAll(result.data);

  if (!metadata) {
    logger.warn(
      { reason },
      'Prototype map snapshot skipped due to payload size limit',
    );
    return result;
  }

  logger.info(
    {
      reason,
      count: result.data.length,
      approxSizeBytes: metadata.approxSizeBytes,
      analysisElapsedMs,
    },
    'Prototype map snapshot populated',
  );

  return result;
};

/**
 * Run a map refresh task under the store's exclusive lock.
 *
 * - Ensures only one refresh runs at a time.
 * - Swallows internal errors and surfaces them via the returned
 *   {@link FetchPrototypesResult} when available.
 */
async function runPrototypeMapRefresh(
  logger: ReturnType<typeof baseLogger.child>,
  reason: string,
): Promise<FetchPrototypesResult | null> {
  logger.info({ reason }, 'Attempting prototype map refresh');

  let outcome: FetchPrototypesResult | null = null;

  await prototypeMapStore
    .runExclusive(async () => {
      outcome = await populatePrototypeMap(logger, reason);
    })
    .catch((error) => {
      logger.error({ reason, error }, 'Prototype map refresh task threw');
    });

  return outcome;
}

/**
 * Fire-and-forget helper to schedule a prototype map refresh.
 *
 * - Never throws; errors are logged inside {@link runPrototypeMapRefresh}.
 * - Callers should not depend on the refresh having completed.
 */
function schedulePrototypeMapRefresh(
  logger: ReturnType<typeof baseLogger.child>,
  reason: string,
): void {
  void runPrototypeMapRefresh(logger, reason);
}

/**
 * Fetches a random prototype from the ProtoPedia API.
 *
 * This function leverages fetchPrototypes to retrieve a set of prototypes and then
 * randomly selects one from the results. This approach ensures fairness in random
 * selection while allowing for filtering parameters to be applied to the candidate pool.
 *
 * The random selection is performed server-side for better performance compared to
 * fetching all prototypes and selecting client-side.
 *
 * @param params - Configuration object for the fetch operation
 * @param params.limit - Maximum number of prototypes to consider for random selection (default: 10)
 * @param params.offset - Starting offset for the candidate pool (default: 0)
 * @returns Promise resolving to either success with a single random prototype or failure
 *
 * @example
 * ```typescript
 * // Get a random prototype from first 50 available
 * const result = await fetchRandomPrototype({ limit: 50 });
 * if (result.ok) {
 *   console.log('Random prototype:', result.data);
 * }
 *
 * // Get a random prototype from a different offset range
 * const offsetResult = await fetchRandomPrototype({ limit: 20, offset: 100 });
 * ```
 */
/**
 * Random prototype selection that always uses a fresh upstream page.
 *
 * Fallback behavior:
 * - Delegates to {@link fetchPrototypes} and returns an error result when
 *   the list endpoint fails.
 * - Does not consult or update {@link prototypeMapStore}; callers that
 *   prefer cache-aware behavior should use
 *   {@link getRandomPrototypeFromCacheOrFetch} or
 *   {@link getRandomPrototypeFromMapOrFetch}.
 */
export async function fetchRandomPrototype(
  params: FetchPrototypesParams = {},
): Promise<FetchRandomPrototypeResult> {
  const logger = baseLogger.child({ action: 'fetchRandomPrototype' });
  const startTime = performance.now();

  logger.info({ params }, 'fetchRandomPrototype called');

  const fetchStart = performance.now();
  const result = await fetchPrototypes(params);
  const fetchEnd = performance.now();
  const fetchElapsedMs = Math.round((fetchEnd - fetchStart) * 100) / 100;

  logger.debug(
    {
      fetchElapsedMs,
      resultOk: result.ok,
      resultDataLength: result.ok ? result.data.length : 0,
    },
    'fetchPrototypes completed',
  );

  if (!result.ok) {
    const totalElapsedMs =
      Math.round((performance.now() - startTime) * 100) / 100;
    logger.warn(
      { params, status: result.status, error: result.error, totalElapsedMs },
      'Failed to fetch list',
    );
    return result;
  }

  if (result.data.length === 0) {
    const totalElapsedMs =
      Math.round((performance.now() - startTime) * 100) / 100;
    logger.warn(
      { params, totalElapsedMs },
      'No prototypes available for random selection',
    );
    return {
      ok: false,
      status: 404,
      error: 'No prototypes available',
    };
  }
  const randomSelectionStart = performance.now();
  const randomIndex = Math.floor(Math.random() * result.data.length);
  const prototype = result.data[randomIndex];
  const randomSelectionEnd = performance.now();
  const randomSelectionElapsedMs =
    Math.round((randomSelectionEnd - randomSelectionStart) * 100) / 100;

  const totalElapsedMs =
    Math.round((performance.now() - startTime) * 100) / 100;

  logger.debug(
    {
      randomIndex,
      selectedPrototypeId: prototype.id,
      selectedPrototypeName: prototype.prototypeNm,
      randomSelectionElapsedMs,
      hasMainUrl: Boolean(prototype.mainUrl),
    },
    'Random prototype selected',
  );

  logger.info(
    {
      params,
      count: result.data.length,
      randomIndex,
      prototypeId: prototype.id,
      totalElapsedMs,
      fetchElapsedMs,
      randomSelectionElapsedMs,
    },
    'Selected random prototype',
  );

  return {
    ok: true,
    data: prototype,
  };
}

/**
 * Cache-aware random prototype selection using the Next.js data cache.
 *
 * Fallback behavior:
 * - Delegates to {@link getPrototypesFromCacheOrFetch} to obtain a list
 *   of candidates, benefiting from the data cache where applicable.
 * - When the cached path fails or yields no results, the error is
 *   returned to the caller; no additional upstream retries are performed
 *   here.
 * - This function does not interact with {@link prototypeMapStore}; for
 *   in-memory map based random selection use
 *   {@link getRandomPrototypeFromMapOrFetch} instead.
 */
export async function getRandomPrototypeFromCacheOrFetch(
  params: FetchPrototypesParams = {},
): Promise<FetchRandomPrototypeResult> {
  const logger = baseLogger.child({
    action: 'getRandomPrototypeFromCacheOrFetch',
  });
  const startTime = performance.now();

  logger.info({ params }, 'getRandomPrototypeFromCacheOrFetch called');

  const fetchStart = performance.now();
  const result = await getPrototypesFromCacheOrFetch(params);
  const fetchElapsedMs =
    Math.round((performance.now() - fetchStart) * 100) / 100;

  logger.debug(
    {
      fetchElapsedMs,
      resultOk: result.ok,
      resultDataLength: result.ok ? result.data.length : 0,
    },
    'Cached prototype lookup completed',
  );

  if (!result.ok) {
    const totalElapsedMs =
      Math.round((performance.now() - startTime) * 100) / 100;
    logger.warn(
      { params, status: result.status, error: result.error, totalElapsedMs },
      'Failed to resolve cached list',
    );
    return result;
  }

  if (result.data.length === 0) {
    const totalElapsedMs =
      Math.round((performance.now() - startTime) * 100) / 100;
    logger.warn(
      { params, totalElapsedMs },
      'No prototypes available for random selection',
    );
    return {
      ok: false,
      status: 404,
      error: 'No prototypes available',
    };
  }

  const randomSelectionStart = performance.now();
  const randomIndex = Math.floor(Math.random() * result.data.length);
  const prototype = result.data[randomIndex];
  const randomSelectionElapsedMs =
    Math.round((performance.now() - randomSelectionStart) * 100) / 100;

  const totalElapsedMs =
    Math.round((performance.now() - startTime) * 100) / 100;

  logger.debug(
    {
      randomIndex,
      selectedPrototypeId: prototype.id,
      selectedPrototypeName: prototype.prototypeNm,
      randomSelectionElapsedMs,
      hasMainUrl: Boolean(prototype.mainUrl),
    },
    'Random prototype selected from cache-aware path',
  );

  logger.info(
    {
      params,
      count: result.data.length,
      randomIndex,
      prototypeId: prototype.id,
      totalElapsedMs,
      fetchElapsedMs,
      randomSelectionElapsedMs,
    },
    'Selected random prototype from cache-aware path',
  );

  return {
    ok: true,
    data: prototype,
  };
}

/**
 * Fetches a specific prototype by its ID from the ProtoPedia API.
 *
 * This function provides a convenient way to retrieve a single prototype using its
 * unique identifier. It includes comprehensive input validation, error handling,
 * and performance monitoring.
 *
 * The function performs the following operations:
 * 1. Validates and parses the input ID parameter
 * 2. Calls fetchPrototypes with the specific ID filter
 * 3. Extracts and returns the single prototype from results
 * 4. Provides detailed logging for debugging and monitoring
 *
 * @param idParam - String representation of the prototype ID to fetch
 * @returns Promise resolving to either success with the prototype data or failure with error details
 *
 * @throws Returns error result for invalid ID formats or if prototype is not found
 *
 * @example
 * ```typescript
 * // Fetch prototype with ID 3877
 * const result = await fetchPrototypeById('3877');
 * if (result.ok) {
 *   console.log('Found prototype:', result.data);
 * } else {
 *   console.error('Error:', result.error);
 * }
 *
 * // Handle invalid ID
 * const invalid = await fetchPrototypeById('invalid');
 * // Returns { ok: false, status: 400, error: 'Invalid prototype id' }
 * ```
 */
/**
 * Fetch a single prototype by id directly from the upstream API.
 *
 * Fallback behavior:
 * - Validates `idParam` and immediately returns a 400-style error result
 *   for invalid ids; no API call is made in that case.
 * - Delegates to {@link fetchPrototypes} with `prototypeId`, and
 *   propagates upstream errors directly.
 * - Does not read or update {@link prototypeMapStore}; callers that prefer
 *   cache-aware behavior should use {@link getPrototypeByIdFromMapOrFetch}.
 */
export async function fetchPrototypeById(
  idParam: string,
): Promise<FetchPrototypeByIdResult> {
  const logger = baseLogger.child({ action: 'fetchPrototypeById' });
  const startTime = performance.now();

  logger.info({ idParam }, 'Fetching prototype by id via server function');

  const parsed = parsePositiveId(idParam, logger);
  if (!parsed.ok) {
    logger.warn({ idParam }, 'Prototype id parameter is invalid');
    return {
      ok: false,
      status: parsed.response.status,
      error: 'Invalid prototype id',
    };
  }

  const id = parsed.value;

  const fetchStart = performance.now();
  const result = await fetchPrototypes({
    prototypeId: id,
    limit: 1,
    offset: 0,
  });
  const fetchEnd = performance.now();
  const fetchElapsedMs = Math.round((fetchEnd - fetchStart) * 100) / 100;

  if (!result.ok) {
    const totalElapsedMs =
      Math.round((performance.now() - startTime) * 100) / 100;
    logger.warn(
      {
        id,
        status: result.status,
        error: result.error,
        totalElapsedMs,
        fetchElapsedMs,
      },
      'Failed to fetch by id',
    );
    return result;
  }

  const prototype = result.data[0];

  if (!prototype) {
    logger.info({ id }, 'Prototype not found');
    return {
      ok: false,
      status: 404,
      error: 'Not found',
    };
  }

  const totalElapsedMs =
    Math.round((performance.now() - startTime) * 100) / 100;

  logger.info(
    {
      id,
      totalElapsedMs,
      fetchElapsedMs,
    },
    'Prototype fetched',
  );

  return {
    ok: true,
    data: prototype,
  };
}

/**
 * Resolve the full prototype list using the in-memory map store when
 * available, falling back to a canonical upstream snapshot otherwise.
 *
 * Fallback behavior:
 * - If a non-empty snapshot exists, it is returned immediately and a
 *   background refresh may be scheduled when expired.
 * - When the snapshot is empty, a refresh is attempted via
 *   {@link runPrototypeMapRefresh}. If that fails, the error result is
 *   propagated.
 * - As a last resort, a refreshed snapshot is inspected; if still empty,
 *   a 503-style error is returned.
 */
export async function getAllPrototypesFromMapOrFetch(): Promise<FetchPrototypesResult> {
  const logger = baseLogger.child({ action: 'getAllPrototypesFromMapOrFetch' });

  const snapshot = prototypeMapStore.getSnapshot();

  logger.info(
    {
      snapshotCount: snapshot.data.length,
      snapshotExpired: snapshot.isExpired,
      refreshInFlight: prototypeMapStore.isRefreshInFlight(),
    },
    'Attempting full prototype lookup from map store',
  );

  if (snapshot.data.length > 0) {
    if (snapshot.isExpired) {
      schedulePrototypeMapRefresh(logger, 'ttl-expired');
    }
    logger.info(
      {
        snapshotCount: snapshot.data.length,
        snapshotExpired: snapshot.isExpired,
      },
      'Returning prototype list from snapshot',
    );
    return {
      ok: true,
      data: snapshot.data,
    };
  }

  const refreshResult = await runPrototypeMapRefresh(logger, 'initial-load');

  if (refreshResult !== null) {
    if (!refreshResult.ok) {
      logger.warn(
        {
          status: refreshResult.status,
          error: refreshResult.error,
        },
        'Map refresh failed while resolving prototype list',
      );
      return refreshResult;
    }
    logger.info(
      {
        resultCount: refreshResult.data.length,
      },
      'Returning prototype list from refresh result',
    );
    return refreshResult;
  }

  const refreshedSnapshot = prototypeMapStore.getSnapshot();
  if (refreshedSnapshot.data.length > 0) {
    if (refreshedSnapshot.isExpired) {
      schedulePrototypeMapRefresh(logger, 'ttl-expired-after-populate');
    }
    logger.info(
      {
        snapshotCount: refreshedSnapshot.data.length,
        snapshotExpired: refreshedSnapshot.isExpired,
      },
      'Returning prototype list from refreshed snapshot',
    );
    return {
      ok: true,
      data: refreshedSnapshot.data,
    };
  }

  logger.error(
    'Prototype map unavailable after refresh attempts for full list',
  );
  return {
    ok: false,
    status: 503,
    error: 'Prototype map unavailable',
  };
}

/**
 * Cache-aware lookup for a single prototype by id using the map store.
 *
 * Fallback behavior:
 * - Validates `idParam` and returns a 400-style error result when invalid.
 * - On first lookup, checks {@link prototypeMapStore}; a hit returns
 *   immediately and may trigger a background refresh when the snapshot is
 *   expired.
 * - On miss, attempts a map refresh via {@link runPrototypeMapRefresh} and
 *   checks the refreshed snapshot.
 * - If the refreshed snapshot still does not contain the id but is
 *   populated, a 404-style error is returned.
 * - When the map remains unavailable after refresh attempts, a 503-style
 *   error is returned.
 */
export async function getPrototypeByIdFromMapOrFetch(
  idParam: string,
): Promise<FetchPrototypeByIdResult> {
  const logger = baseLogger.child({ action: 'getPrototypeByIdFromMapOrFetch' });

  const parsed = parsePositiveId(idParam, logger);
  if (!parsed.ok) {
    return {
      ok: false,
      status: parsed.response.status,
      error: 'Invalid prototype id',
    };
  }

  const id = parsed.value;

  const cached = prototypeMapStore.getById(id);
  const snapshot = prototypeMapStore.getSnapshot();

  logger.info(
    {
      id,
      snapshotCount: snapshot.data.length,
      snapshotExpired: snapshot.isExpired,
      hasCachedEntry: Boolean(cached),
    },
    'Attempting prototype lookup by id from map store',
  );

  if (cached) {
    if (snapshot.isExpired) {
      schedulePrototypeMapRefresh(logger, 'ttl-expired-on-id-hit');
    }
    logger.info(
      {
        id,
        prototypeName: cached.prototypeNm,
        snapshotExpired: snapshot.isExpired,
      },
      'Returning cached prototype from snapshot',
    );
    return {
      ok: true,
      data: cached,
    };
  }

  const refreshResult = await runPrototypeMapRefresh(logger, 'id-miss');

  if (refreshResult !== null && !refreshResult.ok) {
    logger.warn(
      {
        id,
        status: refreshResult.status,
        error: refreshResult.error,
      },
      'Map refresh failed while resolving prototype by id',
    );
    return refreshResult;
  }

  const refreshed = prototypeMapStore.getById(id);
  if (refreshed) {
    const refreshedSnapshot = prototypeMapStore.getSnapshot();
    if (refreshedSnapshot.isExpired) {
      schedulePrototypeMapRefresh(logger, 'ttl-expired-after-id-refresh');
    }
    logger.info(
      {
        id,
        prototypeName: refreshed.prototypeNm,
        snapshotExpired: refreshedSnapshot.isExpired,
      },
      'Returning cached prototype after refresh',
    );
    return {
      ok: true,
      data: refreshed,
    };
  }

  if (refreshResult !== null && refreshResult.ok) {
    logger.info(
      {
        id,
        totalCount: refreshResult.data.length,
      },
      'Prototype not found in refreshed snapshot',
    );
    return {
      ok: false,
      status: 404,
      error: 'Not found',
    };
  }

  const latestSnapshot = prototypeMapStore.getSnapshot();
  if (latestSnapshot.data.length > 0) {
    logger.info(
      {
        id,
        snapshotCount: latestSnapshot.data.length,
      },
      'Prototype missing from populated snapshot',
    );
    return {
      ok: false,
      status: 404,
      error: 'Not found',
    };
  }

  logger.error({ id }, 'Prototype map unavailable while resolving by id');
  return {
    ok: false,
    status: 503,
    error: 'Prototype map unavailable',
  };
}

/**
 * Cache-aware random prototype selection backed by {@link prototypeMapStore}.
 *
 * Fallback behavior:
 * - First attempts {@link prototypeMapStore.getRandom} from the current
 *   snapshot. On hit, may schedule a background refresh when the snapshot
 *   is expired.
 * - On miss, runs a map refresh via {@link runPrototypeMapRefresh} and
 *   retries {@link prototypeMapStore.getRandom}.
 * - If the refreshed snapshot is still empty but the refresh succeeded,
 *   returns a 404-style "No prototypes available" error.
 * - As a final fallback when a non-empty refresh result is available but
 *   cannot be stored in the map (e.g. size constraints), a random entry
 *   from the refreshed list is returned.
 * - When the map remains unavailable after all attempts, a 503-style error
 *   is returned.
 */
export async function getRandomPrototypeFromMapOrFetch(): Promise<FetchRandomPrototypeResult> {
  const logger = baseLogger.child({
    action: 'getRandomPrototypeFromMapOrFetch',
  });

  const snapshot = prototypeMapStore.getSnapshot();
  const cached = prototypeMapStore.getRandom();

  logger.info(
    {
      snapshotCount: snapshot.data.length,
      snapshotExpired: snapshot.isExpired,
      hasCachedCandidate: Boolean(cached),
    },
    'Attempting random prototype lookup from map store',
  );

  if (cached) {
    if (snapshot.isExpired) {
      schedulePrototypeMapRefresh(logger, 'ttl-expired-on-random-hit');
    }
    logger.info(
      {
        prototypeId: cached.id,
        prototypeName: cached.prototypeNm,
        snapshotExpired: snapshot.isExpired,
      },
      'Returning cached random prototype from snapshot',
    );
    return {
      ok: true,
      data: cached,
    };
  }

  logger.warn('No cached candidate available; refreshing snapshot');
  const refreshResult = await runPrototypeMapRefresh(logger, 'random-miss');

  if (refreshResult !== null && !refreshResult.ok) {
    logger.warn(
      {
        status: refreshResult.status,
        error: refreshResult.error,
      },
      'Map refresh failed while resolving random prototype',
    );
    return refreshResult;
  }

  const refreshed = prototypeMapStore.getRandom();
  if (refreshed) {
    const refreshedSnapshot = prototypeMapStore.getSnapshot();
    if (refreshedSnapshot.isExpired) {
      schedulePrototypeMapRefresh(logger, 'ttl-expired-after-random-refresh');
    }
    logger.info(
      {
        prototypeId: refreshed.id,
        prototypeName: refreshed.prototypeNm,
        snapshotExpired: refreshedSnapshot.isExpired,
      },
      'Returning cached random prototype after refresh',
    );
    return {
      ok: true,
      data: refreshed,
    };
  }

  if (refreshResult !== null && refreshResult.ok) {
    if (refreshResult.data.length === 0) {
      logger.warn(
        'Map refresh succeeded but returned no prototypes for random selection',
      );
      return {
        ok: false,
        status: 404,
        error: 'No prototypes available',
      };
    }

    const randomIndex = Math.floor(Math.random() * refreshResult.data.length);
    const fallbackPrototype = refreshResult.data[randomIndex];

    logger.info(
      {
        prototypeId: fallbackPrototype.id,
        prototypeName: fallbackPrototype.prototypeNm,
        randomIndex,
        totalCount: refreshResult.data.length,
      },
      'Returning random prototype from direct refresh result',
    );

    return {
      ok: true,
      data: fallbackPrototype,
    };
  }

  logger.error('Prototype map unavailable after refresh attempts');
  return {
    ok: false,
    status: 503,
    error: 'Prototype map unavailable',
  };
}

/**
 * Return the highest prototype identifier currently cached, or null when unavailable.
 */
/**
 * Return the highest prototype id currently cached in the map store.
 *
 * Fallback behavior:
 * - Never triggers a refresh by itself; it only observes
 *   {@link prototypeMapStore.getSnapshot} and {@link prototypeMapStore.getMaxId}.
 * - When no id is available, returns `null` and logs a warning instead of
 *   attempting an upstream fetch.
 */
export async function getMaxPrototypeId(): Promise<number | null> {
  const logger = baseLogger.child({ action: 'getMaxPrototypeId' });

  const snapshot = prototypeMapStore.getSnapshot();

  logger.info(
    {
      snapshotCount: snapshot.data.length,
      snapshotExpired: snapshot.isExpired,
    },
    'Resolving max prototype id from map snapshot',
  );

  const maxId = prototypeMapStore.getMaxId();

  if (maxId !== null) {
    logger.info(
      {
        maxId,
        snapshotExpired: snapshot.isExpired,
        snapshotCount: snapshot.data.length,
      },
      'Returning max prototype id from snapshot',
    );
    return maxId;
  }

  logger.warn(
    {
      snapshotExpired: snapshot.isExpired,
      snapshotCount: snapshot.data.length,
    },
    'Prototype map empty, max prototype id unavailable',
  );
  return null;
}

/**
 * Resolve prototype names for the given ids using only the server-side map store.
 *
 * - Does NOT perform any upstream API fetches.
 * - Returns a sparse mapping: ids missing from the store are simply omitted.
 *   Callers should handle missing entries (e.g. show "unknown (cache not available)").
 */
export async function getPrototypeNamesFromStore(
  ids: number[],
): Promise<Record<number, string>> {
  const logger = baseLogger.child({ action: 'getPrototypeNamesFromStore' });

  if (!Array.isArray(ids) || ids.length === 0) {
    return {};
  }

  const snapshot = prototypeMapStore.getSnapshot();

  logger.info(
    {
      requestedCount: ids.length,
      snapshotCount: snapshot.data.length,
      snapshotExpired: snapshot.isExpired,
    },
    'Resolving prototype names from map snapshot',
  );

  const uniqueIds = Array.from(
    new Set(ids.filter((id) => Number.isInteger(id) && id > 0)),
  );

  const result: Record<number, string> = {};

  for (const id of uniqueIds) {
    const prototype = prototypeMapStore.getById(id);
    if (prototype) {
      result[id] = prototype.prototypeNm;
    }
  }

  logger.info(
    {
      requestedCount: uniqueIds.length,
      resolvedCount: Object.keys(result).length,
      snapshotExpired: snapshot.isExpired,
    },
    'Resolved prototype names from map snapshot',
  );

  if (snapshot.isExpired && !prototypeMapStore.isRefreshInFlight()) {
    schedulePrototypeMapRefresh(logger, 'ttl-expired-on-name-lookup');
  }

  return result;
}
