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

/** A long-lived material and when it first appeared (The Primordial Element). */
export interface PrimordialEntry {
  material: string;
  firstReleaseDate: string;
  count: number;
}

/** A material over-represented among retired works (Lost Technology). */
export interface LostTechEntry {
  material: string;
  count: number;
}

export interface MaterialInsights {
  kitchenSink: KitchenSinkEntry[];
  countEngagement: MaterialCountBucket[];
  primordial: PrimordialEntry[];
  lostTech: LostTechEntry[];
}

const TOP_LIMIT = 12;
/** The Kitchen Sink is shown as a ranking, so it lists more entries. */
const KITCHEN_SINK_LIMIT = 20;
/** Minimum overall usage for a material to count as "primordial" (not a one-off). */
const MIN_COUNT_FOR_PRIMORDIAL = 5;
/** Retired prototype status (供養). */
const STATUS_RETIRED = 4;

function bucketLabel(materialCount: number): string {
  if (materialCount <= 3) return '1-3';
  if (materialCount <= 5) return '4-5';
  if (materialCount <= 10) return '6-10';
  if (materialCount <= 15) return '10-15';
  return '15+';
}

const BUCKET_ORDER = ['1-3', '4-5', '6-10', '10-15', '15+'] as const;

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
  materialCounts: Record<string, number>,
): MaterialInsights {
  const kitchenSink: KitchenSinkEntry[] = [];

  // Less is More?: collect likes and views per bucket, then take medians.
  const bucketLikes: Record<string, number[]> = {};
  const bucketViews: Record<string, number[]> = {};

  const earliestByMaterial: Record<string, string> = {};
  const retiredMaterialCounts: Record<string, number> = {};

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

    // The Primordial Element (earliest release per material)
    const releaseDate = prototype.releaseDate;
    if (releaseDate != null && releaseDate !== '') {
      for (const material of materials) {
        const current = earliestByMaterial[material];
        if (current == null || releaseDate < current) {
          earliestByMaterial[material] = releaseDate;
        }
      }
    }

    // Lost Technology (materials among retired works)
    if (prototype.status === STATUS_RETIRED) {
      for (const material of materials) {
        retiredMaterialCounts[material] =
          (retiredMaterialCounts[material] ?? 0) + 1;
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

  const primordial: PrimordialEntry[] = Object.entries(earliestByMaterial)
    .filter(
      ([material]) => (materialCounts[material] ?? 0) >= MIN_COUNT_FOR_PRIMORDIAL,
    )
    .map(([material, firstReleaseDate]) => ({
      material,
      firstReleaseDate,
      count: materialCounts[material] ?? 0,
    }))
    .sort((a, b) => a.firstReleaseDate.localeCompare(b.firstReleaseDate))
    .slice(0, TOP_LIMIT);

  const lostTech: LostTechEntry[] = Object.entries(retiredMaterialCounts)
    .map(([material, count]) => ({ material, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_LIMIT);

  return {
    kitchenSink: kitchenSink.slice(0, KITCHEN_SINK_LIMIT),
    countEngagement,
    primordial,
    lostTech,
  };
}
