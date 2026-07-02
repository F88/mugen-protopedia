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
        {work.materials.map((material) => (
          <li
            key={material}
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
  const maxRate = Math.max(...buckets.map((b) => b.avgGoodRate), 0.0001);
  return (
    <section aria-labelledby="less-is-more-heading" className="mt-12">
      <SectionHeading
        id="less-is-more-heading"
        title="Less is More?"
        description="Average engagement by the number of materials a work uses. Do lean builds punch above their weight?"
      />
      <div className="space-y-2">
        {buckets.map((bucket) => (
          <div key={bucket.label} className="flex items-center gap-3">
            <span className="w-10 shrink-0 text-right font-mono text-sm text-violet-700 dark:text-violet-300">
              {bucket.label}
            </span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-violet-100 dark:bg-violet-950/50">
              <div
                className="h-full rounded bg-linear-to-r from-emerald-500 to-lime-400 dark:from-emerald-600 dark:to-lime-500"
                style={{ width: `${(bucket.avgGoodRate / maxRate) * 100}%` }}
              />
            </div>
            <span className="w-28 shrink-0 font-mono text-xs text-violet-800 dark:text-emerald-200">
              {(bucket.avgGoodRate * 100).toFixed(1)}% · {bucket.works} works
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-violet-700/70 dark:text-violet-300/60">
        Good-rate = likes / views (works with at least 30 views). Correlation,
        not causation.
      </p>
    </section>
  );
}

/** The Primordial Element — oldest materials still in active use. */
export function PrimordialSection({
  materials,
}: {
  materials: PrimordialEntry[];
}) {
  return (
    <section aria-labelledby="primordial-heading" className="mt-12">
      <SectionHeading
        id="primordial-heading"
        title="The Primordial Element"
        description="The oldest materials that are still in use — primordial, yet undecayed."
      />
      <ol className="space-y-1">
        {materials.map((entry) => (
          <li
            key={entry.material}
            className="flex items-baseline gap-3 rounded-md px-2 py-1 hover:bg-violet-100/50 dark:hover:bg-violet-950/40"
          >
            <span className="w-14 shrink-0 font-mono text-sm text-amber-700 dark:text-amber-300">
              {entry.firstReleaseDate.slice(0, 4)}
            </span>
            <span className="flex-1 truncate text-violet-950 dark:text-violet-100">
              {entry.material}
            </span>
            <span className="shrink-0 font-mono text-sm text-emerald-700 dark:text-emerald-300">
              {entry.count}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Lost Technology — materials common among retired (供養) works. */
export function LostTechnologySection({
  materials,
}: {
  materials: LostTechEntry[];
}) {
  if (materials.length === 0) return null;
  return (
    <section aria-labelledby="lost-tech-heading" className="mt-12">
      <SectionHeading
        id="lost-tech-heading"
        title="Lost Technology"
        description="Materials that appear most among works laid to rest — an archaeology of tools that had their moment."
      />
      <ol className="space-y-1">
        {materials.map((entry, index) => (
          <li
            key={entry.material}
            className="flex items-baseline gap-3 rounded-md px-2 py-1 hover:bg-violet-100/50 dark:hover:bg-violet-950/40"
          >
            <span className="w-6 shrink-0 font-mono text-sm text-violet-500 dark:text-violet-400">
              {index + 1}
            </span>
            <span className="flex-1 truncate text-violet-950 dark:text-violet-100">
              {entry.material}
            </span>
            <span className="shrink-0 font-mono text-sm text-stone-600 dark:text-stone-300">
              {entry.count}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
