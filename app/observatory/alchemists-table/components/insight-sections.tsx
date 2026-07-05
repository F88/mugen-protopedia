/**
 * @fileoverview Material insight sections for The Alchemist's Table.
 *
 * Data-light sections computed from a single pass over the prototype dataset
 * (see `lib/observatory/build-material-insights.ts`):
 * - The Kitchen Sink (most materials per work)
 * - Less is More? (engagement by material count)
 * - The Primordial Element (oldest materials still in use)
 * - Lost Technology (materials common among retired works)
 * - The Monumental Elements (most-used materials of all time)
 */
import type { ReactNode } from 'react';

import type {
  KitchenSinkEntry,
  MaterialCountBucket,
  PrimordialEntry,
  RisingVaporsEntry,
  NewfoundEntry,
  LostTechEntry,
  MonumentalEntry,
} from '@/lib/observatory/build-material-insights';

import {
  SectionHeading,
  SectionNotes,
  type SectionCopy,
} from './section-heading';
import { cn } from '@/lib/utils';
import {
  buildMaterialLink,
  buildPrototypeLink,
} from '@/lib/utils/prototype-utils';

/** Class sets per ranking tier, so the 3 styles live in one place. */
interface RankTier {
  number: string;
  name: string;
  count: string;
  chip: string;
}

function rankTier(index: number): RankTier {
  if (index < 3) {
    return {
      number:
        'w-6 sm:w-10 shrink-0 text-xl sm:text-4xl font-bold text-amber-600 dark:text-amber-400',
      name: 'text-xl sm:text-2xl font-semibold',
      count: 'text-xl sm:text-2xl',
      chip: 'text-base sm:text-xl',
    };
  }
  if (index < 10) {
    return {
      number:
        'w-6 sm:w-10 shrink-0 text-base sm:text-2xl text-red-500 dark:text-red-400',
      name: 'text-base sm:text-xl',
      count: 'text-base sm:text-xl',
      chip: 'text-sm sm:text-base',
    };
  }
  return {
    number:
      'w-6 sm:w-10 shrink-0 text-sm sm:text-base text-violet-500 dark:text-violet-400',
    name: 'text-sm sm:text-lg',
    count: 'text-sm sm:text-lg',
    chip: 'text-xs sm:text-sm',
  };
}

