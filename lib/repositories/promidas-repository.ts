/**
 * Server-side prototype cache backed by PROMIDAS's in-memory Repository.
 *
 * #136 / #181: an incremental, drop-in alternative to the app's
 * `prototypeMapStore` + `prototypeRepository` path. Consumers migrate one at a
 * time by switching their import to `app/actions/prototypes-repo.ts`
 * (`prototypes.ts` stays untouched as a fallback). Currently wired: playlist
 * preview name lookups.
 *
 * Design (see #181):
 * - Built via `PromidasRepositoryBuilder` as a server-side module singleton,
 *   `enableEvents: false` (events target interactive WebApp UI; not needed here).
 * - The canonical fetch (~24MB for limit=10000) exceeds the Next.js Data Cache
 *   per-entry limit (2MB) and cannot be cached there, so a `no-store` fetch is
 *   injected and the PROMIDAS in-memory snapshot is the SOLE effective cache
 *   (single-layer; freshness governed by the store `ttlMs`).
 *   Data Cache for Next.js:
 *   https://vercel.com/docs/caching/runtime-cache/data-cache
 * - PROMIDAS does NOT auto-refresh; {@link ensureFreshSnapshot} replicates the
 *   current stale-while-revalidate behavior (block only on cold start; serve
 *   stale + non-awaited background refresh on expiry). Concurrent refreshes are
 *   coalesced by PROMIDAS internally.
 */
import { PromidasRepositoryBuilder } from 'promidas';
import type {
  ProtopediaInMemoryRepository,
  ProtopediaInMemoryRepositoryConfig,
  PrototypeInMemoryStoreConfig,
} from 'promidas';
import type { ProtopediaApiCustomClientConfig } from 'promidas/fetcher';
import type { SnapshotOperationFailure } from 'promidas/repository';
import { LIMIT_DATA_SIZE_BYTES } from 'promidas/store';
import {
  parseSnapshotOperationFailure,
  toLocalizedMessage,
} from 'promidas-utils/repository';

import { logger as baseLogger } from '@/lib/logger.server';
import { promidasLogger } from '@/lib/promidas-logger';
import type { FetchPrototypesResult } from '@/types/prototype-api.types';

/**
 * Module-scoped logger: every line carries `module: 'promidas-repository'`.
 * Each function derives a child with its own `action` for filterable logs.
 */
const repoLogger = baseLogger.child({ module: 'promidas-repository' });

/**
 * In-process snapshot TTL. Override via `PROMIDAS_STORE_TTL_SECONDS`
 * (default 1800 = 30 minutes, matching the current `prototypeMapStore`).
 * Lower it (e.g. 60) to observe refresh behavior in development.
 */
const ttlSecondsRaw = Number.parseInt(
  process.env.PROMIDAS_STORE_TTL_SECONDS ?? '1800',
  10,
);
const STORE_TTL_SECONDS =
  Number.isFinite(ttlSecondsRaw) && ttlSecondsRaw > 0 ? ttlSecondsRaw : 1800;
const STORE_TTL_MS = STORE_TTL_SECONDS * 1_000;

/**
 * Max in-memory snapshot size. The canonical fetch is ~24MB; PROMIDAS's hard
 * cap `LIMIT_DATA_SIZE_BYTES` is 30 MiB (same ceiling as `prototypeMapStore`).
 */
const STORE_MAX_DATA_SIZE_BYTES = LIMIT_DATA_SIZE_BYTES;
/** Connection/header timeout; does not cover body download. */
const CONNECTION_AND_HEADER_TIMEOUT_MS = 30_000;
/** Canonical snapshot size (matches the current canonical fetch). */
const CANONICAL_LIMIT = 10_000;

const accessToken = process.env.PROTOPEDIA_API_V2_TOKEN;
const baseUrl = process.env.PROTOPEDIA_API_V2_BASE_URL;
const validToken =
  accessToken && accessToken !== 'your_token_here'
    ? accessToken
    : 'DUMMY_TOKEN_FOR_BUILD';

/**
 * no-store fetch: the canonical response (~24MB) exceeds the Next.js Data Cache
 * per-entry limit (2MB) and cannot be cached there, so we do not try — the
 * PROMIDAS in-memory snapshot is the cache. Adds a connection/header timeout and
 * composes any incoming AbortSignal.
 *
 * Data Cache for Next.js:
 * https://vercel.com/docs/caching/runtime-cache/data-cache
 */
