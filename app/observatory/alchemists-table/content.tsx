import { Suspense } from 'react';

import { getCircleOfMastersAnalysis } from '@/app/actions/observatory/circle-of-masters-analysis';
import { getElementalChroniclesAnalysis } from '@/app/actions/observatory/elemental-chronicles-analysis';
import { getMaterialAnalysis } from '@/app/actions/observatory/material-analysis';
import { cinzelFont } from '@/app/observatory/shared/fonts';

import { ElementChroniclesExplorer } from './components/chronicles-explorer';
import { CircleOfMastersSection } from './components/circle-of-masters-section';

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
import { MaterialsYearlyTrendSection } from './components/materials-yearly-trend-section';
import { MaterialsRankFlowSection } from './components/materials-rank-flow-section';
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
      en: 'The complete catalog. Atomic numbers rank by frequency, while atomic mass scales by the count of works forged.',
      ja: '錬金術の全書。原子番号は使用頻度を、原子量はその素材で鍛えられた作品の数を表す。',
    },
  },
  monumental: {
    title: {
      en: 'The Monumental Elements',
      ja: '不朽の元素',
    },
    description: {
      en: 'Indelible legacies. Carved into the history of our craft, these elements have been summoned more than any other, leaving an indelible mark on the ProtoPedia Universe. They stand as testaments to the ideas they manifested, whether their glory was a slow burn or a blinding flash.',
      ja: '不朽の記録。我々の創作の歴史そのものに刻まれし元素。他のどれよりも多く召喚され、ProtoPediaの宇宙に消えぬ刻印を残してきた者たち。その栄光がゆるやかな熾火であれ、まばゆい閃光であれ、それらはアイデアの証として在り続ける。',
    },
    notes: [
      {
        en: 'Every material qualifies — no time constraints at all',
        ja: 'すべての素材が対象。時間的な制約は一切なし',
      },
      {
        en: 'Ranked purely by total prototypes of all time (💎)',
        ja: '全期間の累計プロトタイプ数のみで順位付け(💎)',
      },
      { en: 'Bars = prototypes per year', ja: 'バーは年ごとのプロトタイプ数' },
    ],
  },
  risingCauldron: {
    title: {
      en: 'The Rising Cauldron',
      ja: 'たぎる大釜',
    },
    description: {
      en: "Volume made manifest. The raw yearly output of the leading reagents — how high each one's usage swelled and where it receded. Not who ranked first, but how much was truly forged, year upon year.",
      ja: '顕現する熱量。主要な試薬たちが年ごとに生み出した、純然たる錬成量。どれほど高く沸き上がり、どこで引いていったか。相対的な順位ではなく、「どれだけの作品が鍛え上げられたか」を刻む絶対の記録。',
    },
    notes: [
      {
        en: "Each line tracks a material's prototype count per year — absolute volume, not relative rank",
        ja: '各線はその年のプロトタイプ産出数(相対順位ではなく、絶対的な熱量を示す)',
      },
      {
        en: 'Displays the top materials by all-time usage; hover or click a legend to isolate an element',
        ja: '全期間の累計使用数トップ層を表示。ホバーまたは凡例クリックで、単一の元素を抽出して観測可能',
      },
    ],
  },
  prometheus: {
    title: {
      en: 'The Fire of Prometheus',
      ja: 'プロメテウスの火',
    },
    description: {
      en: 'A chronicle of an awakened era. Trace the crossing lines to witness the moment when reliance on massive, external foundations collapsed, eclipsed by a newly discovered spark. The visual story of heavy structures yielding their thrones, and the absolute power of creation returning directly to the hands of the solitary maker.',
      ja: '覚醒した時代の年代記。線の交差を辿り、巨大な外部基盤への依存が崩れ去り、「新たなる火種」が頂点へと駆け上がる瞬間を目撃せよ。かつての重厚な構造物が王座を明け渡し、自らの手で万物を創り出す力が、再び一人の錬金術師へと解き放たれた歴史的転換点。',
    },
    notes: [
      {
        en: "Each line tracks a material's rank among the most-used (the final period dictates which elements are traced)",
        ja: '各線はその期間における素材の順位(追跡対象の元素は、最終期間の上位陣から選出される)',
      },
      {
        en: 'A crossing indicates an overtake; a line emerging mid-chart marks a newcomer entering the top ranks',
        ja: '線の交差は順位の逆転を、途中から現れる線は上位に食い込んだ新顔を示す',
      },
      {
        en: 'Toggle Year / Month, slide to set the observation window, and adjust the depth (Top 10 / 20 / 30)',
        ja: '年 / 月を切り替え、スライダーで観測期間を絞り込み、深さ(上位10/20/30)を選択して観測する',
      },
    ],
  },
  primordial: {
    title: {
      en: 'The Primordial Element',
      ja: '原初の元素',
    },
    description: {
      en: 'Eternal foundations. Ancient and unkillable, these elements from the days of old remain unbroken year after year. The immortal bedrock makers still build upon.',
      ja: '不滅の基盤。古きにして不滅。幾星霜を超えて途切れることなく在り続ける、遠い始まりの時代の元素。作り手が今なお築く、不朽の岩盤。',
    },
    notes: [
      { en: '20+ total prototypes (💎)', ja: '累計20個以上のプロトタイプ(💎)' },
      { en: 'Debuted 5+ years ago', ja: '5年以上前にデビュー' },
      {
        en: 'Used every year since debut (no gaps)',
        ja: 'デビュー以降、毎年使用(欠けなし)',
      },
      { en: 'Ordered by oldest debut', ja: 'デビューが古い順' },
      { en: 'Bars = prototypes per year', ja: 'バーは年ごとのプロトタイプ数' },
    ],
  },
  risingVapors: {
    title: {
      en: 'The Rising Vapors',
      ja: '立ち昇る蒸気',
    },
    description: {
      en: 'Cauldron currents. Reagents introduced within the last two years, currently rising with a momentum that is shaping the landscape of our alchemy, neither fresh nor yet forged into history.',
      ja: 'るつぼの熱気。この2年以内に現れし試薬たち。熱気はそのままに、歴史へと刻まれゆく途上のもの。無視できぬ勢いで立ち昇り、今の錬金術の地形をかたちづくっている元素。',
    },
    notes: [
      {
        en: 'No minimum count — even a handful qualifies (💎)',
        ja: '最小数の制限なし。ほんの数個でも該当(💎)',
      },
      {
        en: 'Found in {latestYear-2}–{latestYear-1} (the last two years)',
        ja: '{latestYear-2}年から{latestYear-1}年(直近2年)に登場',
      },
      {
        en: 'Still used in the latest year ({latestYear})',
        ja: '最新年({latestYear}年)も使用中',
      },
      { en: 'Ordered by most prototypes', ja: 'プロトタイプ数が多い順' },
      { en: 'Bars = prototypes per year', ja: 'バーは年ごとのプロトタイプ数' },
    ],
  },
  lostTech: {
    title: {
      en: 'Lost Technology',
      ja: 'ロストテクノロジー',
    },
    description: {
      en: 'Silent echoes. Ghosts of workshops past — elements that burned bright for years, then fell silent. Gathering dust, unused for two winters and counting.',
      ja: '静かなる残響。過ぎ去りし工房の亡霊。幾年も輝いたのち、静かに黙した元素。2度の冬をこえて使われぬまま、埃をかぶってゆく。',
    },
    notes: [
      { en: '20+ total prototypes (💎)', ja: '累計20個以上のプロトタイプ(💎)' },
      { en: 'Used across 3+ years', ja: '3年以上にわたって使用' },
      {
        en: 'No use in {latestYear-1} or {latestYear} (the 2 latest years)',
        ja: '{latestYear-1}年と{latestYear}年(直近2年)は未使用',
      },
      { en: 'Ordered by most prototypes', ja: 'プロトタイプ数が多い順' },
      {
        en: 'Bars = prototypes per year (trailing gap = the fading echo)',
        ja: 'バーは年ごとのプロトタイプ数(末尾の空白は消えゆく残響)',
      },
    ],
  },
  newFound: {
    title: {
      en: 'The Newfound Element',
      ja: '新発見の元素',
    },
    description: {
      en: 'Uncharted sparks. Strange new matter, freshly discovered from the stars above or the trenches below. The newcomers the world just started using.',
      ja: '未知の閃光。新たに発見された奇妙な新物質。天の星々から、あるいは地の底の塹壕から。世界がたった今使い始めたばかりの新参者たち。',
    },
    notes: [
      {
        en: 'No minimum count — even a single spark qualifies (💎)',
        ja: '最小数の制限なし。たった1つの閃きでも該当(💎)',
      },
      { en: 'Found in the last 12 months', ja: '直近12か月に登場' },
      { en: 'Ordered by most prototypes', ja: 'プロトタイプ数が多い順' },
      {
        en: 'Bars = prototypes per month (last 12 months)',
        ja: 'バーは月ごとのプロトタイプ数(直近12か月)',
      },
    ],
  },
  kitchenSink: {
    title: {
      en: 'The Magnum Opus',
      ja: '大いなる業',
    },
    description: {
      en: 'Complexity unveiled. Creations forged from the vastest number of disparate materials. A testament to maximalist ambition.',
      ja: '複雑性の頂点。最も多くの素材を融合させ、鍛え上げられた創造の結実。そのマキシマリストたる野心に捧ぐ。',
    },
    notes: [],
  },
  lessIsMore: {
    title: {
      en: 'Less is More?',
      ja: '少ないほど豊かか?',
    },
    description: {
      en: 'Focused resonances. Engagement measured against material complexity. Do lean, focused builds resonate more deeply than the maximalist giants?',
      ja: '精緻な響き。素材の複雑さと、人々の心への響き。削ぎ落とされた作品は、豪奢な巨人たちよりも深く胸を打つのだろうか?',
    },
    notes: [
      {
        en: 'Median views and median likes per work (independent axes, each scaled to its own maximum). Correlation, not causation.',
        ja: '作品あたりの views と likes の中央値(独立した2軸。各軸はそれぞれの最大値で正規化)。相関であって因果ではない。',
      },
    ],
  },

  /** The Elemental Chronicles */

  // The Elemental Chronicles — the parent heading over both facets (search box lives here).
  elementalChronicles: {
    title: {
      en: 'The Elemental Chronicles',
      ja: '元素の編年体',
    },
    description: {
      en: 'Every element carries a history — the hands that forged with it, and the nature it revealed. The full catalog lies open here: search any element by name, or dwell on the most storied below.',
      ja: 'すべての元素には歴史がある。それを鍛えた手と、そこに現れた性質。ここに全書が開かれている。名前で任意の元素を探すもよし、下に連なる最も物語られし元素を眺めるもよし。',
    },
  },

  // The Elemental Chronicles — Facet 1: the material's own nature (no individuals).
  elementNature: {
    title: {
      en: 'The Nature of the Element',
      ja: '元素の性質',
    },
    description: {
      en: "Each material read on its own terms — the reagents it bonds with, the domains it serves, and how it spread through the makers' hands.",
      ja: '素材そのものを読み解く。何と結びつき、どんな領域で使われ、どのように作り手たちへ広まっていったのか。',
    },
    notes: [
      {
        en: 'One card per material; shows the most-used materials, ordered by total usage (most first)',
        ja: '1カード＝1素材。使用数の多い素材を、総使用数の多い順に表示',
      },
      {
        en: 'Pairs with — the materials it is most often combined with',
        ja: 'Pairs with(相棒) — 最も一緒に使われる素材',
      },
      {
        en: 'Used for — the genres / domains of its works (from tags)',
        ja: 'Used for(用途) — その作品群のジャンル(タグ由来)',
      },
      {
        en: '“% use it again” — how often a maker reaches for it again in later works',
        ja: '「% use it again」 — 一度使ったメイカーが後の作品でも再び使う割合',
      },
      {
        en: '“used across N days” — from its first use to its last (its lifespan)',
        ja: '「used across N days」 — 初使用から最終使用までの期間(その素材の寿命)',
      },
      {
        en: '“reached N works in …” — days from its debut until it was used in N works',
        ja: '「reached N works in …」 — 登場から N 作品で使われるまでの日数',
      },
    ],
  },

  // The Elemental Chronicles — Facet 2: the people who forged with each material.
  elementForgers: {
    title: {
      en: 'The Forgers of this Element',
      ja: '元素を紡いだ術師たち',
    },
    description: {
      en: 'The history of each element, told through the alchemists who wielded them. Discover the pioneers who first ignited a material, and the grandmasters who forged it to its absolute limits.',
      ja: '素材を操った錬金術師たちを通して語られる、元素の歴史。誰が最初にその素材に火を灯し、誰がその真価を極限まで引き出したのかを記録する。',
    },
    notes: [
      {
        en: 'One card per material; shows the most-used materials, ordered by total usage (most first)',
        ja: '1カード＝1素材。使用数の多い素材を、総使用数の多い順に表示',
      },
      {
        en: 'Top user — the maker with the most works using it',
        ja: 'Top user(第一人者) — その素材を最も多くの作品で使ったメイカー',
      },
      {
        en: 'Pioneer — the first maker ever to use it',
        ja: 'Pioneer(開拓者) — その素材を史上初めて使ったメイカー',
      },
      {
        en: 'Innovator — the first maker to win an award with it',
        ja: 'Innovator(革新の証明者) — その素材で初めて受賞したメイカー',
      },
      {
        en: '“reached N makers in …” — days from its debut until the N-th distinct maker used it',
        ja: '「reached N makers in …」 — 登場から N 人目の作り手が使うまでの日数',
      },
    ],
  },

  // The Circle of Masters
  circleOfMasters: {
    title: {
      en: 'The Circle of Masters',
      ja: '極めし者たちの円環', // または「巨匠たちの円卓」「達人たちの錬成陣」など
    },
    description: {
      en: "The chosen few who sit at the Alchemist's Table. A directory of absolute mastery, categorizing the visionary creators by their distinct styles of forging.",
      ja: '錬金術のテーブルを囲む、選ばれし達人たち。彼らがどのような流派で作品を錬成してきたか、その特異な創造のスタイルを証明する絶対的な名簿。',
    },
    notes: [
      {
        en: 'Fact-based only: every seat ranks makers on a materials fact (breadth, combination, focus, materials pioneered) — never views, likes, or status.',
        ja: '事実ベースのみ。各席は素材に関する事実(幅・組み合わせ・偏愛・初採用した素材数)で席次を決め、閲覧数・いいね・ステータスは用いない。',
      },
      {
        en: 'Only makers with 3 or more works are eligible; some seats add a higher floor. Each seat shows a podium of the top 10 (ties expand it).',
        ja: '3作以上の作者のみ対象(席によってはさらに高い下限あり)。各席は上位10名(同率は拡張)を表彰する。',
      },
      {
        en: 'The Grand Alchemist is anyone holding two or more seats at once.',
        ja: '大錬金術師は、2つ以上の席を同時に得た者。',
      },
    ],
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
  const [result, chroniclesResult, circleResult] = await Promise.all([
    getMaterialAnalysis(),
    getElementalChroniclesAnalysis(),
    getCircleOfMastersAnalysis(),
  ]);

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

  return (
    <>
      <PeriodicTableSection
        elements={toRankedElements(insights.materialCounts)}
        copy={SECTION_DEFINITIONS.periodicTable}
      />

      {chroniclesResult.ok && (
        <ElementChroniclesExplorer
          materials={chroniclesResult.data.materials}
          headerCopy={SECTION_DEFINITIONS.elementalChronicles}
          natureCopy={SECTION_DEFINITIONS.elementNature}
          forgersCopy={SECTION_DEFINITIONS.elementForgers}
        />
      )}

      <MaterialsRankFlowSection
        yearly={insights.yearlyTopMaterials}
        monthly={insights.monthlyTopMaterials}
        copy={SECTION_DEFINITIONS.prometheus}
      />

      <MaterialsYearlyTrendSection
        materials={insights.monumental}
        copy={SECTION_DEFINITIONS.risingCauldron}
        latestYear={insights.latestYear}
        // limit={30}
        // limit={20}
        limit={10}
      />

      <MonumentalSection
        materials={insights.monumental}
        copy={SECTION_DEFINITIONS.monumental}
        limit={100}
        // limit={5}
      />

      <PrimordialSection
        materials={insights.primordial}
        copy={SECTION_DEFINITIONS.primordial}
        limit={50}
        // limit={5}
      />
      <RisingVaporsSection
        materials={insights.risingVapors}
        copy={SECTION_DEFINITIONS.risingVapors}
        latestYear={insights.latestYear}
        limit={50}
        // limit={30}
        // limit={5}
      />
      <LostTechnologySection
        materials={insights.lostTech}
        copy={SECTION_DEFINITIONS.lostTech}
        latestYear={insights.latestYear}
        limit={50}
        // limit={30}
        // limit={5}
      />

      <NewfoundSection
        materials={insights.newfound}
        copy={SECTION_DEFINITIONS.newFound}
        // limit={50}
        // limit={30}
        limit={20}
        // limit={5}
      />

      <LessIsMoreSection
        buckets={insights.countEngagement}
        copy={SECTION_DEFINITIONS.lessIsMore}
      />

      <KitchenSinkSection
        works={insights.kitchenSink}
        copy={SECTION_DEFINITIONS.kitchenSink}
      />

      {circleResult.ok && (
        <CircleOfMastersSection
          insights={circleResult.data}
          copy={SECTION_DEFINITIONS.circleOfMasters}
        />
      )}
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
            <div className="space-y-12 animate-pulse">
              <p className="py-12 text-center text-violet-700 dark:text-violet-300">
                Distilling the elements...
              </p>
            </div>
          }
        >
          <AlchemistsTableDashboard />
        </Suspense>
      </div>
    </div>
  );
}
