/**
 * @fileoverview The Circle of Masters section for The Alchemist's Table.
 *
 * Direction 1 of The Alchemists' Ledger (see
 * docs/observatory/content/the-alchemists-table/the-circle-of-masters.md). Where
 * the Chronicles read the MATERIALS, the Circle turns the lens on the MAKERS: a
 * round table that seats notable alchemists and honours each with a fact-based
 * title.
 *
 * Pure presentation over {@link CircleInsights} (the ranking is done in the
 * builder). Seats are grouped into the doc's three trait families (Range / Time /
 * Influence); each seat is a small podium (top-3). The meta-honour — the Grand
 * Alchemist, who holds two or more seats — is called out in its own banner.
 */
import type {
  CircleInsights,
  SeatCriteria,
  SeatEntry,
} from '@/lib/observatory/build-circle-insights';
import {
  buildMaterialLink,
  buildUserLink,
  getUserDisplayName,
} from '@/lib/utils/prototype-utils';

import {
  SectionHeading,
  SectionNotes,
  type LocalizedText,
  type SectionCopy,
} from './section-heading';

/** A seat's copy and where its podium entries live in {@link CircleInsights}. */
interface SeatDef {
  key: keyof Pick<
    CircleInsights,
    'polymath' | 'weaver' | 'purist' | 'vanguard'
  >;
  /** Seat name in both languages (en shown as the title, ja as the subtitle). */
  title: LocalizedText;
  /** One-line description of the axis, in both languages (en over ja). */
  blurb: LocalizedText;
}

/**
 * The seats, in display order. Only materials-grounded seats belong here (the
 * page's spine is materials): each ranks makers on a materials fact. Trophy
 * Hunter (awards) and the former Time seats (Veteran / Perennial / Rising) are
 * intentionally absent — the builder does not compute them.
 */
const SEATS: SeatDef[] = [
  {
    key: 'polymath',
    title: { en: 'The Polymath', ja: '万象の探求者' },
    blurb: {
      en: 'The master of variety, having forged with the widest array of unique elements.',
      ja: 'あらゆる素材をるつぼに放り込み、技術の掛け合わせを楽しむ究極のジェネラリスト。',
    },
  },
  {
    key: 'weaver',
    title: { en: 'The Weaver', ja: '交雑の紡ぎ手' },
    blurb: {
      en: 'The complex architect who combines the most elements into a single masterpiece.',
      ja: '複数の素材を複雑に絡み合わせ、単体では不可能な化学反応を引き起こす錬成の達人。',
    },
  },
  {
    key: 'purist',
    title: { en: 'The Purist', ja: '孤高の偏愛者' },
    blurb: {
      en: 'The specialist who draws absolute power from a single, deeply loved element.',
      ja: '特定の素材に狂気的な愛を注ぎ、その限界と真価を極限まで引き出した専門職人。',
    },
  },
  {
    key: 'vanguard',
    title: { en: 'The Vanguard', ja: '黎明の先導者' },
    blurb: {
      en: 'The first to touch the unknown, holding the most pioneer records across all elements.',
      ja: '未知の素材に誰よりも早く火を灯し、ProtoPediaの歴史を切り拓いてきた先駆者。',
    },
  },
];

/**
 * A maker's name, linked to their ProtoPedia profile (the profileId after the
 * last `@` in the user string). Falls back to plain text for the rare user with
 * no profileId. Makers glow emerald on hover — the same "people" accent the
 * Chronicles use, so a person never looks like a material.
 */
function MakerName({ user }: { user: string }) {
  const href = buildUserLink(user);
  const name = getUserDisplayName(user);
  if (href == null) return <span className="font-medium">{name}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-10 font-medium hover:text-emerald-600 dark:hover:text-emerald-400"
    >
      {name}
    </a>
  );
}

/** Rank badge tones for the top-3 podium (gold / silver / bronze), then muted. */
const RANK_TONES = [
  'bg-amber-300/90 text-amber-950 dark:bg-amber-400/90',
  'bg-slate-300/90 text-slate-800 dark:bg-slate-300/80',
  'bg-orange-300/90 text-orange-950 dark:bg-orange-400/80',
];

/**
 * One podium row: rank badge, the seated maker, and the metric detail. `rank` is
 * a 1-based competition rank (makers tied on the metric share it), so a podium
 * expanded by ties at the boundary shows 10, 10, 10 — not 10, 11, 12.
 */
