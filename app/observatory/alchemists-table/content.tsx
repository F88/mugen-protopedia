import { Suspense } from 'react';

import { getMaterialAnalysis } from '@/app/actions/material-analysis';
import { cinzelFont } from '@/app/observatory/shared/fonts';

import {
  PeriodicTableSection,
  type MaterialElement,
} from './components/periodic-table-section';
import {
  KitchenSinkSection,
  LessIsMoreSection,
  PrimordialSection,
  RisingVaporsSection,
  NewfoundSection,
  LostTechnologySection,
} from './components/insight-sections';

/** How many materials to lay out on the table (a real periodic table has 118). */
// const MAX_ELEMENTS = 9999;
const MAX_ELEMENTS = 118;

function toRankedElements(
  materialCounts: Record<string, number>,
): MaterialElement[] {
  return Object.entries(materialCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_ELEMENTS)
    .map(([material, count]) => ({ material, count }));
}

async function AlchemistsTableDashboard() {
  const result = await getMaterialAnalysis();

  if (!result.ok) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block rounded-2xl bg-red-50 p-8 dark:bg-red-900/20">
          <h1 className="mb-2 text-2xl font-bold text-red-600 dark:text-red-400">
            The Crucible Cracked
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Unable to distill the materials from the ProtoPedia universe.
          </p>
          <p className="mt-4 text-sm text-gray-500">{result.error}</p>
        </div>
      </div>
    );
  }

  const insights = result.data;
  const elements = toRankedElements(insights.materialCounts);

  return (
    <>
      <PeriodicTableSection elements={elements} />
      <PrimordialSection
        materials={insights.primordial}
        //
        limit={30}
      />
      <RisingVaporsSection
        materials={insights.risingVapors}
        latestYear={insights.latestYear}
        limit={30}
      />
      <LostTechnologySection
        materials={insights.lostTech}
        latestYear={insights.latestYear}
        limit={30}
      />

      <NewfoundSection materials={insights.newfound} limit={30} />

      <KitchenSinkSection works={insights.kitchenSink} />
      <LessIsMoreSection buckets={insights.countEngagement} />
    </>
  );
}

export function AlchemistsTableContent() {
  return (
    <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1
          className={`${cinzelFont.className} text-3xl font-bold tracking-tight text-violet-950 dark:text-white sm:text-4xl`}
        >
          The Alchemist&apos;s Table
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-violet-900/80 dark:text-violet-200/80">
          The elements of creation. Discover the materials makers build with —
          and the combinations they forge.
        </p>
        <ul className="mx-auto mt-4 max-w-2xl space-y-0.5 text-xs text-violet-700/70 dark:text-violet-300/60">
          <li>* Analysis covers all prototypes on ProtoPedia.</li>
          <li>* Materials are the tools and parts listed on each prototype.</li>
          <li>
            * Yearly figures use the release date (creation date if missing).
          </li>
          <li>
            * Material names are counted as written (no spelling normalization).
          </li>
        </ul>
      </div>

      <div className="mx-auto max-w-6xl">
        <Suspense
          fallback={
            <p className="py-12 text-center text-violet-700 dark:text-violet-300">
              Distilling the elements...
            </p>
          }
        >
          <AlchemistsTableDashboard />
        </Suspense>
      </div>
    </div>
  );
}
