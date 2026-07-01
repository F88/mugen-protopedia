/**
 * Server-side prototype repository backed by PROMIDAS's in-memory Repository.
 *
 * #136 / #181: an incremental, drop-in alternative to the app's
 * `prototypeMapStore` path. Consumers reach it through
 * `app/actions/prototypes-gateway.ts`, which selects this or the legacy backend
 * by the `USE_PROMIDAS_REPOSITORY` flag (`prototypes.ts` stays untouched).
 *
 * {@link PromidasBackedRepository} is a thin app-level adapter over a PROMIDAS
 * `ProtopediaInMemoryRepository` (injected via the constructor for testability).
 * It is NOT an implementation of the app's `PrototypeRepository` interface — its
 * read surface (`getAllPrototypes` / `getPrototypeNames` / `getMaxPrototypeId` /
 * `getPrototypeById` / `getRandomPrototype`) differs intentionally.
 *
 * Design (see #181):
 * - The canonical fetch (~24MB for limit=10000) exceeds the Next.js Data Cache
 *   per-entry limit (2MB) and cannot be cached there, so a `no-store` fetch is
 *   injected and the PROMIDAS in-memory snapshot is the SOLE effective cache
 *   (single-layer; freshness governed by the store `ttlMs`).
 *   Data Cache for Next.js:
 *   https://vercel.com/docs/caching/runtime-cache/data-cache
 * - PROMIDAS does NOT auto-refresh; `PromidasBackedRepository` replicates the
 *   current stale-while-revalidate behavior via `ensureReady` (readiness: block
 *   only on cold start) + `revalidateIfStale` (freshness: non-awaited background
 *   refresh on expiry while serving stale). Concurrent refreshes are coalesced
 *   by PROMIDAS internally.
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

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { logger as baseLogger } from '@/lib/logger.server';
import { promidasLogger } from '@/lib/promidas-logger';
import type { FetchPrototypesResult } from '@/types/prototype-api.types';

/**
 * Module-scoped logger: every line carries `module: 'promidas-repository'`.
 * Each method derives a child with its own `action` for filterable logs.
 */
const repoLogger = baseLogger.child({ module: 'promidas-repository' });

/**
 * In-process snapshot TTL. Override via `PROMIDAS_STORE_TTL_SECONDS`
 * (default 600 = 10 minutes, matching the current `prototypeMapStore`).
 * Lower it (e.g. 60) to observe refresh behavior in development.
 */
