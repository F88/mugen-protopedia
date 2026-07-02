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

/** Engagement aggregated by how many materials a work uses (Less is More?). */
export interface MaterialCountBucket {
  label: string;
  works: number;
  /** Mean good-rate (good/view) over works with enough views. */
  avgGoodRate: number;
  /** Mean good count over all works in the bucket. */
  avgGood: number;
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
/** Minimum views before a good-rate is trusted (avoids tiny-sample noise). */
const MIN_VIEWS_FOR_RATE = 30;
/** Minimum overall usage for a material to count as "primordial" (not a one-off). */
const MIN_COUNT_FOR_PRIMORDIAL = 5;
/** Retired prototype status (供養). */
const STATUS_RETIRED = 4;

function bucketLabel(materialCount: number): string {
  if (materialCount <= 1) return '1';
  if (materialCount === 2) return '2';
  if (materialCount === 3) return '3';
  if (materialCount <= 5) return '4-5';
  return '6+';
}

const BUCKET_ORDER = ['1', '2', '3', '4-5', '6+'] as const;

export function buildMaterialInsights(
  prototypes: PrototypeForMpp[],
  materialCounts: Record<string, number>,
): MaterialInsights {
  const kitchenSink: KitchenSinkEntry[] = [];

  // Less is More? accumulators, keyed by bucket label.
  const bucketWorks: Record<string, number> = {};
  const bucketGoodSum: Record<string, number> = {};
  const bucketRateSum: Record<string, number> = {};
  const bucketRateN: Record<string, number> = {};

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

    // Less is More? (engagement by material count)
    const label = bucketLabel(materials.length);
    bucketWorks[label] = (bucketWorks[label] ?? 0) + 1;
    bucketGoodSum[label] = (bucketGoodSum[label] ?? 0) + prototype.goodCount;
    if (prototype.viewCount >= MIN_VIEWS_FOR_RATE) {
      bucketRateSum[label] =
        (bucketRateSum[label] ?? 0) + prototype.goodCount / prototype.viewCount;
      bucketRateN[label] = (bucketRateN[label] ?? 0) + 1;
    }

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
    (label) => (bucketWorks[label] ?? 0) > 0,
  ).map((label) => ({
    label,
    works: bucketWorks[label] ?? 0,
    avgGood: (bucketGoodSum[label] ?? 0) / (bucketWorks[label] ?? 1),
    avgGoodRate:
      (bucketRateN[label] ?? 0) > 0
        ? (bucketRateSum[label] ?? 0) / (bucketRateN[label] ?? 1)
        : 0,
  }));

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
