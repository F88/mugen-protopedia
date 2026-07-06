---
lang: en
title: "The Alchemist's Table - Content Spec"
status: draft
related:
    - docs/observatory/analysis-ideas.md
    - docs/observatory/observatory-architecture.md
    - docs/observatory/ogp-guidelines.md
---

# The Alchemist's Table — Concept Notes (Draft)

Idea notes for a new Observatory feature page themed around **materials**
(構成要素) — the elements makers build with. The ambition is to evolve
Observatory from a "record" into an intellectual **playground**: reframing
prototypes through their materials, so a maker can see how their work functions as
part of the larger web of combinations, and feel invited to experiment.

> Status: **draft / ideation**. This document is for brushing up the ideas.
> Implementation-level detail (metrics, thresholds, data plumbing) is deliberately
> left out for now — see "Feasibility at a glance" for only a rough sense of
> effort. Remember the Observatory design-freedom rule: this page should have its
> own identity, not mimic other pages.

## Page identity

- **Working title:** The Alchemist's Table
    - "Table" is a double meaning: the alchemist's work surface AND the **periodic
      table** of elements — which doubles as the page's hero visual.
    - Keeps the flagship section name "The Alchemist" free; avoids a second
      "... Lab" (Sci-Fi Lab).
- **Route (planned):** `/observatory/alchemists-table`
- **Theme:** materials, combination, experimentation, discovery, lineage.
- **Target emotion:** curiosity, the thrill of discovery, craft and pride.
- **Visual direction (design-freedom):** alchemy + periodic-table motif — element
  tiles, crucibles/beakers, parchment and glowing reagents. Card scheme is the
  bespoke `alchemy` palette (a vertical witch's-cauldron gradient: red flames
  rising to violet smoke, with a green-brew accent). Distinct from Hello World
  (Impressionist) and Sci-Fi Lab (cyberpunk).

## Concept model: the alchemist's vocabulary

A small metaphor layer gives the page a shared language, so sections feel like one
world rather than a pile of charts.

- **Purity (純度):** how foundational a material is — the base elements many works
  are built on.
- **Catalyst (触媒):** a rare material. Rarity is framed as value and novelty, not
  obscurity.
- **Transmutation (変成):** a badge for a work that used a rare Catalyst material —
  "this maker transmuted something rare."
- **Element symbol:** each material gets a short pseudo-symbol and an "atomic
  number" for the periodic-table visual.
- **Compound vs Element (化合物と元素):** a playful taxonomy — single-purpose tools
  are "elements", while kits/platforms that bundle many capabilities are
  "compounds". Adds texture to how we talk about materials.
- **School (流派):** an emergent "faction" of materials that tend to be used
  together — e.g. a physical-hack school (hardware-heavy), an AI-integration
  school, a low-tech craft school. Crucially these are NOT hand-authored
  categories: they are auto-derived from co-occurrence, so they shift as the
  community's tastes shift. The organizing principle for a living periodic table.

## Ideas to explore

Grouped by theme. Each is an idea, not a spec — the point is the story it tells
and the feeling it creates.

### The Catalog — the materials themselves

