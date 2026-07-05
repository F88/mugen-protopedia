---
lang: en
title: "The Elemental Chronicles - Content Spec"
status: draft
related:
    - docs/observatory/content/the-alchemists-table/the-alchemists-table.md
    - docs/observatory/content/the-alchemists-table/the-circle-of-masters.md
    - docs/observatory/analysis-ideas.md
    - docs/observatory/observatory-architecture.md
---

# The Elemental Chronicles (元素が刻んだ人の歴史) — Concept Notes (Draft)

**Direction 2 of The Alchemists' Ledger** on
[The Alchemist's Table](./the-alchemists-table.md). Where
[The Circle of Masters](./the-circle-of-masters.md) surveys the makers, the
Elemental Chronicles start from the **material**: extract a reagent and read its
deep-dive detail. Two facets, both shown in the Element Inspector:

1. **The key people** who shaped its story — its Pioneer, Grandmasters, Innovators.
2. **The material's own portrait** — a _different vector from honouring people_:
   what it bonds with, what it is for, and where it is wielded.

It pairs with the shipped Rising Cauldron / Fire of Prometheus (which show a
reagent's rise over time).

> Status: **draft / ideation**. Metrics, thresholds, and data plumbing are
> sketched, not fixed. Remember the Observatory design-freedom rule.

## Place in the page

The Ledger is **materials × `users`** and has two complementary wheels:

- **The Elemental Chronicles (this doc)** — _material-centric_. Enter from a
  **material** and meet its forebears.
- **The Circle of Masters** (separate doc) — _user-centric_. Enter from a
  **maker** and see their standout trait.

Together they let a reader cross between "a beloved reagent → its great forebears"
and "great makers → the reagents they love."

## Selection — which reagents get a Chronicle

Not every material earns one; a Chronicle is only meaningful for reagents with
enough history to tell a story.

- **Material eligibility.** Only materials at or above a usage floor — or the top
  `TOP_N` by all-time use — get a Chronicle (a parameter to finalise). The long
  tail of one-off materials is excluded: their Pioneer would be their sole user
  (see the Pioneer caveat).
- **Fact-based only.** Like the Circle, the Chronicles use facts — `createDate`,
  `users`, `awards` — never engagement (views / likes) or `status`.

## Facet 1 — the key people (per eligible material)

All are provable from public fields (`materials`, `users`, `createDate`,
`awards`). Measured examples are from the ~6.3k sample and are illustrative.

**Each title shows the top 5 makers, not just the winner.** A lone #1 is dull —
show the **top 5** by the title's metric, and expand past 5 when there is a tie at
the boundary (`同順位は5人以上`). The cohort tells the story better than a single
name.

### The Pioneer (黎明の開拓者) — first to light the fire

The **first makers to wield the reagent**, ranked by their work's `createDate` —
the true Pioneer at the top, then the early followers who caught the spark. Show
the earliest 5 (ties expand the list).

- Materials-analog of Hello World's tag-based Early Adopters, and a natural bridge
  to it. Showing the first 5 naturally answers "and who followed" without a
  separate metric.
- _Measured examples (the #1):_ `Arduino` → 坪倉 輝明 @2014; `M5Stack` → aNo研 @2018.
- _Caveat:_ ~36% of materials were used exactly once ever, so a one-off reagent has
  no cohort to show — the eligibility gate (usage floor) filters these out.
- _Feasibility — a small new map:_ the shipped `firstDateByMaterial`
  (`build-material-insights.ts`) is close but not reusable as-is — it keys on
  `releaseDate` and carries no owner. The Chronicles need a per-material **first
  work by `createDate`, plus its owning maker(s)** — the same `createDate` basis
  the per-user aggregate (`build-user-insights.ts`) uses, so the two agree.
- _Powers the Circle's Vanguard:_ once that "first work + owning maker" map exists,
  **grouping it by maker and counting** yields
  [The Circle of Masters'](./the-circle-of-masters.md) Vanguard (materials
  pioneered per maker). Compute the map once and both directions are fed — so the
  Pioneer and the Vanguard should be built together.

### The Grandmaster (極めし巨匠) — the absolute wielders

The **top 5 makers who have forged the most works** with the reagent (ties expand
the list) — "this material? that's their name." The heat and know-how of devoted
specialists.

- _Measured example (the #1):_ `M5Stack` → `ikeuchi@ryotaikeuchi` (32 works with
  it).
- _Measured caveats:_
    - The per-material lead is thin (the top wielder holds only ~2-4% of a popular
      reagent's uses), so a top-5 list reads better than crowning a razor-thin #1.
    - A few hyper-prolific makers top _many_ reagents (one is Grandmaster of ~29),
      which would flood the boards with the same names. The Circle's Purist /
      specialisation reading (uses of X relative to the maker's own output) is the
      fairer cut when this becomes a problem.

### The Innovator (革新の証明者) — proof it is a real weapon

The makers of the **first award-winning works** using the reagent (the earliest 5
by date, ties expand the list) — proof the element is not a toy but something the
judges reward.

- _Measured — viable for top materials:_ each top reagent has 15-83 award works
  with a datable first (`M5Stack` → 若狹 正生 @2020; `ChatGPT API` → ししかわ
  @2021). Only creative-coding `p5.js` had none — so this is a **top-material title
  by nature**; the long tail has no award work (fewer than 5, or none, is fine).
- Distinct from The Royal Armory, which ranks the _materials_ by award-rate with
  no maker — here the spotlight is the person.

## Facet 2 — the material's portrait (元素の肖像)

A different vector from honouring people: axes that characterise the reagent
_itself_, on the same Element Inspector tile. Some concretise an idea from the
parent doc's "Reagent in Context" group (noted per axis); others are new to this
page.

### The Symbiote (共生の相棒) — what it bonds with [materials × materials]

The reagents most often forged _together_ with this one — the golden alloys. Show
the top 5 co-used materials.

- _Measured:_ `M5Stack` → Arduino (125), Arduino IDE (93); `LINE Messaging API` →
  obniz (52), kintone (47), ChatGPT API (42); `Unity` → PLATEAU (35).
- _Why it matters:_ the most **practical** axis — after the bump chart shows a
  reagent is hot, this answers "so what do I combine it with?" A direct technical
  reference.
- _Concretises:_ the parent's Combinations group (The Alchemist / Iron Combos).
- _Feasibility:_ needs the material×material **co-occurrence** count — the one
  genuinely heavier building block (a symmetric matrix), though only each
  material's top-K partners are shown.

### The Domain (支配領域) — what it is for [materials × tags]

The tags most associated with the reagent — its "attribute of magic". Show the top
5 domain tags.

- _Measured (after filtering):_ `Arduino` → IoT / 電子工作 / LED; `Unity` → AR / VR
  / ゲーム; `Raspberry Pi` → IoT. Reveals whether a reagent rules entertainment
  (games / toys) or problem-solving (civic-tech / IoT).
- _Caveat — needs the same noise filter as Element's Purpose:_ raw top tags are
  dominated by the material's own name echoed back (`M5Stack` → "M5Stack"), event
  tags (`M5Stack_contest_2021`), and case-variants (`unity` / `arduino`). Strip
  self-name, material-echoes, and event-pattern tags first (an allow-list of genre
  tags is the cheap path).
- _Concretises:_ the parent's The Element's Purpose (materials × tags).

### The Addictive Elixir (魅惑の霊薬) — does it hook the maker [materials × repeat use]

Stickiness / developer experience: once a maker uses the reagent, how often do
their _later_ works keep reaching for it? High = "once you touch this, you cannot
build without it."

- _Definition:_ among makers who used the reagent and made at least one work
  afterwards, the average share of their later works that reuse it.
- _Measured (>=10 qualifying makers):_ `Unity` 42% (187 makers), `Docker` 43%,
  `M5Stack` 32% (197) — genuinely sticky tools with large followings. The opposite
  end sits near 0% (`Spotify`, `Stable Diffusion`, `Golang`) — one-off trials makers
  do not return to.
- _Caveat — small-N at the very top:_ a reagent with just 10 qualifying makers can
  post 63% (`Gemini API`) on thin evidence; raise the maker floor (or weight by
  count) so broad, proven stickies (Unity / M5Stack) lead.
- _New to this page_ (not in the parent's Reagent in Context group).
- _Feasibility:_ needs each maker's works in `createDate` order (the per-user
  aggregate already gathers the ingredients) plus a per-material retention tally.

### The Supernova (超新星) — how explosively it spread [createDate × cumulative use]

Propagation speed: the **days from a reagent's first use (its Pioneer's work) to
its `SUPERNOVA_N`-th use**. The shortest wins — the reagent everyone piled onto the
moment it appeared. The instant history moved (e.g. a disruptive API's arrival).

- _Measured (N=50; 52 reagents qualify):_ `toio Do` 84 days, `toio` 230, `Arduino
  IDE` 347, `ChatGPT API` 716 — versus slow burns that took 2,500-2,900 days
  (`IFTTT`, `TensorFlow`).
- More a **leaderboard** (the fastest supernovae) than a per-tile badge; a temporal
  axis that pairs with the shipped Rising Cauldron / Fire of Prometheus.
- _Caveat — contest bursts:_ a kit pushed hard at a single hackathon can hit N
  fast, so the Supernova rewards genuine viral tech AND contest-boosted reagents.
  Read it beside how event-tied the reagent's works are.
- _Caveat — only reagents that reached N qualify:_ a material mid-explosion (not
  yet at N) is not eligible; `SUPERNOVA_N` trades coverage for a higher bar
  (measured: 50 → 52 reagents, 30 → 80).
- _Feasibility:_ cheap — per-material sorted `createDate`s, then the gap to the
  N-th; reuses the material date data already gathered.

## UI hook — the Element Inspector

In the Periodic Table, "extracting" a single tile opens the Element Inspector,
which shows both facets together:

- **The Forgers of this Element (この元素を紡いだ術師たち)** — Facet 1, the people
  (Pioneer / Grandmasters / Innovators). Makers scan for their own name; "you are
  the Pioneer of this element", proven by data, is the ultimate tribute.
- **The reagent's portrait** — Facet 2 (Symbiote / Domain / Addictive Elixir, and
  its Supernova propagation speed).

This is where the two directions meet: from a maker's seat in the Circle you reach
their reagents, and from a reagent's tile you reach its forgers and its portrait.

## Guardrail

Aggregate and celebratory, **public works only** — never individual profiling
(heeds the Social Graph idea `analysis-ideas.md` rejected on privacy grounds).

## Parameters to finalise

Knobs, not fixed values:

- **List size** — top `LIST_SIZE` makers per title, ties-inclusive. **Default 5**
  (expands past 5 on a boundary tie).
- **Material eligibility** — a usage floor, or the top `TOP_N` reagents by all-time
  use.
- **Grandmaster** — raw count vs the specialisation cut (show one, or both).
- **Innovator** — how to present reagents with fewer than `LIST_SIZE` (or zero)
  award-winning works (show what exists, or a "no champion yet" note).
- **Domain** — the tag noise filter: the genre allow-list, or the strip-rules for
  self-name / material-echo / event-pattern tags.
- **Supernova** — the `SUPERNOVA_N` target (uses-to-reach); default 50, or 30 for
  wider coverage.
- **Addictive Elixir** — the qualifying-maker floor (>=10, or higher to tame
  small-N at the top).

## Data & feasibility

- **Coverage (sample, among all prototypes):** `users` ~100%, `createDate` 100%,
  `awards` ~12%. Pioneer and Grandmaster are strong for any eligible material; the
  Innovator is inherently limited to reagents that have an award-winning work.
- **New work — material-side, distinct from the per-user aggregate.** The per-user
  aggregate (`build-user-insights.ts`) already exists but deliberately holds no
  material-owner facts. The Chronicles need three **material-keyed** additions:
    1. per-material **first work by `createDate` + owning maker** (shared with the
       Circle's Vanguard);
    2. a per-**(material, user)** usage tally for the Grandmaster;
    3. the per-material **first award-winning work** for the Innovator.
  Fold these into the material insights builder (or a sibling), kept separate from
  the base analysis like the existing material source.
- **Portrait (Facet 2) — extra material-keyed data:** the **Symbiote** needs the
  material×material **co-occurrence** count (the one heavier building block — a
  symmetric matrix; only top-K partners are surfaced); the **Domain** needs
  per-material **tag counts** plus the noise filter; the **Supernova** needs each
  material's **sorted `createDate`s** to time the gap to the N-th use (cheap); the
  **Addictive Elixir** needs each maker's works in date order + a per-material
  retention tally. All are material-keyed and fit the same Observatory-side builder.

## Open questions

- Should a reagent with fewer than `LIST_SIZE` all-time users still get a Chronicle
  (a short list), or be excluded entirely by the eligibility gate?