const noStoreFetch: typeof globalThis.fetch = async (url, init) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    CONNECTION_AND_HEADER_TIMEOUT_MS,
  );
  const callerSignal = init?.signal;
  const onCallerAbort = () => controller.abort(callerSignal?.reason);
  if (callerSignal) {
    if (callerSignal.aborted) {
      onCallerAbort();
    } else {
      callerSignal.addEventListener('abort', onCallerAbort, { once: true });
    }
  }
  try {
    return await globalThis.fetch(url, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
  } finally {
    clearTimeout(timeoutId);
    callerSignal?.removeEventListener('abort', onCallerAbort);
  }
};

/**
 * Build the PROMIDAS store / API client / repository config objects for
 * server-side use. Synchronous: all inputs are env vars and constants (unlike
 * the demo app, which loads user settings asynchronously).
 */
export function createPromidasRepositoryConfigs(overrides?: {
  /**
   * Override download-progress logging (default: `true`). Tests pass `false`:
   * progress tracking reads `response.body.getReader()`, which the jsdom/MSW
   * test responses do not implement (it works in dev/production).
   */
  progressLog?: boolean;
}): {
  storeConfig: PrototypeInMemoryStoreConfig;
  apiClientConfig: ProtopediaApiCustomClientConfig;
  repositoryConfig: ProtopediaInMemoryRepositoryConfig;
} {
  const storeConfig: PrototypeInMemoryStoreConfig = {
    ttlMs: STORE_TTL_MS,
    maxDataSizeBytes: STORE_MAX_DATA_SIZE_BYTES,
    logger: promidasLogger,
  };

  const apiClientConfig: ProtopediaApiCustomClientConfig = {
    protoPediaApiClientOptions: {
      token: validToken,
      baseUrl,
      fetch: noStoreFetch,
      logger: promidasLogger,
    },
    logger: promidasLogger,
    progressLog: overrides?.progressLog ?? true,
  };

  const repositoryConfig: ProtopediaInMemoryRepositoryConfig = {
    enableEvents: false,
    logger: promidasLogger,
  };

  return {
    storeConfig,
    apiClientConfig,
    repositoryConfig,
  };
}

/** Build a PROMIDAS Repository configured for server-side, no-store use. */
export function buildPromidasRepository(options?: {
  progressLog?: boolean;
}): ProtopediaInMemoryRepository {
  const { storeConfig, apiClientConfig, repositoryConfig } =
    createPromidasRepositoryConfigs(options);

  repoLogger.child({ action: 'buildPromidasRepository' }).debug(
    {
      ttlMs: STORE_TTL_MS,
      maxDataSizeBytes: STORE_MAX_DATA_SIZE_BYTES,
      canonicalLimit: CANONICAL_LIMIT,
      hasToken: validToken !== 'DUMMY_TOKEN_FOR_BUILD',
      baseUrl: baseUrl ?? '(sdk default)',
    },
    'Building PROMIDAS Repository',
  );

  return new PromidasRepositoryBuilder()
    .setStoreConfig(storeConfig)
    .setApiClientConfig(apiClientConfig)
    .setRepositoryConfig(repositoryConfig)
    .build();
}

/** Server-side module singleton. */
export const promidasRepository = buildPromidasRepository();

const mapFailureStatus = (failure: SnapshotOperationFailure): number => {
  if (failure.origin === 'fetcher') {
    return failure.status ?? 503;
  }
  return 500;
};

/**
 * Replicate the current stale-while-revalidate behavior:
 * - empty snapshot (cold start) → `await setupSnapshot` (the only blocking case)
 * - expired & non-empty → non-awaited `refreshSnapshot` (serve stale meanwhile)
 *
 * Returns the failure when the cold-start setup fails, otherwise `null`.
 */
