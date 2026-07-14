/**
 * @fileoverview Analysis Repository — the single place that owns building and
 * caching per-surface analysis data from the shared prototype dataset.
 *
 * Motivation: the home page's base analysis (`buildAnalysisOverview` /
 * `getAnalysisOverview`) must stay minimal so main-page-only visitors never pay to
 * compute Observatory-only metrics. Each Observatory page instead asks this
 * repository for exactly the data it renders; the repo owns the fetch (shared,
 * via `getAllPrototypes()`), the builder composition, dependency wiring, and
 * caching. Consumers just call a method and get a result.
 *
 * Scope: this repository owns every analysis surface — the home page
 * (`getAnalysisOverview`, cached + minimal), Hello World, and The Alchemist's Table
 * (material insights, Elemental Chronicles, Circle of Masters). All analysis-data
 * consumers go through here; the thin `app/actions/*` server actions just
 * delegate. See docs/observatory/observatory-architecture.md.
 */

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { getAllPrototypes } from '@/app/actions/prototypes-gateway';
import { logger as baseLogger } from '@/lib/logger.server';
import {
  buildHelloWorldInsights,
  type HelloWorldInsights,
} from '@/lib/observatory/hello-world/build-hello-world-insights';
import {
  buildMaterialInsights,
  type MaterialInsights,
} from '@/lib/observatory/alchemists-table/build-material-insights';
import {
  buildChroniclesInsights,
  type ChroniclesInsights,
} from '@/lib/observatory/alchemists-table/build-chronicles-insights';
import {
  buildCircleOfMastersInsights,
  type CircleInsights,
} from '@/lib/observatory/alchemists-table/build-circle-of-masters-insights';
import { buildAnalysisOverview } from '@/lib/analysis/entrypoints/server';
import { analysisCache } from '@/lib/stores/analysis-cache';
import type { AnalysisOverview } from '@/lib/analysis/types';

type RepoLogger = ReturnType<typeof baseLogger.child>;

/** Success/failure wrapper matching the other Observatory data sources. */
export type AnalysisResult<T> =
  { ok: true; data: T } | { ok: false; error: string };

/** Result of the home (base) analysis, carrying cache metadata. */
export type AnalysisOverviewResult =
  | {
      ok: true;
      data: AnalysisOverview;
      cachedAt: string;
      params: { limit: number; offset: number; totalCount: number };
    }
  | { ok: false; error: string };

type MemoEntry<T> = { key: string; data: T };

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
  analysis: AnalysisOverview,
  elapsedMs: number,
) => ({
  totalCount: analysis.totalCount,
  statusKinds: Object.keys(analysis.statusDistribution).length,
  uniqueTags: analysis.topTags.length,
  averageAgeInDays: analysis.averageAgeInDays,
  elapsedMs,
});

/**
 * Owns caching + composition for per-surface analysis. Kept as a small class so
 * per-surface state (memo, cache) lives in one place and future accessors
 * (e.g. cross-page shared metrics) can be added alongside.
 */
class AnalysisRepository {
  private helloWorldMemo: MemoEntry<HelloWorldInsights> | null = null;

  /**
   * The base/home analysis for the main app page `/`. Returns the most recent
   * cached snapshot, hydrating + computing it via {@link buildAnalysisOverview}
   * on a miss (or when `forceRecompute` is set). This is the ONLY analysis the
   * home page needs; it must stay minimal (no Observatory-only metrics).
   */
  async getAnalysisOverview(options?: {
    forceRecompute?: boolean;
  }): Promise<AnalysisOverviewResult> {
    const logger = baseLogger.child({ action: 'getAnalysisOverview' });
    const startTime = performance.now();

    const forceRecompute = options?.forceRecompute === true;

    let cached = forceRecompute ? null : analysisCache.getLatest();
    let computedDuringCall = false;

    if (!cached) {
      const hydrateResult = await getAllPrototypes();
      if (!hydrateResult.ok) {
        logger.warn(
          { status: hydrateResult.status, error: hydrateResult.error },
          '[ANALYSIS-REPO] Failed to hydrate home analysis from prototypes',
        );
      } else if (hydrateResult.data.length > 0) {
        const analysis = buildAnalysisOverview(hydrateResult.data, {
          logger,
        });
        analysisCache.set(analysis, {
          limit: hydrateResult.data.length,
          offset: 0,
          totalCount: hydrateResult.data.length,
        });
        computedDuringCall = true;
      }

      cached = analysisCache.getLatest();
    }

    if (!cached) {
      return { ok: false, error: 'No analysis available in cache' };
    }

    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;

    // Mirror the analyze summary line for cache hits (compute path logs its own).
    if (!computedDuringCall) {
      const now = new Date();
      logger.info(
        {
          environment: { runtime: 'server', source: 'cache' },
          timezone: buildTimezoneSnapshot(now),
          summary: buildAnalysisSummary(cached.analysis, elapsedMs),
        },
        'Home analysis served from cache (timezone + summary)',
      );
    }

    return {
      ok: true,
      data: cached.analysis,
      cachedAt: cached.cachedAt.toISOString(),
      params: cached.params,
    };
  }

