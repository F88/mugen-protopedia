/**
 * @fileoverview The Elemental Chronicles sections for The Alchemist's Table.
 *
 * Direction 2 of The Alchemists' Ledger (see
 * docs/observatory/content/the-alchemists-table/the-elemental-chronicles.md).
 * Deliberately split into two sections by whether the analysis involves people:
 *
 * - {@link ElementForgersSection} — Facet 1, the PEOPLE: each material's Pioneer
 *   (first maker) and Top user (heaviest user). Names individuals.
 * - {@link ElementNatureSection} — Facet 2, the MATERIAL itself: what it pairs
 *   with, what it is used for, its repeat rate, and its spread. No individuals.
 *
 * Both iterate the same top-materials list. The interactive Element Inspector
 * (click a periodic-table tile) is deferred.
 */
import type {
  MakerFirst,
  MaterialChronicle,
} from '@/lib/observatory/build-chronicles-insights';
import {
  buildMaterialLink,
  buildPrototypeLink,
  buildTagLink,
  buildUserLink,
  getUserDisplayName,
} from '@/lib/utils/prototype-utils';

import {
  SectionHeading,
  SectionNotes,
  type SectionCopy,
} from './section-heading';


/** The 4-digit year from an ISO/JST date string. */
function yearOf(date: string): string {
  return date.slice(0, 4);
}

/** A labelled row inside a card: a fixed-width label plus its value. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="w-18 shrink-0 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-500 dark:text-violet-400">
        {label}
      </span>
      <span className="text-violet-900/90 dark:text-violet-200/90">{children}</span>
    </div>
  );
}

/**
 * Inline chips linking out to ProtoPedia. `tone` distinguishes what they point
 * to: materials glow amber (gold), tags glow emerald (the alchemy green-brew
 * accent) — so the two link kinds never look the same.
 */
function Chips({
  items,
  tone,
}: {
  items: { text: string; href: string }[];
  tone: 'material' | 'tag';
}) {
  const hover =
    tone === 'material'
      ? 'hover:border-amber-400/80 hover:text-amber-600 hover:[text-shadow:0_0_14px_rgba(251,146,60,0.9)] dark:hover:text-amber-400'
      : 'hover:border-emerald-400/80 hover:text-emerald-600 hover:[text-shadow:0_0_14px_rgba(16,185,129,0.9)] dark:hover:text-emerald-400';
  return (
    <span className="flex flex-wrap gap-1">
      {items.map((item) => (
        <a
          key={item.text}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`relative z-10 inline-block rounded-full border border-violet-300/50 bg-violet-100/70 px-2 py-0.5 text-[10px] leading-tight text-violet-800 transition dark:border-violet-400/20 dark:bg-violet-950/60 dark:text-violet-200 ${hover}`}
        >
          {item.text}
        </a>
      ))}
    </span>
  );
}

/**
 * The card header: the material name (linked) plus headline stats. Each facet
 * opts into its own lens — 💎 works (`showUsage`) on the Nature card, 👤 makers
 * (`showMakers`) on the Forgers card; both may be shown at once.
 */
function CardHeader({
  chronicle: c,
  showUsage = false,
  showMakers = false,
}: {
  chronicle: MaterialChronicle;
  showUsage?: boolean;
  showMakers?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <a
        href={buildMaterialLink(c.material)}
        target="_blank"
        rel="noopener noreferrer"
        title={`${c.material} — open on ProtoPedia`}
        className="text-lg font-semibold text-violet-950 transition after:absolute after:inset-0 group-hover:text-amber-600 group-hover:[text-shadow:0_0_14px_rgba(251,146,60,0.9)] dark:text-violet-100 dark:group-hover:text-amber-400"
      >
        {c.material}
      </a>
      <span className="flex shrink-0 flex-col items-end text-sm leading-tight text-violet-500 dark:text-violet-400">
        {showUsage && <span title="works using it">💎 {c.usageCount}</span>}
        {showMakers && (
          <span title="distinct makers who used it">👤 {c.uniqueMakers}</span>
        )}
      </span>
    </div>
  );
}

/**
 * Card shell. Glows amber on hover like the periodic-table tiles (The Elements);
 * `group` lets inner elements react to the card hover.
 */
const CARD_CLASS =
  'group relative flex flex-col gap-2 rounded-2xl border border-violet-200/70 bg-white/70 p-4 text-sm shadow-sm transition hover:shadow-[0_0_10px_0_rgba(251,191,36,0.85),0_0_28px_2px_rgba(245,158,11,0.55)] dark:border-violet-800/50 dark:bg-violet-950/30';

const GRID_CLASS = 'mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

/* --------------------------- Facet 1 — the people --------------------------- */

/**
 * The maker's name, linked to their ProtoPedia profile
 * (`/prototyper/{profileId}`, the profileId after the last `@` in the user
 * string). Falls back to plain text for the rare user with no profileId, so the
 * link text (the name) always matches where it points (the person).
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

/**
 * A related maker: `<name → profile> — <what/when>, via <work → prototype>`. Two
 * links, each with text matching its target (the person, then their work).
 */