export async function ensureFreshSnapshot(
  repo: ProtopediaInMemoryRepository,
): Promise<SnapshotOperationFailure | null> {
  const logger = repoLogger.child({ action: 'ensureFreshSnapshot' });
  const stats = repo.getStats();

  logger.debug({ ...stats }, 'Snapshot stats');

  if (stats.cachedAt === null) {
    logger.info('Snapshot empty; setting up (cold start, blocking)');
    const result = await repo.setupSnapshot({
      limit: CANONICAL_LIMIT,
      offset: 0,
    });

    if (result.ok) {
      logger.info(
        { size: result.stats.size, cachedAt: result.stats.cachedAt },
        'Snapshot setup completed',
      );
      return null;
    } else {
      const parsed = parseSnapshotOperationFailure(result);
      logger.error(
        {
          origin: result.origin,
          message: parsed?.localizedMessage ?? result.message,
        },
        'Snapshot setup failed (cold start)',
      );
      return result;
    }
  }

  if (stats.isExpired) {
    logger.info(
      { size: stats.size, cachedAt: stats.cachedAt },
      'Snapshot expired; scheduling background refresh (serving stale)',
    );
    // TODO(#181): this fires a refresh per request while expired. PROMIDAS
    // coalescing dedupes *overlapping* refreshes, but rapid sequential requests
    // from a single client (e.g. playlist typing) during a FAST upstream
    // failure can each trigger a failing refresh. Consider a per-repo cooldown
    // (minimum refresh interval) on this branch to bound the retry rate.
    void repo.refreshSnapshot().catch((error: unknown) => {
      logger.warn({ error }, 'background refreshSnapshot failed');
    });
  } else {
    logger.debug({ size: stats.size }, 'Snapshot fresh; no refresh needed');
  }

  return null;
}

/**
 * Run a snapshot read after ensuring the snapshot is fresh. Centralizes the
 * "always ensure before reading" rule for every read path: `read` receives the
 * cold-start failure (null on success) so Result-style callers can map it to an
 * error while best-effort callers ignore it.
 */
async function withFreshSnapshot<T>(
  repo: ProtopediaInMemoryRepository,
  read: (failure: SnapshotOperationFailure | null) => Promise<T>,
): Promise<T> {
  const failure = await ensureFreshSnapshot(repo);
  return read(failure);
}

/**
 * Fetch all prototypes via the PROMIDAS Repository, mapped to the app's
 * {@link FetchPrototypesResult} contract.
 */
export async function getAllPrototypesFromRepo(
  repo: ProtopediaInMemoryRepository,
): Promise<FetchPrototypesResult> {
  const logger = repoLogger.child({ action: 'getAllPrototypesFromRepo' });
  return withFreshSnapshot(repo, async (failure) => {
    if (failure) {
      const status = mapFailureStatus(failure);
      logger.warn(
        { status, origin: failure.origin },
        'Failed to ensure snapshot; returning error result',
      );
      return { ok: false, status, error: toLocalizedMessage(failure) };
    }
    const data = await repo.getAllFromSnapshot();
    logger.debug(
      { count: data.length },
      'Returning all prototypes from snapshot',
    );
    return { ok: true, data: [...data] };
  });
}

/**
 * Resolve prototype names for the given ids. Awaits the snapshot setup on cold
 * start so the first lookup returns names (concurrent callers coalesce onto a
 * single fetch); serves stale data while refreshing in the background when
 * expired. Missing ids are omitted (sparse result).
 */
export async function getPrototypeNamesFromRepo(
  repo: ProtopediaInMemoryRepository,
  ids: number[],
): Promise<Record<number, string>> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return {};
  }

  const logger = repoLogger.child({ action: 'getPrototypeNamesFromRepo' });

  // Dedupe only — do NOT pre-validate ids here. promidas is the single source of
  // id validation; the per-id lookup below catches anything it rejects (and logs
  // it), so a redundant filter would only hide bad input.
  const uniqueIds = Array.from(new Set(ids));

  // Best-effort: ignore the cold-start failure (an empty snapshot simply yields
  // no names). withFreshSnapshot still blocks on cold start so the first lookup
  // populates and resolves; expired serves stale + refreshes in the background.
  return withFreshSnapshot(repo, async () => {
    // Resolve each id via the snapshot's O(1) by-id lookup, avoiding the cost of
    // materializing the full snapshot array + a Map just to read a few names.
    // Isolate each lookup: promidas THROWS on an id it rejects (e.g. beyond the
    // safe-integer range), and a single bad id must not reject the whole batch
    // (best-effort), so catch it and omit that id.
    const entries = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const prototype =
            await repo.getPrototypeFromSnapshotByPrototypeId(id);
          return [id, prototype?.prototypeNm] as const;
        } catch (error) {
          logger.warn({ id, error }, 'Skipping id rejected by snapshot lookup');
          return [id, undefined] as const;
        }
      }),
    );

    const result: Record<number, string> = {};
    for (const [id, name] of entries) {
      if (name !== undefined) {
        result[id] = name;
      }
    }

    logger.debug(
      {
        requested: uniqueIds.length,
        found: Object.keys(result).length,
        names: result,
      },
      'Returning snapshot names',
    );

    return result;
  });
}
