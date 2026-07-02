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

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

/** A work that uses many materials (The Kitchen Sink). */
export interface KitchenSinkEntry {
  id: number;
  name: string;
  author: string;
  materialCount: number;
  materials: string[];
}

/** Team name if present, otherwise the joined maker names ('' if neither). */
function resolveAuthor(prototype: PrototypeForMpp): string {
  const team = prototype.teamNm?.trim();
  if (team != null && team !== '') return team;
  const users = Array.isArray(prototype.users) ? prototype.users : [];
  return users.join(', ');
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
 * A material first used within the trailing 12 months (The Newfound Element) —
 * the freshest sparks. `series` is 12 MONTHLY counts (oldest -> newest).
 */
export interface NewfoundEntry {
  material: string;
  count: number;
  /** Per-month usage counts for the trailing 12 months (oldest -> newest). */
  series: number[];
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
  /** Latest release year present in the data. */
  latestYear: number;
}

/** The Kitchen Sink is shown as a ranking, so it lists more entries. */
const KITCHEN_SINK_LIMIT = 20;
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

function bucketLabel(materialCount: number): string {
  if (materialCount <= 3) return '1-3';
  if (materialCount <= 5) return '4-5';
  if (materialCount <= 10) return '6-10';
  if (materialCount <= 15) return '11-15';
  return '16+';
}

const BUCKET_ORDER = ['1-3', '4-5', '6-10', '11-15', '16+'] as const;

/** `YYYY-MM` for a date string (used by The Newfound Element's monthly view). */
function toYearMonth(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** The trailing `count` months (oldest -> newest) ending at the current month. */
function trailingMonths(count: number, now: Date = new Date()): string[] {
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`,
    );
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
      author: resolveAuthor(prototype),
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
    const dateStr = prototype.releaseDate || prototype.createDate;
    const parsed = dateStr != null ? new Date(dateStr) : null;
    const year =
      parsed != null && !Number.isNaN(parsed.getTime())
        ? parsed.getFullYear()
        : NaN;
    if (!Number.isNaN(year) && parsed != null && dateStr != null) {
      if (year > latestYear) latestYear = year;
      if (year < earliestYear) earliestYear = year;
      const ym = `${year}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
      const inWindow = windowMonthsSet.has(ym);
      for (const material of materials) {
        if (yearlyByMaterial[material] == null) yearlyByMaterial[material] = {};
        yearlyByMaterial[material][year] =
          (yearlyByMaterial[material][year] ?? 0) + 1;
        const prev = firstDateByMaterial[material];
        if (prev == null || dateStr < prev)
          firstDateByMaterial[material] = dateStr;
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
        firstMonth: toYearMonth(firstDate),
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

  if (options?.logger) {
    options.logger.debug(
      {
        elapsedMs: Date.now() - startTime,
        totalSamples: prototypes.length,
        distinctMaterials: Object.keys(materialCounts).length,
        primordial: primordial.length,
        risingVapors: risingVapors.length,
        newfound: newfound.length,
        lostTech: lostTech.length,
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
    latestYear: Number.isFinite(latestYear) ? latestYear : 0,
  };
}
