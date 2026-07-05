---
lang: en
title: "The Circle of Masters - Content Spec"
status: draft
related:
    - docs/observatory/content/the-alchemists-table/the-alchemists-table.md
    - docs/observatory/analysis-ideas.md
    - docs/observatory/observatory-architecture.md
---

# The Circle of Masters (巨匠たちの円環) — Concept Notes (Draft)

**Direction 1 of The Alchemists' Ledger** on
[The Alchemist's Table](./the-alchemists-table.md). Where the page's other
sections read the _materials_, the Circle of Masters turns the lens on the
**makers** — a round table / hall of fame that seats notable alchemists (users)
and honours each with a fact-based title. The alchemy-circle motif: masters
seated as equals around the Transmutation Circle.

> Status: **draft / ideation**. Metrics, thresholds, and data plumbing are
> sketched, not fixed. Remember the Observatory design-freedom rule — this section
> should feel like part of The Alchemist's Table, not a generic leaderboard.

## Place in the page

The Ledger is **materials × `users`** and has two complementary wheels:

- **The Circle of Masters (this doc)** — _user-centric_. Survey ALL makers and
  rank them by a standout trait. Enter from a **maker**.
- **The Elemental Chronicles** (in the parent doc) — _material-centric_. For each
  top material, name its key people (Pioneer / Grandmaster / Innovator). Enter
  from a **material**.

Together they let a reader cross between "great makers → the reagents they love"
and "a beloved reagent → its great forebears."

**North-star.** Favour the human drama over a bare dashboard. The strongest of
these are **fact-based honours a maker can find their own name in** — "you are the
Veteran of ProtoPedia", proven by the data — which is what makes the observatory
worth revisiting.

## Axes of extraction (観測の観点)

**This is the crux of the whole section: _on what axis do we pull a maker out of
the crowd?_** Get the axes right and the seats follow. Four principles shape the
choice.

### 1. Eligibility — who even counts as an Alchemist

Two hard gates before any axis is applied:

- **Minimum body of work.** A maker must have posted at least `MIN_WORKS`
  prototypes to take any seat — below that they are not yet an Alchemist. Default
  **3** (a _parameter_ to finalise, not a fixed value). Measured: of ~4,038 makers,
  the median has just **1** work and only **~608 have 3+** — so this gate is what
  turns a crowd of 4,038 into a Circle of ~600 real candidates.
- **Materials-grounded.** Materials are this page's spine, so **every axis must
  engage the materials data.** Ranking a maker on _pure work count, ignoring
  materials, is explicitly out_ — sheer volume (the proposed "Arch-Maker") stays a
  **supporting stat**, never a headline seat. (If a volume seat is ever wanted, use
  a materials-grounded form such as total reagents forged — Σ materials across
  works — not a raw prototype count.)

### 2. Two tiers — Mastery vs Moment

Within the eligible pool, axes split by how much record they demand:

- **Mastery axes** — need a real _body of work_ above the base gate (an extra
  floor, e.g. >=6 or >=8 works). Breadth, depth, recognition, persistence. These
  honour the veterans.
- **Moment axes** — clear only the base gate, no extra floor. Being among the first
  to wield a material, or a striking recent debut. These reach the eligible makers
  who lack a deep record but did something notable — keeping the hall from being a
  veterans-only club.

### 3. Four families of trait

Keep the axes _orthogonal_ so each seats a different kind of maker (a measured
check confirms it: across the four original titles' top-5s only 1 maker was shared
— 19 distinct people in 20 seats). The families:

| Family | 観点 | Seats |
| --- | --- | --- |
| **Range** | 幅と深さ | Polymath (breadth) ↔ Purist (devotion) |
| **Output & Craft** | 栄誉 | Trophy Hunter (awards) |
| **Time** | 時間 | Veteran (origin) · Perennial (persistence) · Rising (momentum) |
| **Influence** | 影響 | Vanguard (materials pioneered) |

Pure output (量) is intentionally absent as a seat — see Principle 1; it survives
only as a supporting column.

### 4. Volume gets a rate twin

Within a family, pair a **volume** reading with a **rate / ratio** reading, so the
prolific veteran and the focused newcomer each get a seat rather than competing on
the same board. Prefer **fact-and-behaviour** signals throughout — view and like
counts are treated as arbitrary / low-trust for this page.

## The seats (titles)

All are provable from public fields (`users`, `materials`, `createDate`,
`awards`). Measured examples are from the ~6.3k sample and are illustrative, not
final. Grouped by family; each seat is tagged **[Mastery]** or **[Moment]**.

### Range — breadth vs depth (幅と深さ)

#### The Polymath (万象の探求者) — breadth **[Mastery]**

The fearless generalist. A twin seat:

- **The Grand Polymath:** most distinct materials outright — veteran breadth (one
  maker at 110 distinct across 202 works). The jaw-dropping number.
- **The Rising Polymath:** highest distinct-per-work _ratio_ (floor >=6 works) —
  restless early variety (`gesho_a01` at 34 / 7 = 4.9x). Surfaces smaller, newer
  makers the raw count would bury.

#### The Purist (孤高の偏愛者) — devotion **[Mastery]**

The specialist opposite of the Polymath: the maker most wedded to a single
element — very few distinct materials, or high single-material containment, across
their own works ("I only ever use M5Stack"). Show the reagent they are married to.

- _Measured — two guards are essential:_
    - A **floor (>=8 works)** on top of the base gate — the naive rate is a
      4/4 = 100% trap.
    - **Require materials to be present.** A raw "fewest distinct types" ranking is
      broken by makers who simply leave the materials field empty: the measured top
      was makers with **0 materials across 20-36 works** (`Atelier of Aether
      Fantasia` 36, `labubu188` 24). Measure devotion as single-material
      _containment among works that list materials_, not bare distinct-count.
- With both guards, real specialists surface — `教材自作部@kyouzai` 30/30 on one
  switch; makers 11/11 on Unity or M5Stack. This is the specialisation reading and
  the antidote to Grandmaster's prolific-bias.

### Output & Craft — recognition (栄誉)

#### The Trophy Hunter (栄光の蒐集家) — glory **[Mastery]**

A twin seat:

- **The Collector:** most `awards` in total (`higedaruma` / `TakSan` at 21) — the
  veteran trophy shelf.
- **The Sharpshooter:** highest award-_rate_ (floor >=6 works; `shikky_lab`
  5 / 6 = 83%) — deadly accuracy over volume.
- _Caveat:_ small-N, and awards are only ~12% of works — keep the floor.

### Time — when and how long (時間)

#### The Veteran (古参の術師) — origin **[Moment]**

The earliest debut by `createDate` — who has been forging the longest. Clears the
base gate; no extra mastery floor.

- _Measured:_ real OGs surface (`湯村翼` 2014-03-20, and a cluster of other 2014
  pioneers). A pure honour of tenure, distinct from every seat above.

#### The Perennial (不撓の術師) — persistence **[Mastery]**

Active across the most distinct years — not when they started, but that they
never stopped.

- _Measured:_ `higedaruma` and `ひで` at **13 years** each. "Still forging after 13
  years" is a story raw work-count cannot tell.

#### The Rising (新星の術師) — momentum **[Moment]** _(new)_

A maker who **debuted recently yet already stands out** — the newcomer to watch.
Fills the biggest gap in the Circle: without it, no recent maker can ever be
seated.

- _Measured:_ `labubu188` debuted 2025-06 and already has 24 works; a fresh cohort
  (`F10`, `わかと`, ...) sits just behind. None appear on any other board — a
  wholly distinct set of faces.
- _Definition to settle:_ "recent" = debut within the last 1-2 years, ranked by
  output (or breadth) since debut. Uses only the base gate — no mastery floor.

### Influence — who moved the field (影響)

#### The Vanguard (黎明の先導者) — pioneering **[Moment]** _(new)_

The user-level aggregate of the Chronicles' Pioneer: **how many materials was this
maker the first ever to wield?** The advance party who keep dragging new elements
into the ProtoPedia universe — "there is a new device or API, let me try it on
ProtoPedia first."

- _Measured:_ `youtoy` 61 materials pioneered, `ひで` 30, `加川 澄廣` 21,
  `airpocket` 20. Correlates a little with breadth (the very prolific pioneer a
  lot) but surfaces distinct names too.
- A **Moment** axis at heart — one first-of-its-kind work already counts — so it
  reaches makers a mastery floor would miss (still subject to the base gate).
- _Shared computation with Direction 2:_ the Vanguard IS the Chronicles' Pioneer
  seen from the other side. Build the per-material "first work + owning maker" map
  once (Direction 2's Pioneer); **group that map by maker and count** and you have
  the Vanguard — no separate data source. This is the tightest link between the two
  directions, so the two should be computed together.

### The meta-honour

#### The Grand Alchemist (大錬金術師)

Anyone who holds **two or more** seats at once. Measured overlap is rare, so this
is the Circle's highest, scarcest accolade (e.g. `higedaruma` is a Polymath, a
Trophy Hunter, and a Vanguard at once).

## Parameters to finalise

These are knobs, not fixed values — tune them once the seat list is locked:

- `MIN_WORKS` — the base eligibility gate. **Default 3** (fewer works is "not yet
  an Alchemist"). Everything downstream inherits this.
- Per-title mastery floors (e.g. Purist >=8, rate twins >=6) — layered _on top of_
  `MIN_WORKS`.
- The Rising window (last 1-2 years).

## Presentation

- Each seat is a small **podium (top-3)**, not a razor-thin single #1 (per-metric
  leads can be slim).
- Apply `MIN_WORKS` everywhere; add the per-title floor on rate / ratio seats.
- Tie into the Element Inspector: a maker's seat can link to the reagents they are
  known for, closing the loop with the Elemental Chronicles.

## Guardrail

Aggregate and celebratory, **public works only** — never individual profiling. Any
"Collaborator / most co-makers" seat that counts or names _who_ a maker works with
stays **out** — that edges into the Social Graph idea `analysis-ideas.md` rejected
on privacy grounds. (The per-user aggregate may still store a plain solo/team work
count for future use, but no seat surfaces it today.)

## Data & feasibility

- **Coverage (sample, among all prototypes):** `users` ~100%, `createDate` 100%,
  `awards` ~12%. Everything the Circle needs is present; only the award-based twin
  is inherently small-N.
- **The gate defines the pool:** ~4,038 distinct makers, **median 1 work**; the
  default `MIN_WORKS = 3` gate leaves **~608 eligible** candidates, and only ~249
  clear a 6+ mastery floor. This is why Moment-tier seats (Veteran / Rising /
  Vanguard) matter — they seat eligible makers who lack a deep record.
- **New work — build a reusable per-user aggregate.** The shipped source
  (`build-material-insights.ts`) aggregates **per material**, not per user. Rather
  than compute just what these seats need, build a **general, extensible per-user
  analysis structure** now (a record keyed by maker) and have the Circle consume
  it. This article is materials-centric, but a per-user aggregate is the
  foundation for **future user-centric Observatory pages** — invest in it once and
  grow it over time.
    - _Per-user fields (a starting set; extend as future analyses need):_ work
      count; distinct materials and per-material counts; **tag counts**; award
      count and award-work count; first / latest `createDate`; **works-per-year**
      (and the derived distinct active years); solo vs team work counts. The
      Vanguard's "materials pioneered" is _not_ stored here — it needs the global
      first-work-per-material map, so it is derived from the shared Chronicles
      computation, not from a maker's own works.
    - _Placement:_ a new Observatory-side builder (e.g. `build-user-insights.ts`),
      kept separate from the base analysis exactly like the material source, so it
      never bloats the top-page pipeline.
    - _Note:_ the Circle uses only a subset today; unused fields are cheap to carry
      and make the structure immediately reusable.

## Open questions

- **Tier balance:** how many Mastery vs Moment seats should ship together, so the
  hall never reads as a pure veterans' club?
- **The Rising axis:** what "recent" window (last 1 vs 2 years) and what rank
  metric (output vs breadth since debut) best surface a genuine newcomer?
- **Vanguard vs Polymath:** they correlate for the very prolific — keep both, or
  fold Vanguard into the Chronicles only?
- **`MIN_WORKS` value:** is 3 the right "you are now an Alchemist" bar, or higher?
- **A materials-grounded volume seat?** Pure count is out, but should "most reagents
  forged" (Σ materials) earn a 量 seat, or stay a supporting stat?
- Exact floors (>=6 vs >=8 works) per Mastery title, and whether they should scale
  with the corpus rather than be fixed.
- For each twin, ship **both** seats or pick the more interesting one?
- How many seats to ship first — the whole Circle at once, or a strong subset?
- Title naming polish (English + Japanese) once the seat list is locked.
