/**
 * @fileoverview
 * Server-side analysis orchestration: generates server analysis results from a prototype array.
 *
 * - Aggregation for server cache/initial rendering
 * - Excludes TZ-dependent data such as Anniversaries
 * - Always provide TSDoc for imports and return types
 */

import type { NormalizedPrototype } from '../api/prototypes';
import { logger as serverLogger } from '../logger.server';
import {
  buildAdvancedAnalysis,
  buildTimeDistributionsAndUniqueDates,
  calculateCreationStreak,
} from './core';
import {
  buildStatusDistribution,
  buildTopMaterials,
  buildTopTags,
  buildTopTeams,
  computeAverageAgeInDays,
  countPrototypesWithAwards,
} from './to-be-batched';
import type { ServerPrototypeAnalysis } from './types';

/**
 * Minimal logger interface for dependency injection
 */
type MinimalLogger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  child: (bindings: Record<string, unknown>) => MinimalLogger;
};

/**
 * Analyzes prototype data for SERVER-SIDE usage (excludes TZ-sensitive anniversaries).
 *
 * Computes timezone-independent statistics suitable for server-side caching and initial page rendering.
 * Anniversary data is intentionally EXCLUDED because "today" semantics must reflect the user's timezone, not the server's.
 *
 * For client-side usage with anniversaries, use `analyzePrototypes` instead.
 *
 * @param prototypes - Array of normalized prototype data to analyze
 * @param options - Optional configuration (logger for diagnostics, referenceDate for testing)
 * @returns Server analysis object WITHOUT anniversary data
 */
export function analyzePrototypesForServer(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger; referenceDate?: Date },
): ServerPrototypeAnalysis {
  const base: MinimalLogger = options?.logger ?? serverLogger;
  const logger = base.child({ action: 'analyzePrototypesForServer' });
  const startTime = performance.now();

  const now = options?.referenceDate ?? new Date();
  const metrics: Record<string, number> = {};

  if (prototypes.length === 0) {
    logger.debug('No prototypes to analyze, returning empty analysis');
    return {
      totalCount: 0,
      statusDistribution: {},
      prototypesWithAwards: 0,
      topTags: [],
      topMaterials: [],
      averageAgeInDays: 0,
      topTeams: [],
      analyzedAt: new Date().toISOString(),
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
        sundaySprintCount: 0,
        midnightCount: 0,
        daytimeCount: 0,
        totalCount: 0,
      },
      holyDay: { topDays: [] },
      longTermEvolution: {
        longestMaintenance: [],
        averageMaintenanceDays: 0,
        maintenanceRatio: 0,
      },
      anniversaryCandidates: {
        metadata: { computedAt: '', windowUTC: { fromISO: '', toISO: '' } },
        mmdd: [],
      },
      _debugMetrics: metrics,
    };
  }

  // --- Metrics collection for individual analysis steps ---

  let stepStart = performance.now();
  const statusDistribution = buildStatusDistribution(prototypes);
  metrics.statusDistribution = performance.now() - stepStart;

  stepStart = performance.now();
  const prototypesWithAwards = countPrototypesWithAwards(prototypes);
  metrics.prototypesWithAwards = performance.now() - stepStart;

  stepStart = performance.now();
  const { topTags, tagCounts } = buildTopTags(prototypes);
  metrics.topTags = performance.now() - stepStart;

  stepStart = performance.now();
  const averageAgeInDays = computeAverageAgeInDays(prototypes, now);
  metrics.averageAgeInDays = performance.now() - stepStart;

  stepStart = performance.now();
  const { topTeams, teamCounts } = buildTopTeams(prototypes);
  metrics.topTeams = performance.now() - stepStart;

  stepStart = performance.now();
  const { topMaterials, materialCounts } = buildTopMaterials(prototypes);
  metrics.topMaterials = performance.now() - stepStart;

  stepStart = performance.now();

  // --- Maker's Rhythm & Eternal Flame Analysis (JST based) ---
  const {
    createTimeDistribution,
    createDateDistribution,
    releaseTimeDistribution,
    releaseDateDistribution,
    updateTimeDistribution,
    updateDateDistribution,
    uniqueReleaseDates,
  } = buildTimeDistributionsAndUniqueDates(prototypes);

  metrics.makerRhythm = performance.now() - stepStart;

  stepStart = performance.now();

  // Calculate Streaks
  const creationStreak = calculateCreationStreak(uniqueReleaseDates, now);

  metrics.creationStreak = performance.now() - stepStart;

  stepStart = performance.now();

  // --- Advanced Analysis (First Penguin, Star Alignment, Anniversary, Early Adopters) ---
  const {
    firstPenguins,
    starAlignments,
    anniversaryEffect,
    earlyAdopters,
    laborOfLove,
    maternityHospital,
    powerOfDeadlines,
    weekendWarrior,
    holyDay,
    longTermEvolution,
  } = buildAdvancedAnalysis(prototypes, topTags);

  metrics.advancedAnalysis = performance.now() - stepStart;

  // --- End metrics collection ---

  const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
  metrics.total = elapsedMs;

  // Compute dataset date range for diagnostics
  const validDates = prototypes
    .map((p) => Date.parse(p.releaseDate))
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);
  const datasetMin =
    validDates.length > 0 ? new Date(validDates[0]).toISOString() : null;
  const datasetMax =
    validDates.length > 0
      ? new Date(validDates[validDates.length - 1]).toISOString()
      : null;

  // Log processing summary (TZ-independent)
  logger.info(
    {
      summary: {
        totalCount: prototypes.length,
        statusKinds: Object.keys(statusDistribution).length,
        uniqueTags: Object.keys(tagCounts).length,
        uniqueTeams: Object.keys(teamCounts).length,
        uniqueMaterials: Object.keys(materialCounts).length,
        averageAgeInDays: Math.round(averageAgeInDays * 100) / 100,
        datasetMinISO: datasetMin,
        datasetMaxISO: datasetMax,
        elapsedMs,
        metrics, // Add metrics to the summary log
      },
    },
    'Server-side analysis completed (TZ-independent data only)',
  );

  const anniversaryCandidates = {
    metadata: { computedAt: '', windowUTC: { fromISO: '', toISO: '' } },
    mmdd: [],
  };

  return {
    totalCount: prototypes.length,
    statusDistribution,
    prototypesWithAwards,
    topTags,
    averageAgeInDays: Math.round(averageAgeInDays * 100) / 100,
    topTeams,
    topMaterials,
    analyzedAt: new Date().toISOString(),
    createTimeDistribution,
    createDateDistribution,
    releaseTimeDistribution,
    releaseDateDistribution,
    updateTimeDistribution,
    updateDateDistribution,
    creationStreak,
    earlyAdopters,
    firstPenguins,
    starAlignments,
    anniversaryEffect,
    laborOfLove,
    maternityHospital,
    powerOfDeadlines,
    weekendWarrior,
    holyDay,
    longTermEvolution,
    anniversaryCandidates,
    _debugMetrics: metrics, // Include metrics in the returned object
  };
}