function MakerVia({ maker, what }: { maker: MakerFirst; what: string }) {
  return (
    <>
      <MakerName user={maker.user} />{' '}
      <span className="text-xs text-violet-500 dark:text-violet-400">
        {what} {yearOf(maker.date)}, via{' '}
        <a
          href={buildPrototypeLink(maker.prototypeId)}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 underline decoration-dotted underline-offset-2 hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          {maker.prototypeName}
        </a>
      </span>
    </>
  );
}

/** People per material: its Pioneer (first maker) and Top user (heaviest user). */
function ForgersCard({ chronicle: c }: { chronicle: MaterialChronicle }) {
  const pioneer = c.pioneers[0];
  const grandmaster = c.grandmasters[0];
  const innovator = c.innovators[0];

  return (
    <div className={CARD_CLASS}>
      <CardHeader chronicle={c} showUsage showMakers />

      {/* Top user */}
      {grandmaster != null && (
        <Row label="Top user">
          <MakerName user={grandmaster.name} />{' '}
          <span className="text-xs text-violet-500 dark:text-violet-400">
            {grandmaster.count} works with it
          </span>
        </Row>
      )}
      {/* Pioneer */}
      {pioneer != null && (
        <Row label="Pioneer">
          <MakerVia maker={pioneer} what="first used it" />
        </Row>
      )}
      {/* Innovator */}
      {innovator != null && (
        <Row label="Innovator">
          <MakerVia maker={innovator} what="first award" />
        </Row>
      )}
      {/* Adoption */}
      {c.adoption.length > 0 && (
        <div className="mt-1 border-t border-violet-100 pt-2 text-xs text-violet-700 dark:border-violet-900/60 dark:text-violet-300">
          {c.adoption.map((milestone) => (
            <span key={milestone.n} className="block">
              reached {milestone.n} makers in{' '}
              <span className="font-semibold">{milestone.days} days</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The Forgers of this Element — the people who shaped each material (Pioneer /
 * Top user). Separated from {@link ElementNatureSection} because it names makers.
 */
export function ElementForgersSection({
  chronicles,
  copy,
}: {
  chronicles: MaterialChronicle[];
  copy: SectionCopy;
}) {
  if (chronicles.length === 0) return null;

  return (
    <section className="my-16">
      <SectionHeading id="element-forgers" copy={copy} />
      <div className={GRID_CLASS}>
        {chronicles.map((c) => (
          <ForgersCard key={c.material} chronicle={c} />
        ))}
      </div>
      <SectionNotes notes={copy.notes} />
    </section>
  );
}

/* ------------------------- Facet 2 — the material -------------------------- */

/** The material itself: what it pairs with, is used for, its return rate, spread. */
function NatureCard({ chronicle: c }: { chronicle: MaterialChronicle }) {
  return (
    <div className={CARD_CLASS}>
      <CardHeader chronicle={c} showUsage />
      {c.symbiotes.length > 0 && (
        <Row label="Pairs with">
          <Chips
            tone="material"
            items={c.symbiotes.slice(0, 10).map((s) => ({
              text: s.name,
              href: buildMaterialLink(s.name),
            }))}
          />
        </Row>
      )}
      {c.domains.length > 0 && (
        <Row label="Used for">
          <Chips
            tone="tag"
            items={c.domains.slice(0, 10).map((d) => ({
              text: d.name,
              href: buildTagLink(d.name),
            }))}
          />
        </Row>
      )}
      {(c.addictiveElixir != null ||
        c.lifespan != null ||
        c.supernova.length > 0) && (
        <div className="mt-1 flex flex-wrap gap-2 border-t border-violet-100 pt-2 text-xs dark:border-violet-900/60">
          {/*  */}
          {c.addictiveElixir != null && (
            <span className="text-violet-700 dark:text-violet-300">
              <span className="font-semibold">
                {Math.round(c.addictiveElixir.rate * 100)}%
              </span>{' '}
              of its makers use it again
            </span>
          )}
          {/*  */}
          {c.lifespan != null && (
            <span className="text-violet-700 dark:text-violet-300">
              used across{' '}
              <span className="font-semibold">{c.lifespan.days} days</span> (
              {c.lifespan.firstUsed.slice(0, 10)} -{' '}
              {c.lifespan.lastUsed.slice(0, 10)})
            </span>
          )}

          {/*  */}
          {c.supernova.length > 0 && (
            <span className="text-violet-700 dark:text-violet-300">
              {c.supernova.map((milestone) => (
                <span key={milestone.n} className="block">
                  reached {milestone.n} works in{' '}
                  <span className="font-semibold">{milestone.days} days</span>
                </span>
              ))}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * The Nature of the Element — each material read on its own terms (Pairs with /
 * Used for / repeat rate / spread). No individuals named.
 */
export function ElementNatureSection({
  chronicles,
  copy,
}: {
  chronicles: MaterialChronicle[];
  copy: SectionCopy;
}) {
  if (chronicles.length === 0) return null;

  return (
    <section className="my-16">
      <SectionHeading id="element-nature" copy={copy} />
      <div className={GRID_CLASS}>
        {chronicles.map((c) => (
          <NatureCard key={c.material} chronicle={c} />
        ))}
      </div>
      <SectionNotes notes={copy.notes} />
    </section>
  );
}