const ttlSecondsRaw = Number.parseInt(
  process.env.PROMIDAS_STORE_TTL_SECONDS ?? '600',
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
/**
 * Minimum interval between background refresh attempts on an expired snapshot.
 * Bounds the retry rate so a burst of expired reads (e.g. playlist typing)
 * during a fast upstream failure cannot trigger a refresh storm.
 *
 * Linked to the TTL: never exceeds it (a short TTL — e.g. 30s in dev — would
 * otherwise be starved of refreshes between expiry and cooldown), but capped at
 * 60s so a transient failure under a long TTL (30min default) still retries
 * within a minute instead of waiting a full cycle.
 */
const REFRESH_COOLDOWN_MS = Math.min(STORE_TTL_MS, 60_000);

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

const mapFailureStatus = (failure: SnapshotOperationFailure): number => {
  if (failure.origin === 'fetcher') {
    return failure.status ?? 503;
  }
  return 500;
};

/**
 * App-level read adapter over a PROMIDAS `ProtopediaInMemoryRepository`.
 *
 * Owns the snapshot lifecycle so reads do not have to: every read goes through
 * {@link ensureReady}, which on a cold start awaits a SINGLE shared setup
 * (concurrent reads coalesce onto one `setupSnapshot` at the app level, instead
 * of each firing its own and relying on PROMIDAS's internal dedupe), and on
 * expiry fires a bounded background refresh (single-flight + cooldown) while
 * serving stale data.
 *
 * The repo is injected via the constructor so tests can build isolated repos
 * (cold / populated / expired) per case; production uses the
 * {@link promidasBackedRepository} singleton.
 */
export class PromidasBackedRepository {
  /**
   * In-flight cold-start setup, shared by all concurrent reads (single-flight):
   * the first cold read creates it, the rest await the same promise, so
   * `setupSnapshot` runs at most once. Cleared on settle so a failed setup can
   * be retried by a later read.
   */
  private setupPromise: Promise<SnapshotOperationFailure | null> | null = null;

  /** In-flight background refresh, if any (single-flight, non-blocking). */
  private refreshPromise: Promise<void> | null = null;

  /** Epoch ms of the last refresh attempt; rate-limits the expired branch. */
  private lastRefreshAttemptAt = 0;

  constructor(private readonly repo: ProtopediaInMemoryRepository) {}

  /**
   * Readiness: ensure the snapshot HAS data to read. On a cold start (empty),
   * await a SINGLE shared `setupSnapshot` (the only blocking case; concurrent
   * reads coalesce onto one setup at the app level); otherwise return at once.
   * This does NOT concern freshness — a non-empty-but-expired snapshot is
   * "ready" (readable) and left to {@link revalidateIfStale}.
   *
   * Returns the failure when the cold-start setup fails, otherwise `null`.
   */
  private async ensureReady(): Promise<SnapshotOperationFailure | null> {
    const logger = repoLogger.child({ action: 'ensureReady' });
    const stats = this.repo.getStats();
    logger.debug(
      `Snapshot: cachedAt: ${stats.cachedAt?.toISOString()} isExpired: ${stats.isExpired} remainingTtlMs: ${stats.remainingTtlMs}ms`,
    );

    if (stats.cachedAt === null) {
      logger.info('Snapshot empty');
      // Single-flight: create the setup once; all concurrent cold reads await it.
      this.setupPromise ??= this.runSetup();
      return this.setupPromise;
    }

    return null;
  }

  /**
   * Run the cold-start setup once, clearing `setupPromise` on settle: on success
   * the snapshot is warm (so `ensureReady` skips the cold branch anyway); on
   * failure it stays cold, so clearing lets the next read retry instead of
   * replaying the cached failure forever.
   */
  private runSetup(): Promise<SnapshotOperationFailure | null> {
    const logger = repoLogger.child({ action: 'setupSnapshot' });
    logger.info('Snapshot setup');

    const run = (async (): Promise<SnapshotOperationFailure | null> => {
      const result = await this.repo.setupSnapshot({
        limit: CANONICAL_LIMIT,
        offset: 0,
      });
      if (result.ok) {
        logger.info(
          { size: result.stats.size, cachedAt: result.stats.cachedAt },
          'Snapshot setup completed',
        );
        return null;
      }
      const parsed = parseSnapshotOperationFailure(result);
      logger.error(
        {
          origin: result.origin,
          message: parsed?.localizedMessage ?? result.message,
        },
        'Snapshot setup failed (cold start)',
      );
      return result;
    })();

    // Clear on settle so a failed setup can be retried (see above). The returned
    // `run` is what callers await, so the real error still surfaces there; this
    // detached .finally() chain only manages state, so swallow its rejection to
    // avoid an unhandled rejection if setupSnapshot throws (vs. returns failure).
    void run
      .finally(() => {
        this.setupPromise = null;
      })
      .catch(() => {});

    return run;
  }

  /**
   * Freshness: if the snapshot is non-empty but expired, fire a background
   * refresh (stale-while-revalidate). Non-blocking — callers keep serving the
   * stale snapshot. Fires at most one-at-a-time (single-flight) and no more
   * often than {@link REFRESH_COOLDOWN_MS}, so a burst of expired reads during a
   * fast upstream failure cannot trigger a refresh storm. No-op when the
   * snapshot is empty (readiness is {@link ensureReady}'s job) or still fresh.
   */
  private revalidateIfStale(): void {
    const stats = this.repo.getStats();
    if (stats.cachedAt === null || !stats.isExpired) {
      return;
    }

    const logger = repoLogger.child({ action: 'refreshSnapshot' });

    if (this.refreshPromise) {
      logger.debug('Refresh already in flight; skipping');
      return;
    }
    const now = Date.now();
    if (now - this.lastRefreshAttemptAt < REFRESH_COOLDOWN_MS) {
      logger.debug('Within refresh cooldown; skipping');
      return;
    }
    this.lastRefreshAttemptAt = now;
    logger.info(
      { size: stats.size },
      'Snapshot expired; refreshing in background (serving stale)',
    );
    this.refreshPromise = this.repo
      .refreshSnapshot()
      .then(() => undefined)
      .catch((error: unknown) => {
        logger.warn({ error }, 'background refreshSnapshot failed');
      })
      .finally(() => {
        this.refreshPromise = null;
      });
  }

  /**
   * Run a snapshot read with the snapshot made readable: block on cold start
   * ({@link ensureReady}), then kick a background revalidation if stale
   * ({@link revalidateIfStale}) before reading. `read` receives the cold-start
   * failure (null on success) so Result-style callers can map it to an error
   * while best-effort callers ignore it.
   */
  private async withReadySnapshot<T>(
    read: (failure: SnapshotOperationFailure | null) => Promise<T>,
  ): Promise<T> {
    const failure = await this.ensureReady();
    this.revalidateIfStale();
    return read(failure);
  }

  /** Fetch all prototypes, mapped to the app's {@link FetchPrototypesResult}. */
  async getAllPrototypes(): Promise<FetchPrototypesResult> {
    const logger = repoLogger.child({ action: 'getAllPrototypes' });
    return this.withReadySnapshot(async (failure) => {
      if (failure) {
        const status = mapFailureStatus(failure);
        logger.warn(
          { status, origin: failure.origin },
          'Failed to ensure snapshot; returning error result',
        );
        return { ok: false, status, error: toLocalizedMessage(failure) };
      }
      const data = await this.repo.getAllFromSnapshot();
      logger.debug(
        { count: data.length },
        'Returning all prototypes from snapshot',
      );
      return { ok: true, data: [...data] };
    });
  }

  /**
   * Resolve a single prototype by id from the snapshot (cached by-id). Blocks on
   * cold start via `withReadySnapshot`. A cold-start setup failure throws (the
   * dataset could not be loaded — surfaced like the legacy by-id path and
   * `getRandomPrototype`, rather than masquerading as "not found"). An absent id
   * is `null` (the snapshot is the complete dataset; no fallback fetch — that is
   * the SHOW path's job), and a non-positive-integer id promidas rejects is also
   * `null` (caught), so a bad id never throws for the caller.
   */
  async getPrototypeById(id: number): Promise<PrototypeForMpp | null> {
    const logger = repoLogger.child({ action: 'getPrototypeById' });
    return this.withReadySnapshot(async (failure) => {
      if (failure) {
        logger.warn(
          { id, origin: failure.origin },
          'Snapshot unavailable for by-id lookup',
        );
        throw new Error(toLocalizedMessage(failure));
      }
      try {
        const prototype =
          await this.repo.getPrototypeFromSnapshotByPrototypeId(id);
        logger.debug(
          { id, found: prototype != null },
          'Resolved prototype by id from snapshot',
        );
        return prototype;
      } catch (error) {
        logger.warn({ id, error }, 'Skipping id rejected by snapshot lookup');
        return null;
      }
    });
  }

  /**
   * Pick a random prototype from the snapshot. Blocks on cold start via
   * `withReadySnapshot`; a cold-start setup failure throws (the dataset could
   * not be loaded). Returns `null` when the snapshot is empty.
   */
  async getRandomPrototype(): Promise<PrototypeForMpp | null> {
    const logger = repoLogger.child({ action: 'getRandomPrototype' });
    return this.withReadySnapshot(async (failure) => {
      if (failure) {
        logger.warn(
          { origin: failure.origin },
          'Snapshot unavailable for random lookup',
        );
        throw new Error(toLocalizedMessage(failure));
      }
      const prototype = await this.repo.getRandomPrototypeFromSnapshot();
      logger.debug(
        { id: prototype?.id ?? null },
        'Returning random prototype from snapshot',
      );
      return prototype;
    });
  }

  /**
   * Resolve the maximum prototype id via `analyzePrototypes`. Blocks on cold
   * start (through {@link ensureReady}) so the first call returns the real max
   * rather than `null` — otherwise the only consumer (`useMaxPrototypeId`, which
   * reads once on mount) would latch onto the fallback for the whole session.
   * Returns `null` only when the cold-start setup fails (snapshot stays empty);
   * the caller falls back to a default in that case.
   */
  async getMaxPrototypeId(): Promise<number | null> {
    const logger = repoLogger.child({ action: 'getMaxPrototypeId' });
    // Ignore the failure value (best-effort): on setup failure the snapshot is
    // empty and analyzePrototypes yields null, which maps to the caller's
    // fallback. ensureReady still blocks on cold so a successful setup resolves
    // the real max on the first call.
    return this.withReadySnapshot(async () => {
      const { max } = await this.repo.analyzePrototypes();
      logger.debug({ max }, 'Resolved max prototype id from snapshot');
      return max;
    });
  }

  /**
   * Resolve prototype names for the given ids. Awaits the snapshot setup on cold
   * start so the first lookup returns names (concurrent callers coalesce onto a
   * single fetch); serves stale data while refreshing in the background when
   * expired. Missing ids are omitted (sparse result).
   */
  async getPrototypeNames(ids: number[]): Promise<Record<number, string>> {
    if (!Array.isArray(ids) || ids.length === 0) {
      return {};
    }

    const logger = repoLogger.child({ action: 'getPrototypeNames' });

    // Dedupe only — do NOT pre-validate ids here. PROMIDAS is the single source
    // of id validation; the per-id lookup below catches anything it rejects (and
    // logs it), so a redundant filter would only hide bad input.
    const uniqueIds = Array.from(new Set(ids));

    // Best-effort: ignore the cold-start failure (an empty snapshot simply
    // yields no names). withReadySnapshot still blocks on cold start so the
    // first lookup populates and resolves; expired serves stale + revalidates in
    // the background.
    return this.withReadySnapshot(async () => {
      // Resolve each id via the snapshot's O(1) by-id lookup, avoiding the cost
      // of materializing the full snapshot array + a Map just to read a few
      // names. Isolate each lookup: PROMIDAS THROWS on an id it rejects (e.g.
      // beyond the safe-integer range), and a single bad id must not reject the
      // whole batch (best-effort), so catch it and omit that id.
      const entries = await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const prototype =
              await this.repo.getPrototypeFromSnapshotByPrototypeId(id);
            return [id, prototype?.prototypeNm] as const;
          } catch (error) {
            logger.warn(
              { id, error },
              'Skipping id rejected by snapshot lookup',
            );
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
}

/** Server-side singleton. */
export const promidasBackedRepository = new PromidasBackedRepository(
  buildPromidasRepository(),
);
