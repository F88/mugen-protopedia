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
  MonumentalSection,
} from './components/insight-sections';
import type { SectionCopy } from './components/section-heading';

/**
 * Bilingual copy for every section on the page, keyed by section name. English
 * and Japanese are rendered together (no locale switch / i18n framework) — these
 * are literal bilingual strings colocated with the page.
 */
const SECTION_DEFINITIONS: Record<string, SectionCopy> = {
  periodicTable: {
    title: {
      en: 'The Elements',
      ja: '元素の一覧',
    },
    description: {
      en: 'Every material as an element. Its atomic number is how common it is; its weight is how many works are built on it.',
      ja: 'すべての素材を1つの元素として。原子番号はよく使われている順位、原子量はその素材で作られた作品の数を表す。',
    },
  },
  monumental: {
    title: {
      en: 'The Monumental Elements',
      ja: '不朽の元素',
    },
    description: {
      en: 'Carved into the very history of our craft. These are the elements that have been summoned more than any other, leaving an indelible mark on the ProtoPedia universe. They stand as testaments to the ideas they helped manifest, regardless of whether their glory was a slow burn or a blinding flash.',
      ja: '我々の創作の歴史そのものに刻まれし元素。他のどれよりも多く召喚され、ProtoPedia の宇宙に消えぬ刻印を残してきた者たち。その栄光がゆるやかな熾火であれ、まばゆい閃光であれ、それらは生み出されたアイデアの証として在り続ける。',
    },
  },
  primordial: {
    title: {
      en: 'The Primordial Element',
      ja: '原初の元素',
    },
    description: {
      en: 'Ancient and unkillable — elements from the elder days that have never once skipped a year. The immortal bedrock makers still build on.',
      ja: '古きにして不滅。一度も年を絶やすことなく在り続ける、遠い始まりの時代の元素。作り手が今なお築く、不朽の岩盤。',
    },
  },
  risingVapors: {
    title: {
      en: 'The Rising Vapors',
      ja: '立ち昇る蒸気',
    },
    description: {
      en: 'Reagents that have stirred the cauldron in the last two years. Not yet ancient, but no longer new — the elements currently shaping the landscape of our alchemy, rising with a momentum that cannot be ignored.',
      ja: 'この2年、坩堝をかき混ぜてきた試薬たち。いまだ古参ならず、されどもはや新参にもあらず。無視できぬ勢いで立ち昇り、今の錬金術の地形をかたちづくりつつある元素。',
    },
  },
  lostTech: {
    title: {
      en: 'Lost Technology',
      ja: 'ロストテクノロジー',
    },
    description: {
      en: 'Ghosts of workshops past — elements that burned bright for years, then fell silent. Gathering dust, unused for two winters and counting.',
      ja: '過ぎ去りし工房の亡霊。幾年も輝いたのち、静かに黙した元素。2度の冬をこえて使われぬまま、埃をかぶってゆく。',
    },
  },
  newFound: {
    title: {
      en: 'The Newfound Element',
      ja: '新発見の元素',
    },
    description: {
      en: 'Strange new matter, freshly discovered — from the stars above or the trenches below. The newcomers the world just started using.',
      ja: 'つい最近見いだされた奇妙な新物質。天の星々から、あるいは地の底の塹壕から。世界がたった今使い始めたばかりの新参者たち。',
    },
  },
  kitchenSink: {
    title: {
      en: 'The Magnum Opus',
      ja: '大いなる業',
    },
    description: {
      en: 'The great work — creations forged from the most materials of all.',
      ja: '大いなる業。最も多くの素材から鍛え上げられた創作物たち。',
    },
  },
  lessIsMore: {
    title: {
      en: 'Less is More?',
      ja: '少ないほど豊かか?',
    },
    description: {
      en: 'Two independent axes by the number of materials a work uses: how much it is seen (views) and how much it is liked (likes). Do lean builds punch above their weight?',
      ja: '作品が使う素材の数を軸に、2つの独立した指標を見る。どれだけ見られたか(views)と、どれだけ好まれたか(likes)。少ない素材の作品は、その身の丈以上の力を発揮するのか?',
    },
  },
};


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
      <PeriodicTableSection
        elements={elements}
        copy={SECTION_DEFINITIONS.periodicTable}
      />

      <MonumentalSection
        materials={insights.monumental}
        copy={SECTION_DEFINITIONS.monumental}
        limit={30}
      />
      <PrimordialSection
        materials={insights.primordial}
        copy={SECTION_DEFINITIONS.primordial}
        limit={30}
      />
      <RisingVaporsSection
        materials={insights.risingVapors}
        copy={SECTION_DEFINITIONS.risingVapors}
        latestYear={insights.latestYear}
        limit={30}
      />
      <LostTechnologySection
        materials={insights.lostTech}
        copy={SECTION_DEFINITIONS.lostTech}
        latestYear={insights.latestYear}
        limit={30}
      />

      <NewfoundSection
        materials={insights.newfound}
        copy={SECTION_DEFINITIONS.newFound}
        limit={30}
      />

      <KitchenSinkSection
        works={insights.kitchenSink}
        copy={SECTION_DEFINITIONS.kitchenSink}
      />
      <LessIsMoreSection
        buckets={insights.countEngagement}
        copy={SECTION_DEFINITIONS.lessIsMore}
      />
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
