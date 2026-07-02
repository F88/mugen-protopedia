/**
 * @fileoverview Material insight sections for The Alchemist's Table.
 *
 * Data-light sections computed from a single pass over the prototype dataset
 * (see `lib/analysis/batch/build-material-insights.ts`):
 * - The Kitchen Sink (most materials per work)
 * - Less is More? (engagement by material count)
 * - The Primordial Element (oldest materials still in use)
 * - Lost Technology (materials common among retired works)
 */
import { cinzelFont } from '@/app/observatory/shared/fonts';

import type {
  KitchenSinkEntry,
  MaterialCountBucket,
  PrimordialEntry,
  RisingVaporsEntry,
  NewfoundEntry,
  LostTechEntry,
} from '@/lib/analysis/batch/build-material-insights';

function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h2
        id={id}
        className={`${cinzelFont.className} text-2xl font-semibold text-violet-950 dark:text-violet-100 sm:text-3xl`}
      >
        {title}
      </h2>
      <p className="mt-2 text-violet-900/80 dark:text-violet-200/80">
        {description}
      </p>
    </div>
  );
}

const PROTOTYPE_URL = 'https://protopedia.net/prototype/';

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
      number: 'text-xl font-bold text-amber-600 dark:text-amber-400',
      name: 'text-xl font-semibold',
      count: 'text-xl',
      chip: 'text-xs',
    };
  }
  if (index < 10) {
    return {
      number: 'text-base text-violet-500 dark:text-violet-400',
      name: 'text-base',
      count: 'text-base',
      chip: 'text-[11px]',
    };
  }
  return {
    number: 'text-sm text-violet-500 dark:text-violet-400',
    name: 'text-sm',
    count: 'text-sm',
    chip: 'text-[10px]',
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
        <span className={`w-8 shrink-0 font-mono ${tier.number}`}>
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <a
            href={`${PROTOTYPE_URL}${work.id}`}
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
          <li
            key={`${material}-${idx}`}
            className={`rounded-full border border-violet-300/50 bg-violet-100/70 px-1.5 py-0.5 leading-tight text-violet-800 dark:border-violet-400/20 dark:bg-violet-950/60 dark:text-violet-200 ${tier.chip}`}
          >
            {material}
          </li>
        ))}
      </ul>
    </li>
  );
}

