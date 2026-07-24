/**
 * @fileoverview Observatory-only material INSIGHTS (single pass).
 *
 * Complements `build-material-analytics.ts` (frequency histogram) with
 * derived insights used by The Alchemist's Table. Kept Observatory-side and
 * separate from the base analysis so it never bloats the top-page pipeline.
 *
 * All results are computed in a single pass over the prototype dataset plus the
 * already-computed `materialCounts` histogram.
 */
import type { PrototypeForMpp } from '@/lib/api/prototypes';

import { jstYear, jstYearMonth } from './blocks/insights-shared';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

/** A work that uses many materials (The Kitchen Sink). */
export interface KitchenSinkEntry {
  id: number;
  name: string;
  /** Plain team name ('' if the work has no team). */
  teamNm: string;
  /** Raw `displayName@profileId` maker elements (decode with getUserDisplayName). */
  users: string[];
  materialCount: number;
  materials: string[];
}

/**
 * Engagement aggregated by how many materials a work uses (Less is More?).
 * Uses likes directly (not likes/views): views measure exposure, likes measure
 * appreciation, and the two are largely independent here — so dividing by views
 * would inject noise rather than normalize. Median is robust to viral outliers.
 */
export interface MaterialCountBucket {
  label: string;
  works: number;
  /** Median like (good) count of works in the bucket. */
  medianLikes: number;
  /** Median view count of works in the bucket. */
  medianViews: number;
}

/**
 * A material first used within the trailing 12 months (The Newfound Element) —
 * the freshest sparks. `series` is 12 MONTHLY counts (oldest -> newest).
 */
export interface NewfoundEntry {
  material: string;
  count: number;
  /** Per-month usage counts for the trailing 12 months (oldest -> newest). */
  series: number[];
}

/**
 * A most-used material of all time (The Monumental Elements) — a pure usage
 * ranking with no temporal constraint, so high-volume staples that slip between
 * the time-based sections (still going / faded / just risen) still get their due.
 */
export interface MonumentalEntry {
  material: string;
  firstYear: number;
  lastYear: number;
  count: number;
  /** Per-year usage counts from the global earliest year to `latestYear`. */
  series: number[];
}

/**
 * A material that debuted long ago and has been used EVERY year since, up to the
 * latest year in the data (The Primordial Element) — old but still going.
 */
export interface PrimordialEntry {
  material: string;
  firstYear: number;
  latestYear: number;
  count: number;
  /**
   * Per-year usage counts from the global earliest year to `latestYear`
   * (leading zeros before debut, then > 0 every year — it never skips one).
   */
  series: number[];
}

/**
 * A material that was used for years but has gone silent recently — used in the
 * past yet not in the last couple of years (Lost Technology).
 */
export interface LostTechEntry {
  material: string;
  firstYear: number;
  lastYear: number;
  count: number;
  /**
   * Per-year usage counts from the global earliest year to `latestYear`
   * (leading zeros before debut, trailing zeros after it went silent).
   */
  series: number[];
}

/**
 * A material that debuted in the last couple of years (not this year) and is
 * still in use (The Rising Vapors) — the recent risers shaping the mainstream.
 */
export interface RisingVaporsEntry {
  material: string;
  firstYear: number;
  count: number;
  /** Per-year usage counts from the global earliest year to `latestYear`. */
  series: number[];
}

/**
 * The top materials of a single period (a year "YYYY" or a month "YYYY-MM"),
 * ranked by that period's usage. Yearly and monthly are aggregated
 * independently — a period's true ranking cannot be reconstructed from another
 * granularity's top-N (the tail is dropped), so each is built from full counts.
 */
export interface PeriodTopMaterial {
  material: string;
  count: number;
}

export interface MaterialInsights {
  /** Full material frequency histogram (all occurrences). */
  materialCounts: Record<string, number>;
  kitchenSink: KitchenSinkEntry[];
  countEngagement: MaterialCountBucket[];
  primordial: PrimordialEntry[];
  risingVapors: RisingVaporsEntry[];
  newfound: NewfoundEntry[];
  lostTech: LostTechEntry[];
  monumental: MonumentalEntry[];
  /** Each YEAR ("YYYY") -> that year's top materials by usage (ranked). */
  yearlyTopMaterials: Record<string, PeriodTopMaterial[]>;
  /** Each MONTH ("YYYY-MM") -> that month's top materials by usage (ranked). */
  monthlyTopMaterials: Record<string, PeriodTopMaterial[]>;
  /** Latest release year present in the data. */
  latestYear: number;
}