  /**
   * Shared fetch + error-handling wrapper: loads the prototype dataset once (the
   * fetch is snapshot-cached) and hands it to a page-specific builder. Every
   * surface accessor goes through here, so the fetch/error contract lives in one
   * place.
   */
  private async withPrototypes<T>(
    action: string,
    build: (
      prototypes: PrototypeForMpp[],
      logger: RepoLogger,
      meta: { lastFetchedAt: Date },
    ) => T,
  ): Promise<AnalysisResult<T>> {
    const logger = baseLogger.child({ action });

    const result = await getAllPrototypes();
    if (!result.ok) {
      logger.warn(
        { status: result.status, error: result.error },
        `[ANALYSIS-REPO] Failed to load prototypes for ${action}`,
      );
      return { ok: false, error: result.error };
    }

    return {
      ok: true,
      data: build(result.data, logger, { lastFetchedAt: result.lastFetchedAt }),
    };
  }

  /**
   * Analysis for the Observatory "Hello World" page. Composes the page's insights
   * via {@link buildHelloWorldInsights}, independent of the base (home) analysis.
   *
   * @param now - Reference "now" for streak / anniversary-candidate windows.
   *   Defaults to the current time; injectable for testing.
   */
  async getHelloWorldAnalysis(
    now: Date = new Date(),
  ): Promise<AnalysisResult<HelloWorldInsights>> {
    return this.withPrototypes(
      'getHelloWorldAnalysis',
      (prototypes, logger, { lastFetchedAt }) => {
        // Reuse the last computed insights only while the dataset generation is
        // unchanged. Key on the fetch generation (`lastFetchedAt`), NOT the count:
        // a same-count content change (edit, or +1/-1) advances the generation and
        // must invalidate the memo, which a length proxy would miss.
        const key = `hello-world:${lastFetchedAt.getTime()}`;
        if (this.helloWorldMemo?.key === key) {
          return this.helloWorldMemo.data;
        }
        const data = buildHelloWorldInsights(prototypes, now, { logger });
        this.helloWorldMemo = { key, data };
        return data;
      },
    );
  }

  /**
   * Material insights for The Alchemist's Table (Periodic Table, Kitchen Sink,
   * timeline sections). Single-pass histogram + derived sections.
   */
  async getMaterialAnalysis(): Promise<AnalysisResult<MaterialInsights>> {
    return this.withPrototypes('getMaterialAnalysis', (prototypes, logger) =>
      buildMaterialInsights(prototypes, { logger }),
    );
  }

  /**
   * The Elemental Chronicles (per-material) for The Alchemist's Table.
   */
  async getElementalChroniclesAnalysis(): Promise<
    AnalysisResult<ChroniclesInsights>
  > {
    return this.withPrototypes(
      'getElementalChroniclesAnalysis',
      (prototypes, logger) =>
        buildChroniclesInsights(prototypes, {
          logger,
          supernovaMilestones: [10, 50, 100, 300, 500],
        }),
    );
  }

  /**
   * The Circle of Masters (per-maker seating) for The Alchemist's Table.
   * Composition and seat tuning live in the facade.
   */
  async getCircleOfMastersAnalysis(): Promise<AnalysisResult<CircleInsights>> {
    return this.withPrototypes(
      'getCircleOfMastersAnalysis',
      (prototypes, logger) =>
        buildCircleOfMastersInsights(prototypes, { logger }),
    );
  }
}

/** Shared singleton repository instance. */
export const analysisRepository = new AnalysisRepository();
