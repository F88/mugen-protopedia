'use client';

/**
 * @fileoverview Client-side name search across The Elemental Chronicles.
 *
 * Both facet sections ({@link ElementNatureSection} the material, and
 * {@link ElementForgersSection} its people) read the SAME material list, so one
 * search box drives both: the query filters once here and the result is handed
 * to each section unchanged. The whole material list is a client prop so the
 * search can reach every material, not just the top-usage default view.
 *
 * A single "show N" selector ({@link PAGE_SIZES}) caps BOTH views: with no query
 * it is the count of most-used materials shown, and while searching it caps how
 * many matches render per facet (so a broad term like "a" cannot draw hundreds
 * of cards at once).
 */
import { useId, useMemo, useState } from 'react';

import type { MaterialChronicle } from '@/lib/observatory/build-chronicles-insights';

import {
  ElementForgersSection,
  ElementNatureSection,
} from './elemental-chronicles-section';
import { SectionHeading, type SectionCopy } from './section-heading';

/**
 * The counts the reader can pick from; the first is the initial selection.
 * The default (3) is a compact preview that fills one row at the 3-col grid
 * width; the larger (30, a multiple of 6) fills evenly at both grid widths
 * (2 and 3 cols).
 */
const PAGE_SIZES = [3, 30] as const;

const INPUT_CLASS =
  'rounded-full border border-violet-300/70 bg-white/70 px-5 py-2.5 text-sm text-violet-900 shadow-sm outline-none transition placeholder:text-violet-400 focus:border-amber-400/80 focus:shadow-[0_0_18px_2px_rgba(245,158,11,0.35)] dark:border-violet-700/60 dark:bg-violet-950/40 dark:text-violet-100 dark:placeholder:text-violet-500';

/** A count in the status line, highlighted amber to stand out from the prose. */
function Count({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-semibold text-amber-600 dark:text-amber-400">
      {children}
    </span>
  );
}

export function ElementChroniclesExplorer({
  materials,
  headerCopy,
  natureCopy,
  forgersCopy,
}: {
  materials: MaterialChronicle[];
  /** The parent heading shown above the search box, over both facets. */
  headerCopy: SectionCopy;
  natureCopy: SectionCopy;
  forgersCopy: SectionCopy;
}) {
  const inputId = useId();
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const q = query.trim().toLowerCase();

  const { shown, totalMatches, isSearching } = useMemo(() => {
    if (q === '') {
      return {
        shown: materials.slice(0, pageSize),
        totalMatches: materials.length,
        isSearching: false,
      };
    }
    const matches = materials.filter((c) =>
      c.material.toLowerCase().includes(q),
    );
    return {
      shown: matches.slice(0, pageSize),
      totalMatches: matches.length,
      isSearching: true,
    };
  }, [q, materials, pageSize]);

  const trimmed = query.trim();

  return (
    <div className="pt-16">
      <SectionHeading
        id="elemental-chronicles"
        copy={headerCopy}
        className="mb-6 text-center"
      />

      <div className="mx-auto max-w-xl">
        <label htmlFor={inputId} className="sr-only">
          Search an element by name
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search an element by name…"
            className={`${INPUT_CLASS} min-w-0 flex-1`}
          />
          <div className="flex shrink-0 items-center gap-2 text-xs">
            <span className="text-violet-500 dark:text-violet-400">Show</span>
            <div className="inline-flex overflow-hidden rounded-full border border-violet-300/70 dark:border-violet-700/60">
              {PAGE_SIZES.map((size) => {
                const active = size === pageSize;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setPageSize(size)}
                    aria-pressed={active}
                    className={`px-3 py-1 font-medium transition ${
                      active
                        ? 'bg-amber-400/90 text-violet-950 [text-shadow:0_0_10px_rgba(251,191,36,0.6)]'
                        : 'text-violet-600 hover:bg-violet-100/70 dark:text-violet-300 dark:hover:bg-violet-900/40'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-violet-600 dark:text-violet-400">
          {isSearching ? (
            <>
              <Count>{totalMatches}</Count> element
              {totalMatches === 1 ? '' : 's'} match “{trimmed}”
              {totalMatches > shown.length ? (
                <>
                  {' — showing the first '}
                  <Count>{shown.length}</Count>
                </>
              ) : null}
            </>
          ) : (
            <>
              Showing the <Count>{shown.length}</Count> most-used of{' '}
              <Count>{totalMatches}</Count> elements — search to explore them all
            </>
          )}
        </p>
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-center text-sm text-violet-500 dark:text-violet-400">
          No element matches “{trimmed}”.
        </p>
      ) : (
        <>
          <ElementNatureSection chronicles={shown} copy={natureCopy} />
          <ElementForgersSection chronicles={shown} copy={forgersCopy} />
        </>
      )}
    </div>
  );
}