/** Minimum overall usage for a material to count as "primordial" (not a one-off). */
const MIN_COUNT_FOR_PRIMORDIAL = 20;
/** Minimum lifespan (years, inclusive) to count as "old" for The Primordial Element. */
const MIN_SPAN_YEARS = 5;
/** Silent years (including the latest) that mark a material as Lost Technology. */
const LOST_SILENT_YEARS = 2;
/** Minimum distinct active years for a material to count as Lost Technology. */
const MIN_ACTIVE_YEARS_FOR_LOST = 3;
/** Debut window (years back from latest) to count as a Rising Star newcomer. */
const NEWCOMER_DEBUT_WINDOW = 2;

/** How many most-used materials to keep for The Monumental Elements ranking. */
const MONUMENTAL_LIMIT = 100;

/** The Kitchen Sink is shown as a ranking, so it lists more entries. */
const KITCHEN_SINK_LIMIT = 20;

/**
 * How many top materials to keep per period (year / month) for the trend views.
 * Kept at the widest UI option (top 10 / 20 / 30) so the client can slice down.
 */
const PERIOD_TOP_LIMIT = 30;

function bucketLabel(materialCount: number): string {
  if (materialCount <= 3) return '1-3';
  if (materialCount <= 5) return '4-5';
  if (materialCount <= 10) return '6-10';
  if (materialCount <= 15) return '11-15';
  return '16+';
}

const BUCKET_ORDER = ['1-3', '4-5', '6-10', '11-15', '16+'] as const;

/**
 * The trailing `count` JST calendar months (oldest -> newest) ending at the
 * JST month of `now`. Anchors on JST once, then steps with pure year/month
 * arithmetic so the runtime's time zone never affects the window.
 */
function trailingMonths(count: number, now: Date = new Date()): string[] {
  const anchor = jstYearMonth(now.toISOString());
  if (anchor == null) return [];
  const anchorYear = Number(anchor.slice(0, 4));
  const anchorMonth = Number(anchor.slice(5, 7));
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const index = anchorYear * 12 + (anchorMonth - 1) - i;
    const year = Math.floor(index / 12);
    const month = (index % 12) + 1;
    months.push(`${year}-${String(month).padStart(2, '0')}`);
  }
  return months;
}