- **The Periodic Table (素材の周期表):** the hero. Every material as an element
  tile, arranged like a real periodic table. Turns "a list of tools" into a world
  you want to browse — and the page's main navigation hub.
    - **Tile anatomy:** each tile shows a pseudo-symbol, an "atomic number"
      (= purity rank), an "atomic weight" (= usage count), and a color for its
      **School**.
    - **Groups & periods:** columns group materials by emergent **School** (not
      fixed families), and rows/periods can read as era of first appearance —
      Primordial elements up top, newest arrivals below. The layout breathes with
      the community rather than staying rigid.
    - **Property overlays:** like a real table's gradients (electronegativity,
      etc.), toggle overlays to re-read the same table through different lenses —
      versatility, volatility (Half-Life), or "gold-making" potential
      (Philosopher's Stone).
    - **Hub:** clicking any tile opens the Element Inspector, making the table the
      gateway to every other section.
- **The Schools (流派):** surface the auto-derived factions of materials (physical
  hack, AI integration, low-tech craft, ...) and how they rise, split, and merge
  over time. A dynamic cultural map instead of a rigid taxonomy.
- **In Season / Fading (旬と衰退):** which materials are rising and which are
  quietly disappearing. The zeitgeist of making.
- **Lost Technology (ロストテク):** materials that show up disproportionately among
  retired works — an archaeology of tools that had their moment.
- **Endangered Elements (絶滅危惧素材):** rare materials fading toward extinction —
  shine a "protect this" light on them. A note of conservation and inheritance.
- **The Rarest Brew (最も奇妙な調合):** the work with the most improbable recipe of
  all — the single most exotic concoction on the table.
- **The Half-Life (半減期):** borrowing radioactive decay — how fast a material's
  usage decays after its peak. Separates fleeting fads (short half-life) from
  stable staples (long half-life). A more scientific companion to In Season /
  Fading.
- **The Primordial Element (原初の元素):** the oldest materials still in active use
  today — primordial yet undecayed. A note of legend and reverence for the tools
  that have been here since the beginning.

### The Combinations — the core

- **The Alchemist (初の配合):** the pioneer of a fusion — the first work to combine
  two materials. "Who first fused M5Stack + ChatGPT, and how many followed?"
  Honors the trailblazers and shows lineage.
- **Iron Combos (鉄板の配合):** the dependable alloys — combinations makers reach
  for again and again.
- **Forbidden Fusion (禁断の配合):** the happy accident — a miraculous work that
  succeeded by combining materials that "shouldn't" go together. Its mirror,
  **Natural Affinities**, celebrates pairs that bond far more than chance would
  predict.
- **The Versatile Element (万能素材):** the Swiss-army material that pairs with the
  widest variety of others.
- **The Loner (孤高の素材):** the soloists — materials that tend to stand alone.
- **Isotopes (同位体):** materials that share the same partners yet rarely appear
  together — the same idea expressed through interchangeable tools.

> **The Missing Link** (proposing pairs that do NOT yet exist) is intentionally
> not here. See "Relationship to The Explorer's Guild".

### Scale & Style — how materials are used

- **The Kitchen Sink (全部盛り):** the maximalists — works assembled from the most
  parts.
- **Less is More? (ミニマリスト):** do lean builds punch above their weight? A
  playful look at simplicity vs engagement.
- **The Catalyst & Transmutation (触媒と変成):** spotlight works built on rare
  materials, badged as Transmutation — celebrating novelty and rare-material
  pioneers.

### Value & Alchemy — the meaning of materials

The heart of the theme: turning base metals into gold.

- **The Philosopher's Stone (賢者の石):** the one ingredient that, when added, most
  often coincides with a work taking off — the mythical gold-making element.
- **Base Metals to Gold (鉛から金へ):** beloved works built entirely from humble,
  everyday materials — proof that you do not need rare parts to make gold. An
  encouraging counter-story to Catalyst.

### The Reagent in Context — materials × the rest of the record

**Why this group exists.** The page as shipped reads materials against only two
things: **time** (rise / fall / debut) and **materials themselves** (the
Combinations group). But every prototype carries far more — the tags that say
what it is _for_, the event it was born at, whether it won an award, who wielded
it, whether it still lives or was laid to rest, and whether it turned to gold
(engagement / a product link). Crossing materials with these opens whole axes
the time-and-co-occurrence view cannot reach. Most of these are cheap
single-field joins over data we already fetch — no new "combinations" matrix
required (contrast the Combinations group, whose material×material matrix is the
one heavy new building block).

**Design north-star (from the ideation).** Favour the _human drama_ over a bare
statistics dashboard: a Pioneer's courage, a Purist's devotion, a reagent that
keeps winning trophies. The most powerful of these are **fact-based honours** a
maker can find their own name in ("you are the Pioneer of this element") — the
maker's story is what makes the observatory worth revisiting.

> **Data reality check (measured on a ~6.3k-prototype sample, among works that
> have materials — the page's population).** Numbers below are what actually shows
> up in the data, not the API's presence-rate docs. Read the per-idea
> **Feasibility** notes before committing to any of these.
>
> - **`tags` present: ~86%.** Strong coverage, but tags are _not_ a clean "intent"
>   field — see The Element's Purpose. Average per-work overlap with materials is
>   low (Jaccard ≈ 0.1), yet a real slice of tags are just the _same technology_
>   spelled differently across fields (`Arduino`/`arduino`, `Unity`/`unity`,
>   `3Dプリンター`/`3Dプリンタ`). Case-folding alone does **not** collapse them.
> - **`events` present: ~60%.** Strong. Dominated by ヒーローズ・リーグ (per-year
>   editions) and M5Stack contests — real "houses". Editions are year-suffixed, so
>   decide whether to collapse `... 2023/2024/2025` into one guild.
> - **`officialLink` present: ~54%.** Strong.
> - **`users` present: ~100%** (`teamNm` only ~30%). Use `users` for any maker
>   axis; treat `teamNm` as optional enrichment.
> - **`awards` present: only ~12%, and 477 distinct free-text names** (`優秀賞`,
>   `最優秀賞`, event-specific prizes...). Sparse and messy — see The Gold Standard.

- **The Element's Purpose (元素の用途) — materials × `tags`:** each reagent gains a
  "spectral signature" — the genre/intent tags its works carry. This one is
  **empirically the most promising**: measured signatures are already legible —
  `Unity` → AR / VR / ゲーム; a generative-AI reagent → 機械学習 / 生成AI; `Arduino`
  → IoT / 電子工作 / LED. Read the other way, it answers "which reagents does this
  domain reach for?" and turns an Element Inspector tile from a bare count into a
  portrait.
    - _Reframe from the first draft:_ "material = means, tag = intent" is only
      **partly** true. Tags are a **mix** of (a) genuine domains/genres (IoT, AI,
      AR, VR, 電子工作 — the payoff), (b) event tags (`M5Stack_contest_2021`), (c)
      community memes (`MAID`, `オレトク`), and (d) technologies duplicated from the
      material field with spelling drift. The signal is real but must be _mined_
      out of that mix.
    - _Feasibility:_ needs a normalization + noise-filter step **scoped to this
      analysis only** (case-fold at minimum; strip event-pattern and material-echo
      tags), deliberately separate from the page-wide "counted as written" policy.
      Cheapest path: an allow-list of domain/genre tags rather than trying to clean
      the whole tag vocabulary.

- **The Alchemists' Ledger (術師たちの系譜) — materials × `users`
  (× `createDate` / `awards`)** _(user idea 案1, expanded into two
  complementary directions)_: the page's emotional centre and its "ecosystem map
  of makers". A fact-and-behaviour axis (NOT engagement) — every title is provable
  from public fields, so being named is an _earned honour_ a maker will hunt for.
  It absorbs the earlier "First Alchemist / Signature / Evangelist" bullets. The
  two directions are the two wheels of one cart: enter from a **maker**
  (Direction 1) or from a **material** (Direction 2), letting the reader cross
  between "great makers → the reagents they love" and "a beloved reagent → its
  great forebears." Each direction has its own detailed spec:
    - **Direction 1 — The Circle of Masters (巨匠たちの円環), user-centric.** A round
      table / hall of fame that seats notable makers, each with a fact-based title
      (Polymath, Purist, Trophy Hunter, Veteran, Perennial, Rising, Vanguard, and
      the meta-honour Grand Alchemist). Full spec:
      [`the-circle-of-masters.md`](./the-circle-of-masters.md).
    - **Direction 2 — The Elemental Chronicles (元素が刻んだ人の歴史),
      material-centric.** For each top reagent, name the key people who shaped its
      story (Pioneer, Grandmaster, Innovator), surfaced in the Periodic Table as
      "The Forgers of this Element". Full spec:
      [`the-elemental-chronicles.md`](./the-elemental-chronicles.md).
    - _Guardrail (both directions):_ aggregate and celebratory, public works only —
      never individual profiling (heeds the Social Graph idea `analysis-ideas.md`
      rejected on privacy grounds).
- **The House Reagents (流派の秘薬) — materials × `events`:** every guild
  (hackathon / contest) has a house style. Which materials over-index at each
  event relative to the platform baseline — the signature reagents of one contest
  versus another. This is the "Maternity Hospital" idea crossed with materials:
  not just _where_ works are born, but _what they are forged from_ there.
    - _Feasibility:_ **strong** (~60% coverage). Decide whether to fold per-year
      editions (`ヒーローズ・リーグ 2023/2024/...`) into one guild; strip the
      `@eventId` suffix on the raw token.
- **The Royal Armory (王立の宝物庫 / 栄誉の証明) — materials × `awards`**
  _(user idea 案3)_: not popularity (usage) but which reagents forge works the
  _judges_ reward — the curated counterpart to the crowd. Since views/likes are
  treated as low-trust here, this award signal is the more meaningful "quality"
  read. Base award-rate among works-with-materials is **~11.8%**. Two facets:
    - **The Trophy Forgers (栄光の錬成陣):** reagents with an above-base award-rate
      — the repeat keys to victory. _Measured — viable with a floor:_ at n>=20 the
      board is sensible and striking — `kintone` 26% (53/202), `Fusion360` 26%
      (35/134), `Flutter` 29% (15/52), `KiCad` 29% (12/41).
    - **The Dark Horses (奇跡の石):** rare reagents that punch far above their
      weight in the winners' circle — the hidden secret ingredient. _Measured —
      fragile:_ the naive rate is pure noise (dozens of 2/2 = 100% materials);
      even a floor (5<=n<40, awards>=3) yields only shaky handfuls (ARCore 4/5,
      MediaPipe Pose 7/12). Do NOT ship a raw ranking — use a statistical lower
      bound (Wilson / Bayesian shrinkage toward the ~11.8% base) or curate it as a
      hand-picked "surprising winner" spotlight.
    - _Feasibility overall:_ **small-N** — only ~12% of works have awards, across
      477 messy free-text names; use a binary "won any award", never specific
      prize names.
- **Transmutation to Gold (製品への変成) — materials × `officialLink`:** which
  reagents most often accompany a work that graduated to a product or service (an
  `officialLink` present)? The literal turning of an experiment into gold.
    - _Caveat_ (from `analysis-ideas.md`): a missing link does not mean lesser —
      hardware and physical works often need no web presence.
    - _Feasibility:_ **strong** (~54% coverage); a simple
      presence-rate-per-material.
- **The Philosopher's Stone, Refined (賢者の石・精錬) — materials × engagement, per
  material:** the shipped page only relates engagement to _how many_ materials a
  work uses (Less is More?). Flip the axis: which _specific_ reagent's works carry
  the highest median 💚 — the single element that most coincides with a work
  resonating. The concrete, ranked form of the Philosopher's Stone.
    - _Feasibility:_ data is 100% present, but **de-prioritized on purpose**: view
      and like counts are treated as arbitrary / low-trust signals for this page,
      so engagement-ranked ideas are not a priority. Prefer behaviour-and-fact
      axes (first use, breadth, continuity, collaboration) over engagement.

## Experience and interaction

The metaphor is strongest when the reader gets to _experiment_, not just read.

- **The Crucible (実験台):** the interactive form of The Alchemist. Drop two
  materials into a crucible and watch the first work and representative works of
  that fusion bubble up like reaction results. "Playing alchemist," not searching.
- **Element Inspector:** click a periodic-table tile to open that material's
  card — its partners, first fusions, whether it is a soloist, how it trends over
  time. One interaction that ties many ideas together.
- **Force-field affinity map:** click a material and related materials are drawn in
  like magnets while unrelated ones drift away — a living map of alliances that a
  static ranking cannot convey.
- **The Recipe / Formula (錬金レシピ):** render a work's materials as an alchemical
  formula using element symbols (e.g. `M5 + Sv + AI -> work`) — a shareable
  "recipe card" that makes a build feel like a spell.
- **The Transmutation Circle (変成陣):** a circular chord/arc diagram of the major
  materials and their bonds — an alchemy circle that IS the data. A centerpiece
  visual.
- **Distillation level (蒸留度):** do not hide the minimum-frequency threshold —
  expose it as a "distillation" slider. Turning it up boils off the noise to
  reveal only the strongest bonds; turning it down shows the messy long tail.
  "Removing impurities to see the essence" becomes something the reader does.

## Community hooks

- **Alchemist of the Month (今月の錬金術師):** celebrate the maker behind the
  month's most interesting fusion, giving the community a recurring reason to
  experiment. Keep it celebratory and aggregate — never a profile of individuals
  beyond their public work.
- **Fusion of the Day (本日の配合):** a daily featured pairing — its pioneer and
  representative works — as a small fortune/gacha-like reason to come back each
  day.

## Relationship to The Explorer's Guild

Division of labor with the (future) Explorer's Guild page, so they complement
rather than duplicate:

- **The Alchemist's Table** — analyze **existing** combinations and find the
  patterns (analysis / insight). Tone: **a library / archive** reading the vast
  record of past experiments.
- **The Explorer's Guild** — present **unknown / not-yet-attempted** pairs to
  provoke exploration (inspiration / call-to-action). Tone: **a compass** pointing
  into the mapless wilderness.

Keeping the two tones fully distinct (archive vs compass) is what keeps users from
getting lost between the pages.

## Feasibility at a glance

Rough effort only — not an implementation plan.

- **Uses data we already aggregate** (material frequency and yearly trends): the
  Periodic Table, In Season / Fading.
- **Needs a new "combinations" analysis** (which materials appear together):
  everything in The Combinations, plus Kitchen Sink / Less is More. This one
  addition unlocks most of the page, so it is the key building block.
- **Mostly front-end / interaction work:** the Crucible, Element Inspector, and
  force-field map.

## Rough phasing

There is **no need to build everything at once** — this page is meant to grow
incrementally, adding one or a few sections at a time (echoing the "feature pages
release periodically" intent in `analysis-ideas.md`). The list below is a rough
sense of order, not a fixed milestone.

- **Start with** a strong static page: the Periodic Table (hero) + The Alchemist's
  first-fusions + Iron Combos, plus the easy, striking Kitchen Sink and the
  Less is More? question.
- **Grow into** the surprises (Forbidden Fusion, Natural Affinities, Versatile /
  Loner, Catalyst / Transmutation, Lost Technology) and the interactive crucible /
  inspector / affinity map, then the community hook.

## Dreams for later

- **AI story agent:** a small agent that narrates the "story" of a specific pair
  (what it enabled, how it spread) — a more mysterious, genuinely alchemist
  experience.

## Open ideas to keep chewing on

- Periodic-table grouping is resolved in favor of emergent **Schools (流派)** —
  auto-derived from co-occurrence — instead of hand-authored families, so the
  layout stays alive and community-driven. (Open sub-question: how legible /
  stable the auto-derived Schools are, and how to name them.)
- What makes a fusion feel "notable" enough to feature — novelty, popularity,
  surprise, or the story behind it?
- How playful can the Transmutation / Catalyst badges get without feeling gimmicky?