function PodiumRow({ entry, rank }: { entry: SeatEntry; rank: number }) {
  const tone = RANK_TONES[rank - 1] ?? 'bg-violet-200/80 text-violet-800';
  return (
    <li className="flex items-center gap-2">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${tone}`}
      >
        {rank}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block">
          <MakerName user={entry.user} />
        </span>
        {entry.crowns != null && entry.crowns.length > 0 ? (
          <span className="mt-0.5 flex flex-wrap gap-1">
            {entry.crowns.map((crown) => (
              <a
                key={crown.material}
                href={buildMaterialLink(crown.material)}
                target="_blank"
                rel="noopener noreferrer"
                title={`champion of ${crown.material} — used in ${crown.count} works (${Math.round(crown.rate * 100)}%), score ${crown.score.toFixed(1)} — open on ProtoPedia`}
                className="relative z-10 rounded-full border border-amber-300/60 bg-amber-100/70 px-1.5 py-0.5 text-[10px] leading-tight text-amber-800 transition hover:border-amber-400/80 hover:text-amber-600 hover:[text-shadow:0_0_14px_rgba(251,146,60,0.9)] dark:border-amber-400/20 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:text-amber-300"
              >
                {crown.material}
                <span className="ml-1 opacity-70">
                  ×{crown.count} · {Math.round(crown.rate * 100)}% · score{' '}
                  {crown.score.toFixed(1)}
                </span>
              </a>
            ))}
          </span>
        ) : (
          <span className="block text-xs text-violet-500 dark:text-violet-400">
            {entry.detail}
          </span>
        )}
      </span>
    </li>
  );
}

/**
 * Card shell. Glows amber on hover like the periodic-table tiles and Chronicles
 * cards, keeping the whole page's material-gold accent consistent.
 */
const SEAT_CARD_CLASS =
  'group relative flex flex-col gap-2 rounded-2xl border border-violet-200/70 bg-white/70 p-4 text-sm shadow-sm transition hover:shadow-[0_0_10px_0_rgba(251,191,36,0.85),0_0_28px_2px_rgba(245,158,11,0.55)] dark:border-violet-800/50 dark:bg-violet-950/30';

/** One seat: its title, the axis blurb, the podium of makers, and its gate. */
function SeatCard({
  seat,
  entries,
  criteria,
}: {
  seat: SeatDef;
  entries: SeatEntry[];
  criteria: SeatCriteria;
}) {
  return (
    <div className={SEAT_CARD_CLASS}>
      <div>
        <h4 className="text-base font-semibold text-violet-950 dark:text-violet-100">
          {seat.title.en}
          <span className="ml-2 text-sm font-normal text-violet-700/70 dark:text-violet-300/60">
            {seat.title.ja}
          </span>
        </h4>
        <p className="mt-0.5 text-xs text-violet-950 dark:text-violet-100">
          {seat.blurb.en}
        </p>
        <p className="text-xs text-violet-600/80 dark:text-violet-300/70">
          {seat.blurb.ja}
        </p>
      </div>
      <ol className="mt-1 space-y-1.5">
        {entries.map((entry) => (
          <PodiumRow key={entry.user} entry={entry} rank={entry.rank} />
        ))}
      </ol>
      <p className="mt-auto border-t border-violet-100 pt-2 text-[11px] text-violet-500 dark:border-violet-900/60 dark:text-violet-400">
        Eligibility: {criteria.minWorks}+ works
      </p>
    </div>
  );
}

/**
 * The Grand Alchemist banner: makers who hold two or more seats at once — the
 * Circle's rarest accolade. Their titles are shown as a plain, comma-separated
 * list so the reader sees exactly which honours stacked.
 */
function GrandAlchemistBanner({
  masters,
}: {
  masters: CircleInsights['grandAlchemists'];
}) {
  if (masters.length === 0) return null;
  return (
    <div className="mt-8 rounded-2xl border border-amber-300/60 bg-amber-50/70 p-5 dark:border-amber-400/30 dark:bg-amber-950/20">
      <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
        The Grand Alchemist
        <span className="ml-2 text-sm font-normal text-amber-700/70 dark:text-amber-300/60">
          大錬金術師
        </span>
      </h3>
      <p className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-300/60">
        Masters who hold two or more seats at once — the Circle&apos;s scarcest
        honour.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {masters.map((master) => (
          <li key={master.user} className="flex flex-wrap items-baseline gap-2">
            <MakerName user={master.user} />
            <span className="flex flex-wrap gap-1">
              {master.titles.map((title) => (
                <span
                  key={title}
                  className="rounded-full border border-amber-300/60 bg-amber-100/70 px-2 py-0.5 text-[11px] leading-tight text-amber-800 dark:border-amber-400/20 dark:bg-amber-900/30 dark:text-amber-200"
                >
                  {title}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The Circle of Masters — the makers behind the materials, seated by fact-based
 * title. Renders nothing if no maker clears the eligibility gate (an empty
 * Circle would be a bare heading).
 */
export function CircleOfMastersSection({
  insights,
  copy,
}: {
  insights: CircleInsights;
  copy: SectionCopy;
}) {
  const seats = SEATS.filter((seat) => insights[seat.key].length > 0);
  if (seats.length === 0) return null;

  return (
    <section className="my-16">
      <SectionHeading id="circle-of-masters" copy={copy} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {seats.map((seat) => (
          <SeatCard
            key={seat.key}
            seat={seat}
            entries={insights[seat.key]}
            criteria={insights.criteria[seat.key]}
          />
        ))}
      </div>

      <GrandAlchemistBanner masters={insights.grandAlchemists} />

      <SectionNotes notes={copy.notes} />
    </section>
  );
}