/** Median of a non-empty number array. */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function buildMaterialInsights(
  prototypes: PrototypeForMpp[],
  options?: { logger?: MinimalLogger },
): MaterialInsights {
  const startTime = Date.now();
  const kitchenSink: KitchenSinkEntry[] = [];
  // Full material frequency (all occurrences, like buildMaterialAnalytics) —
  // computed here so this is the only pass over the dataset.
  const materialCounts: Record<string, number> = {};

  // Less is More?: collect likes and views per bucket, then take medians.
  const bucketLikes: Record<string, number[]> = {};
  const bucketViews: Record<string, number[]> = {};

  // Per-material yearly usage counts (foundation for time-based sections).
  const yearlyByMaterial: Record<string, Record<number, number>> = {};
  // Per-material monthly counts, kept only for the trailing 12 months window
  // (The Newfound Element uses month granularity, not year).
  const monthlyByMaterial: Record<string, Record<string, number>> = {};
  // Full-history per-month material counts (month -> material -> count), the
  // source for monthlyTopMaterials. Yearly is derived from yearlyByMaterial.
  const monthCountsAll: Record<string, Record<string, number>> = {};
  const windowMonths = trailingMonths(12);
  const windowStart = windowMonths[0];
  const windowMonthsSet = new Set(windowMonths);
  // Earliest release/create date per material — a FAIR tiebreak (unlike name,
  // which would decide board inclusion by spelling).
  const firstDateByMaterial: Record<string, string> = {};
  let latestYear = 0;
  let earliestYear = Infinity;

  for (const prototype of prototypes) {
    const materials = Array.isArray(prototype.materials)
      ? prototype.materials
      : [];
    if (materials.length === 0) continue;

    // The Kitchen Sink
    kitchenSink.push({
      id: prototype.id,
      name: prototype.prototypeNm,
      teamNm: prototype.teamNm?.trim() ?? '',
      users: Array.isArray(prototype.users) ? prototype.users : [],
      materialCount: materials.length,
      materials,
    });

    // Less is More? (likes and views by material count)
    const label = bucketLabel(materials.length);
    if (bucketLikes[label] == null) bucketLikes[label] = [];
    if (bucketViews[label] == null) bucketViews[label] = [];
    bucketLikes[label].push(prototype.goodCount);
    bucketViews[label].push(prototype.viewCount);

    // Global material frequency (all occurrences, regardless of date validity).
    for (const material of materials) {
      materialCounts[material] = (materialCounts[material] ?? 0) + 1;
    }

    // Per-material yearly counts (Primordial / Lost Technology) and monthly
    // counts within the trailing-12-months window (The Newfound Element).
    // Year/month attribution is JST (the Observatory policy) — never the
    // runtime's local zone, which is UTC in production but JST in local dev.
    const dateStr = prototype.releaseDate || prototype.createDate;
    const year = dateStr != null ? jstYear(dateStr) : NaN;
    const ym = dateStr != null ? jstYearMonth(dateStr) : null;
    if (!Number.isNaN(year) && ym != null && dateStr != null) {
      if (year > latestYear) latestYear = year;
      if (year < earliestYear) earliestYear = year;
      const inWindow = windowMonthsSet.has(ym);
      for (const material of materials) {
        if (yearlyByMaterial[material] == null) yearlyByMaterial[material] = {};
        yearlyByMaterial[material][year] =
          (yearlyByMaterial[material][year] ?? 0) + 1;
        const prev = firstDateByMaterial[material];
        if (prev == null || dateStr < prev)
          firstDateByMaterial[material] = dateStr;
        // Full-history monthly counts (source for monthlyTopMaterials).
        if (monthCountsAll[ym] == null) monthCountsAll[ym] = {};
        monthCountsAll[ym][material] = (monthCountsAll[ym][material] ?? 0) + 1;
        if (inWindow) {
          if (monthlyByMaterial[material] == null)
            monthlyByMaterial[material] = {};
          monthlyByMaterial[material][ym] =
            (monthlyByMaterial[material][ym] ?? 0) + 1;
        }
      }
    }
  }

  kitchenSink.sort((a, b) => b.materialCount - a.materialCount);

  const countEngagement: MaterialCountBucket[] = BUCKET_ORDER.filter(
    (label) => (bucketLikes[label]?.length ?? 0) > 0,
  ).map((label) => {
    const likes = bucketLikes[label];
    return {
      label,
      works: likes.length,
      // Counts are integers; round the median (even-sized sets average two mids).
      medianLikes: Math.round(median(likes)),
      medianViews: Math.round(median(bucketViews[label])),
    };
  });

  // Shared per-material year stats (drives Primordial and Lost Technology).
  const yearStats = Object.entries(yearlyByMaterial).map(
    ([material, byYear]) => {
      const years = Object.keys(byYear).map(Number);
      const firstYear = Math.min(...years);
      const lastYear = Math.max(...years);
      // Continuity is judged over the material's own lifespan (debut -> latest).
      let continuous = true;
      for (let y = firstYear; y <= latestYear; y++) {
        if ((byYear[y] ?? 0) === 0) {
          continuous = false;
          break;
        }
      }
      // Display series is aligned to the GLOBAL range so every sparkline shares
      // the same width and the same year on the x-axis (leading/trailing zeros
      // show when a material debuted / went silent).
      const series: number[] = [];
      for (let y = earliestYear; y <= latestYear; y++)
        series.push(byYear[y] ?? 0);
      return {
        material,
        firstYear,
        lastYear,
        activeYears: years.length,
        total: materialCounts[material] ?? 0,
        firstDate: firstDateByMaterial[material] ?? '',
        series,
        continuous,
      };
    },
  );

  // Fair, deterministic tiebreak for equal counts: earliest release date wins a
  // board slot (never the material's name — that would be decided by spelling).
  const byDate = (a: { firstDate: string }, b: { firstDate: string }) =>
    a.firstDate.localeCompare(b.firstDate);

  // The Primordial Element: old debut, used every year since, still going.
  const primordial: PrimordialEntry[] = yearStats
    .filter(
      (s) =>
        s.continuous &&
        s.total >= MIN_COUNT_FOR_PRIMORDIAL &&
        latestYear - s.firstYear + 1 >= MIN_SPAN_YEARS,
    )
    .sort(
      (a, b) => a.firstYear - b.firstYear || b.total - a.total || byDate(a, b),
    )
    .map((s) => ({
      material: s.material,
      firstYear: s.firstYear,
      latestYear,
      count: s.total,
      series: s.series,
    }));

  // The Rising Vapors: debuted in the last couple of years (but NOT this year)
  // and still used this year — recent risers, not brand new. No minimum count.
  const risingVapors: RisingVaporsEntry[] = yearStats
    .filter(
      (s) =>
        s.firstYear >= latestYear - NEWCOMER_DEBUT_WINDOW &&
        s.firstYear < latestYear &&
        s.lastYear === latestYear,
    )
    .sort(
      (a, b) => b.total - a.total || b.firstYear - a.firstYear || byDate(a, b),
    )
    .map((s) => ({
      material: s.material,
      firstYear: s.firstYear,
      count: s.total,
      series: s.series,
    }));

  // The Newfound Element: first used within the trailing 12 months (month
  // granularity). Series is 12 monthly counts; count = uses within the window
  // (all of it, since the material first appeared inside the window).
  const newfound: NewfoundEntry[] = Object.keys(firstDateByMaterial)
    .map((material) => {
      const firstDate = firstDateByMaterial[material];
      const series = windowMonths.map(
        (m) => monthlyByMaterial[material]?.[m] ?? 0,
      );
      const count = series.reduce((sum, c) => sum + c, 0);
      return {
        material,
        firstDate,
        firstMonth: jstYearMonth(firstDate) ?? '',
        count,
        series,
      };
    })
    .filter((s) => s.firstMonth >= windowStart && s.count > 0)
    .sort((a, b) => b.count - a.count || a.firstDate.localeCompare(b.firstDate))
    .map((s) => ({ material: s.material, count: s.count, series: s.series }));

  // Lost Technology: real past usage, but silent for the last couple of years.
  const lostTech: LostTechEntry[] = yearStats
    .filter(
      (s) =>
        s.total >= MIN_COUNT_FOR_PRIMORDIAL &&
        s.activeYears >= MIN_ACTIVE_YEARS_FOR_LOST &&
        s.lastYear <= latestYear - LOST_SILENT_YEARS,
    )
    .sort((a, b) => b.total - a.total || byDate(a, b))
    .map((s) => ({
      material: s.material,
      firstYear: s.firstYear,
      lastYear: s.lastYear,
      count: s.total,
      series: s.series,
    }));

  // The Monumental Elements: the most-used materials of all time, ranked purely
  // by total usage with no temporal constraint. This is the catch-all for
  // high-volume staples (e.g. M5Stack) that fall between the time-based sections
  // — still going but with an early gap, faded, or freshly risen.
  const monumental: MonumentalEntry[] = yearStats
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total || byDate(a, b))
    .slice(0, MONUMENTAL_LIMIT)
    .map((s) => ({
      material: s.material,
      firstYear: s.firstYear,
      lastYear: s.lastYear,
      count: s.total,
      series: s.series,
    }));

  // Per-period true top-N rankings (year and month), aggregated independently.
  // Tiebreak on equal counts: earliest debut date (fair), then name (stable).
  const rankPeriod = (
    byMaterial: Record<string, number>,
  ): PeriodTopMaterial[] =>
    Object.entries(byMaterial)
      .map(([material, count]) => ({ material, count }))
      .sort(
        (a, b) =>
          b.count - a.count ||
          (firstDateByMaterial[a.material] ?? '').localeCompare(
            firstDateByMaterial[b.material] ?? '',
          ) ||
          a.material.localeCompare(b.material),
      )
      .slice(0, PERIOD_TOP_LIMIT);

  // Yearly: invert the per-material yearly map into per-year material counts.
  const yearCounts: Record<number, Record<string, number>> = {};
  for (const [material, byYear] of Object.entries(yearlyByMaterial)) {
    for (const y of Object.keys(byYear)) {
      const yr = Number(y);
      if (yearCounts[yr] == null) yearCounts[yr] = {};
      yearCounts[yr][material] = byYear[yr];
    }
  }
  const yearlyTopMaterials: Record<string, PeriodTopMaterial[]> = {};
  for (const [year, byMaterial] of Object.entries(yearCounts)) {
    yearlyTopMaterials[year] = rankPeriod(byMaterial);
  }

  // Monthly: rank the full-history per-month counts.
  const monthlyTopMaterials: Record<string, PeriodTopMaterial[]> = {};
  for (const [ym, byMaterial] of Object.entries(monthCountsAll)) {
    monthlyTopMaterials[ym] = rankPeriod(byMaterial);
  }

  if (options?.logger) {
    options.logger.debug(
      {
        elapsedMs: Date.now() - startTime,
        totalSamples: prototypes.length,
        distinctMaterials: Object.keys(materialCounts).length,
        monumental: monumental.length,
        primordial: primordial.length,
        risingVapors: risingVapors.length,
        lostTech: lostTech.length,
        newfound: newfound.length,
        yearsCovered: Object.keys(yearlyTopMaterials).length,
        monthsCovered: Object.keys(monthlyTopMaterials).length,
      },
      '[ANALYSIS] Built material insights',
    );
  }

  return {
    materialCounts,
    kitchenSink: kitchenSink.slice(0, KITCHEN_SINK_LIMIT),
    countEngagement,
    primordial,
    risingVapors,
    newfound,
    lostTech,
    monumental,
    yearlyTopMaterials,
    monthlyTopMaterials,
    latestYear: Number.isFinite(latestYear) ? latestYear : 0,
  };
}