/** One ranked row of The Kitchen Sink, styled by its rank tier. */
function KitchenSinkRow({
  work,
  index,
}: {
  work: KitchenSinkEntry;
  index: number;
}) {
  const tier = rankTier(index);
  return (
    <li className="rounded-md px-2 py-1.5 hover:bg-violet-100/50 dark:hover:bg-violet-950/40">
      <div className="flex items-baseline gap-3">
        <span
          className={cn(
            //
            `w-6 shrink-0 font-mono`,
            `${tier.number}`,
          )}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <a
            href={buildPrototypeLink(work.id)}
            target="_blank"
            rel="noopener noreferrer"
            className={`block wrap-break-word text-violet-950 hover:text-emerald-700 dark:text-violet-100 dark:hover:text-emerald-300 ${tier.name}`}
          >
            {work.name}
          </a>
          {work.author !== '' ? (
            <>
              <span className="mt-0.5 block wrap-break-word text-xs font-medium text-amber-500 [text-shadow:0_0_6px_rgba(251,191,36,0.55)] dark:text-amber-300 dark:[text-shadow:0_0_8px_rgba(251,191,36,0.7)]">
                🥼 {work.author}
              </span>
            </>
          ) : null}
        </div>
        <span
          title={`${work.materialCount} materials`}
          className={`shrink-0 font-mono text-emerald-700 dark:text-emerald-300 ${tier.count}`}
        >
          ⚗️ {work.materialCount}
        </span>
      </div>
      <ul className="mt-1.5 flex flex-wrap gap-1 pl-9">
        {work.materials.map((material, idx) => (
          <li key={`${material}-${idx}`}>
            <a
              href={buildMaterialLink(material)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block rounded-full border border-violet-300/50 bg-violet-100/70 px-1.5 py-0.5 leading-tight text-violet-800 transition hover:border-amber-400/80 hover:text-amber-600 hover:[text-shadow:0_0_14px_rgba(251,146,60,0.9)] dark:border-violet-400/20 dark:bg-violet-950/60 dark:text-violet-200 dark:hover:text-amber-400 ${tier.chip}`}
            >
              {material}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}

/** The Kitchen Sink — works assembled from the most materials. */
export function KitchenSinkSection({
  works,
  copy,
}: {
  works: KitchenSinkEntry[];
  copy: SectionCopy;
}) {
  return (
    <section aria-labelledby="kitchen-sink-heading" className="mt-12">
      <SectionHeading id="kitchen-sink-heading" copy={copy} />
      <ol className="space-y-3">
        {works.map((work, index) => (
          <KitchenSinkRow key={work.id} work={work} index={index} />
        ))}
      </ol>
    </section>
  );
}

/** Less is More? — engagement grouped by how many materials a work uses. */
export function LessIsMoreSection({
  buckets,
  copy,
}: {
  buckets: MaterialCountBucket[];
  copy: SectionCopy;
}) {
  const maxViews = Math.max(...buckets.map((b) => b.medianViews), 1);
  const maxLikes = Math.max(...buckets.map((b) => b.medianLikes), 1);
  return (
    <section aria-labelledby="less-is-more-heading" className="mt-12">
      <SectionHeading id="less-is-more-heading" copy={copy} />
      <div className="space-y-4">
        {buckets.map((bucket) => (
          <div key={bucket.label}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-mono text-sm font-semibold text-violet-800 dark:text-violet-200">
                {bucket.label} materials
              </span>
              <span className="font-mono text-xs text-violet-600/70 dark:text-violet-300/60">
                {bucket.works.toLocaleString()} works
              </span>
            </div>
            <MetricBar
              label="views"
              value={bucket.medianViews}
              max={maxViews}
              barClass="from-sky-400 to-indigo-400 dark:from-sky-600 dark:to-indigo-500"
            />
            <MetricBar
              label="likes"
              value={bucket.medianLikes}
              max={maxLikes}
              barClass="from-emerald-500 to-lime-400 dark:from-emerald-600 dark:to-lime-500"
            />
          </div>
        ))}
      </div>
      <SectionNotes notes={copy.notes} />
    </section>
  );
}

/** A single labeled metric bar (its own scale) used by Less is More?. */
function MetricBar({
  label,
  value,
  max,
  barClass,
}: {
  label: string;
  value: number;
  max: number;
  barClass: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-right font-mono text-[10px] uppercase tracking-wide text-violet-500 dark:text-violet-400">
        {label}
      </span>
      <div className="h-3 flex-1 overflow-hidden rounded bg-violet-100 dark:bg-violet-950/50">
        <div
          className={`h-full rounded bg-linear-to-r ${barClass}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="w-16 shrink-0 whitespace-nowrap text-right font-mono text-xs text-violet-800 dark:text-emerald-200">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

/** A compact per-year bar sparkline. `barClass` colors the bars. */
function Sparkline({
  series,
  barClass,
}: {
  series: number[];
  barClass: string;
}) {
  const max = Math.max(...series, 1);
  return (
    <div
      // className="flex h-6 shrink-0 items-end gap-px sm:gap-0.5 bg-amber-400"
      className="flex h-6 shrink-0 items-end gap-px sm:gap-0.5"
      aria-hidden="true"
    >
      {series.map((value, index) => (
        <div
          key={index}
          className={cn(
            //
            `w-1 rounded-sm sm:w-2 lg:w-3`,
            `${value > 0 ? barClass : 'bg-transparent'}`,
          )}
          style={{
            height: `${Math.max((value / max) * 100, value > 0 ? 8 : 0)}%`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * One row of a material ranking: `[meta | material | sparkline | 💎count]`.
 * Shared by the five sparkline-ranking sections; each supplies its own `meta`
 * cell (a rank number or a year label) and its own accent classes, so the row
 * structure lives in one place while the sections keep their distinct looks.
 */
function MaterialRankRow({
  metaClassName,
  metaTitle,
  metaContent,
  material,
  series,
  count,
  barClass,
  countClassName,
  nameClassName = '',
}: {
  /** Section-specific classes for the left cell (width, size, color). */
  metaClassName: string;
  /** Optional tooltip for the left cell (only the year-label sections use it). */
  metaTitle?: string;
  /** The left cell's content: a rank number or a year label. */
  metaContent: ReactNode;
  material: string;
  series: number[];
  count: number;
  /** Sparkline bar color. */
  barClass: string;
  /** Section-specific accent color for the 💎 count cell. */
  countClassName: string;
  /** Appended to the material name (e.g. a rank tier's font size). */
  nameClassName?: string;
}) {
  return (
    <li className="flex items-center gap-2 sm:gap-5 rounded-md px-2 py-1 hover:bg-violet-100/50 dark:hover:bg-violet-950/40">
      {/* metaContent */}
      <span
        className={cn(
          //
          // `font-mono`,
          `whitespace-nowrap`,
          `text-center`,
          'text-xs sm:text-lg',
          `${metaClassName}`,
          // 'bg-blue-700',
        )}
        title={metaTitle}
      >
        {metaContent}
      </span>
      <a
        href={buildMaterialLink(material)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          //
          `flex-1 truncate text-violet-950 dark:text-violet-100`,
          `transition hover:text-amber-600 dark:hover:text-amber-400`,
          `hover:[text-shadow:0_0_14px_rgba(251,146,60,0.9)]`,
          'text-sm sm:text-lg',
          nameClassName,
          // 'bg-teal-700',
        )}
      >
        {material}
      </a>
      <Sparkline
        series={series}
        barClass={cn(
          //
          barClass,
          // 'bg-yellow-400/700',
        )}
      />
      <span
        title={`${count} prototypes`}
        className={cn(
          //
          `w-16 shrink-0 whitespace-nowrap text-right`,
          `font-mono`,
          'text-sm sm:text-lg',
          countClassName,
          // 'bg-teal-700',
        )}
      >
        💎 {count.toLocaleString()}
      </span>
    </li>
  );
}

/**
 * Top `n` entries, extended to include every entry tied with the nth by `key` —
 * so a rank group is never split by the cut (no data loss at equal ranks).
 * Assumes `items` is already sorted with tied entries adjacent.
 */
function topNWithTies<T>(items: T[], n: number, key: (item: T) => number): T[] {
  if (items.length <= n) return items;
  const cutoff = key(items[n - 1]);
  let end = n;
  while (end < items.length && key(items[end]) === cutoff) end++;
  return items.slice(0, end);
}

/**
 * Competition ranks (1, 2, 2, 4, ...) for an array already sorted by `key`
 * descending — equal keys share the same rank. So a displayed rank means a real
 * rank, never just a position.
 */
function competitionRanks<T>(items: T[], key: (item: T) => number): number[] {
  const ranks: number[] = [];
  for (let i = 0; i < items.length; i++) {
    ranks.push(
      i > 0 && key(items[i]) === key(items[i - 1]) ? ranks[i - 1] : i + 1,
    );
  }
  return ranks;
}

/**
 * Renders already-built row elements, showing the first `visible` up front and
 * tucking the rest behind a native <details> toggle — no client JS, so the
 * section stays a Server Component.
 */
function CollapsibleRows({
  rows,
  visible = 20,
}: {
  rows: ReactNode[];
  visible?: number;
}) {
  return (
    <>
      <ol className="space-y-1">{rows.slice(0, visible)}</ol>
      {rows.length > visible ? (
        <details className="group">
          <summary className="mt-1 inline-flex w-fit cursor-pointer list-none items-center gap-1 rounded-md px-2 py-1 font-mono text-xs font-medium text-orange-600 underline underline-offset-2 hover:bg-orange-100/50 hover:text-red-600 dark:text-orange-400 dark:hover:bg-orange-950/30 dark:hover:text-red-300 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">
              🔥 show all {rows.length} ▾
            </span>
            <span className="hidden group-open:inline">💧 show less ▴</span>
          </summary>
          <ol className="mt-1 space-y-1">{rows.slice(visible)}</ol>
        </details>
      ) : null}
    </>
  );
}

/**
 * The Monumental Elements — the most-used materials of all time, ranked purely
 * by total usage. A time-agnostic ranking that catches high-volume staples the
 * temporal sections miss (still going with an early gap, faded, or just risen).
 */
export function MonumentalSection({
  materials,
  copy,
  limit = 12,
}: {
  materials: MonumentalEntry[];
  copy: SectionCopy;
  limit?: number;
}) {
  if (materials.length === 0) return null;
  const rows = topNWithTies(materials, limit, (e) => e.count);
  const ranks = competitionRanks(rows, (e) => e.count);
  const rendered = rows.map((entry, index) => {
    // Style by the competition rank (not the row index), so tied ranks look
    // identical — matching The Magnum Opus's rank tiers.
    const tier = rankTier(ranks[index] - 1);
    return (
      <MaterialRankRow
        key={entry.material}
        metaClassName={`${tier.number}`}
        metaContent={ranks[index]}
        material={entry.material}
        series={entry.series}
        count={entry.count}
        barClass="bg-violet-500/70 dark:bg-violet-400/70"
        countClassName="text-amber-600 dark:text-amber-400"
        nameClassName={tier.name}
      />
    );
  });
  return (
    <section aria-labelledby="monumental-heading" className="mt-12">
      <SectionHeading id="monumental-heading" copy={copy} />
      <CollapsibleRows visible={20} rows={rendered} />
      <SectionNotes notes={copy.notes} />
    </section>
  );
}

/**
 * The Primordial Element — old materials used every year since debut (still
 * going). Ranked oldest-first; the sparkline shows unbroken yearly use.
 */
export function PrimordialSection({
  materials,
  copy,
  limit = 12,
}: {
  materials: PrimordialEntry[];
  copy: SectionCopy;
  limit?: number;
}) {
  if (materials.length === 0) return null;
  const rows = topNWithTies(materials, limit, (e) => e.firstYear);
  return (
    <section aria-labelledby="primordial-heading" className="mt-12">
      <SectionHeading id="primordial-heading" copy={copy} />
      <CollapsibleRows
        visible={20}
        rows={rows.map((entry) => (
          <MaterialRankRow
            key={entry.material}
            metaClassName="text-emerald-700 dark:text-emerald-300"
            metaTitle={`${entry.firstYear}–${entry.latestYear}`}
            metaContent={
              <>
                {entry.firstYear}– ({entry.latestYear - entry.firstYear + 1}y)
              </>
            }
            material={entry.material}
            series={entry.series}
            count={entry.count}
            barClass="bg-emerald-500/70 dark:bg-emerald-400/70"
            countClassName="text-emerald-700 dark:text-emerald-300"
          />
        ))}
      />
      <SectionNotes notes={copy.notes} />
    </section>
  );
}

/**
 * The Rising Vapors — materials that debuted in the last couple of years (but
 * not this year) and are still in use. Recent risers, not brand new.
 */
export function RisingVaporsSection({
  materials,
  copy,
  latestYear,
  limit = 12,
}: {
  materials: RisingVaporsEntry[];
  copy: SectionCopy;
  latestYear: number;
  limit?: number;
}) {
  if (materials.length === 0) return null;
  const rows = topNWithTies(materials, limit, (e) => e.count);
  return (
    <section aria-labelledby="rising-vapors-heading" className="mt-12">
      <SectionHeading id="rising-vapors-heading" copy={copy} />
      <CollapsibleRows
        visible={20}
        rows={rows.map((entry) => (
          <MaterialRankRow
            key={entry.material}
            metaClassName="text-orange-700 dark:text-orange-300"
            metaContent={entry.firstYear}
            material={entry.material}
            series={entry.series}
            count={entry.count}
            barClass="bg-orange-500/70 dark:bg-orange-400/70"
            countClassName="text-orange-700 dark:text-orange-300"
          />
        ))}
      />
      <SectionNotes notes={copy.notes} latestYear={latestYear} />
    </section>
  );
}

/**
 * Lost Technology — materials used for years but silent for the last couple of
 * years. The sparkline's trailing zeros show the fade-out.
 */
export function LostTechnologySection({
  materials,
  copy,
  latestYear,
  limit = 12,
}: {
  materials: LostTechEntry[];
  copy: SectionCopy;
  latestYear: number;
  limit?: number;
}) {
  if (materials.length === 0) return null;
  const rows = topNWithTies(materials, limit, (e) => e.count);
  return (
    <section aria-labelledby="lost-tech-heading" className="mt-12">
      <SectionHeading id="lost-tech-heading" copy={copy} />
      <CollapsibleRows
        visible={20}
        rows={rows.map((entry) => (
          <MaterialRankRow
            key={entry.material}
            metaClassName="text-stone-500 dark:text-stone-400"
            metaTitle={`${entry.firstYear}–${entry.lastYear}`}
            metaContent={
              <>
                {entry.firstYear}–{entry.lastYear}
              </>
            }
            material={entry.material}
            series={entry.series}
            count={entry.count}
            barClass="bg-stone-400/70 dark:bg-stone-500/70"
            countClassName="text-stone-600 dark:text-stone-300"
          />
        ))}
      />
      <SectionNotes notes={copy.notes} latestYear={latestYear} />
    </section>
  );
}

/**
 * The Newfound Element — materials first used THIS year. The sparkline is a lone
 * spark at the right edge: something that just came into being.
 */
export function NewfoundSection({
  materials,
  copy,
  limit = 12,
}: {
  materials: NewfoundEntry[];
  copy: SectionCopy;
  limit?: number;
}) {
  if (materials.length === 0) return null;
  const rows = topNWithTies(materials, limit, (e) => e.count);
  const ranks = competitionRanks(rows, (e) => e.count);
  return (
    <section aria-labelledby="newfound-heading" className="mt-12">
      <SectionHeading id="newfound-heading" copy={copy} />
      <CollapsibleRows
        visible={20}
        rows={rows.map((entry, index) => {
          // Style by the competition rank (not the row index), so tied ranks
          // look identical — matching The Magnum Opus's rank tiers.
          const tier = rankTier(ranks[index] - 1);
          return (
            <MaterialRankRow
              key={entry.material}
              metaClassName={`${tier.number}`}
              metaContent={ranks[index]}
              material={entry.material}
              series={entry.series}
              count={entry.count}
              barClass="bg-sky-500/70 dark:bg-sky-400/70"
              countClassName="text-sky-700 dark:text-sky-300"
              nameClassName={tier.name}
            />
          );
        })}
      />
      <SectionNotes notes={copy.notes} />
    </section>
  );
}