/** The Kitchen Sink — works assembled from the most materials. */
export function KitchenSinkSection({ works }: { works: KitchenSinkEntry[] }) {
  return (
    <section aria-labelledby="kitchen-sink-heading" className="mt-12">
      <SectionHeading
        id="kitchen-sink-heading"
        title="The Magnum Opus"
        description="The great work — creations forged from the most materials of all."
      />
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
}: {
  buckets: MaterialCountBucket[];
}) {
  const maxViews = Math.max(...buckets.map((b) => b.medianViews), 1);
  const maxLikes = Math.max(...buckets.map((b) => b.medianLikes), 1);
  return (
    <section aria-labelledby="less-is-more-heading" className="mt-12">
      <SectionHeading
        id="less-is-more-heading"
        title="Less is More?"
        description="Two independent axes by the number of materials a work uses: how much it is seen (views) and how much it is liked (likes). Do lean builds punch above their weight?"
      />
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
      <p className="mt-2 text-xs text-violet-700/70 dark:text-violet-300/60">
        Median views and median likes per work (independent axes, each scaled to
        its own maximum). Correlation, not causation.
      </p>
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
      className="flex h-6 shrink-0 items-end gap-px sm:gap-0.5"
      aria-hidden="true"
    >
      {series.map((value, index) => (
        <div
          key={index}
          className={`w-1 rounded-sm sm:w-2 lg:w-3 ${value > 0 ? barClass : 'bg-transparent'}`}
          style={{
            height: `${Math.max((value / max) * 100, value > 0 ? 8 : 0)}%`,
          }}
        />
      ))}
    </div>
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
 * The Primordial Element — old materials used every year since debut (still
 * going). Ranked oldest-first; the sparkline shows unbroken yearly use.
 */
export function PrimordialSection({
  materials,
  limit = 12,
}: {
  materials: PrimordialEntry[];
  limit?: number;
}) {
  if (materials.length === 0) return null;
  const rows = topNWithTies(materials, limit, (e) => e.firstYear);
  return (
    <section aria-labelledby="primordial-heading" className="mt-12">
      <SectionHeading
        id="primordial-heading"
        title="The Primordial Element"
        description="Ancient and unkillable — elements from the elder days that have never once skipped a year. The immortal bedrock makers still build on."
      />
      <ol className="space-y-1">
        {rows.map((entry) => (
          <li
            key={entry.material}
            className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-violet-100/50 dark:hover:bg-violet-950/40"
          >
            <span
              className="w-24 shrink-0 whitespace-nowrap font-mono text-xs text-amber-700 dark:text-amber-300"
              title={`${entry.firstYear}–${entry.latestYear}`}
            >
              {entry.firstYear}– ({entry.latestYear - entry.firstYear + 1}y)
            </span>
            <span className="flex-1 truncate text-violet-950 dark:text-violet-100">
              {entry.material}
            </span>
            <Sparkline
              series={entry.series}
              barClass="bg-emerald-500/70 dark:bg-emerald-400/70"
            />
            <span
              title={`${entry.count} prototypes`}
              className="w-16 shrink-0 whitespace-nowrap text-right font-mono text-sm text-emerald-700 dark:text-emerald-300"
            >
              💎 {entry.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ol>
      <ul className="mt-2 space-y-0.5 text-xs text-violet-700/70 dark:text-violet-300/60">
        <li>* 20+ total prototypes (💎)</li>
        <li>* Debuted 5+ years ago</li>
        <li>* Used every year since debut (no gaps)</li>
        <li>* Ordered by oldest debut</li>
        <li>* Bars = prototypes per year</li>
      </ul>
    </section>
  );
}

/**
 * The Rising Vapors — materials that debuted in the last couple of years (but
 * not this year) and are still in use. Recent risers, not brand new.
 */
export function RisingVaporsSection({
  materials,
  latestYear,
  limit = 12,
}: {
  materials: RisingVaporsEntry[];
  latestYear: number;
  limit?: number;
}) {
  if (materials.length === 0) return null;
  const rows = topNWithTies(materials, limit, (e) => e.count);
  return (
    <section aria-labelledby="rising-vapors-heading" className="mt-12">
      <SectionHeading
        id="rising-vapors-heading"
        title="The Rising Vapors"
        description="Reagents that have stirred the cauldron in the last two years. Not yet ancient, but no longer new — the elements currently shaping the landscape of our alchemy, rising with a momentum that cannot be ignored."
      />
      <ol className="space-y-1">
        {rows.map((entry) => (
          <li
            key={entry.material}
            className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-violet-100/50 dark:hover:bg-violet-950/40"
          >
            <span className="w-14 shrink-0 whitespace-nowrap font-mono text-xs text-amber-700 dark:text-amber-300">
              {entry.firstYear}
            </span>
            <span className="flex-1 truncate text-violet-950 dark:text-violet-100">
              {entry.material}
            </span>
            <Sparkline
              series={entry.series}
              barClass="bg-amber-500/70 dark:bg-amber-400/70"
            />
            <span
              title={`${entry.count} prototypes`}
              className="w-16 shrink-0 whitespace-nowrap text-right font-mono text-sm text-amber-700 dark:text-amber-300"
            >
              💎 {entry.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ol>
      <ul className="mt-2 space-y-0.5 text-xs text-violet-700/70 dark:text-violet-300/60">
        <li>* No minimum count — even a handful qualifies (💎)</li>
        <li>
          * Found in {latestYear - 2}–{latestYear - 1} (the last two years)
        </li>
        <li>* Still used this year ({latestYear})</li>
        <li>* Ordered by most prototypes</li>
        <li>* Bars = prototypes per year</li>
      </ul>
    </section>
  );
}

/**
 * The Newfound Element — materials first used THIS year. The sparkline is a lone
 * spark at the right edge: something that just came into being.
 */
export function NewfoundSection({
  materials,
  limit = 12,
}: {
  materials: NewfoundEntry[];
  limit?: number;
}) {
  if (materials.length === 0) return null;
  const rows = topNWithTies(materials, limit, (e) => e.count);
  const ranks = competitionRanks(rows, (e) => e.count);
  return (
    <section aria-labelledby="newfound-heading" className="mt-12">
      <SectionHeading
        id="newfound-heading"
        title="The Newfound Element"
        description="Strange new matter, freshly discovered — from the stars above or the trenches below. The newcomers the world just started using."
      />
      <ol className="space-y-1">
        {rows.map((entry, index) => {
          // Style by the competition rank (not the row index), so tied ranks
          // look identical — matching The Magnum Opus's rank tiers.
          const tier = rankTier(ranks[index] - 1);
          return (
            <li
              key={entry.material}
              className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-violet-100/50 dark:hover:bg-violet-950/40"
            >
              <span className={`w-8 shrink-0 font-mono ${tier.number}`}>
                {ranks[index]}
              </span>
              <span
                className={`flex-1 truncate text-violet-950 dark:text-violet-100 ${tier.name}`}
              >
                {entry.material}
              </span>
              <Sparkline
                series={entry.series}
                barClass="bg-sky-500/70 dark:bg-sky-400/70"
              />
              <span
                title={`${entry.count} prototypes`}
                className={`shrink-0 whitespace-nowrap text-right font-mono text-sky-700 dark:text-sky-300 ${tier.count}`}
              >
                💎 {entry.count.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ol>
      <ul className="mt-2 space-y-0.5 text-xs text-violet-700/70 dark:text-violet-300/60">
        <li>* No minimum count — even a single spark qualifies (💎)</li>
        <li>* Found in the last 12 months</li>
        <li>* Ordered by most prototypes</li>
        <li>* Bars = prototypes per month (last 12 months)</li>
      </ul>
    </section>
  );
}

/**
 * Lost Technology — materials used for years but silent for the last couple of
 * years. The sparkline's trailing zeros show the fade-out.
 */
export function LostTechnologySection({
  materials,
  latestYear,
  limit = 12,
}: {
  materials: LostTechEntry[];
  latestYear: number;
  limit?: number;
}) {
  if (materials.length === 0) return null;
  const rows = topNWithTies(materials, limit, (e) => e.count);
  return (
    <section aria-labelledby="lost-tech-heading" className="mt-12">
      <SectionHeading
        id="lost-tech-heading"
        title="Lost Technology"
        description="Ghosts of workshops past — elements that burned bright for years, then fell silent. Gathering dust, unused for two winters and counting."
      />
      <ol className="space-y-1">
        {rows.map((entry) => (
          <li
            key={entry.material}
            className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-violet-100/50 dark:hover:bg-violet-950/40"
          >
            <span
              className="w-24 shrink-0 whitespace-nowrap font-mono text-xs text-stone-500 dark:text-stone-400"
              title={`${entry.firstYear}–${entry.lastYear}`}
            >
              {entry.firstYear}–{entry.lastYear}
            </span>
            <span className="flex-1 truncate text-violet-950 dark:text-violet-100">
              {entry.material}
            </span>
            <Sparkline
              series={entry.series}
              barClass="bg-stone-400/70 dark:bg-stone-500/70"
            />
            <span
              title={`${entry.count} prototypes`}
              className="w-16 shrink-0 whitespace-nowrap text-right font-mono text-sm text-stone-600 dark:text-stone-300"
            >
              💎 {entry.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ol>
      <ul className="mt-2 space-y-0.5 text-xs text-violet-700/70 dark:text-violet-300/60">
        <li>* 20+ total prototypes (💎)</li>
        <li>* Used across 3+ years</li>
        <li>
          * No use in {latestYear - 1} or {latestYear} (the 2 latest years)
        </li>
        <li>* Ordered by most prototypes</li>
        <li>* Bars = prototypes per year (trailing empty = faded out)</li>
      </ul>
    </section>
  );
}
