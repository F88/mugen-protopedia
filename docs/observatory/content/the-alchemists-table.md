---
lang: en
title: 'The Alchemist''s Table - Content Spec'
status: draft
related:
    - docs/observatory/analysis-ideas.md
    - docs/observatory/observatory-architecture.md
    - docs/observatory/ogp-guidelines.md
---

# The Alchemist's Table — Content Spec (Draft)

Concept and section spec for a new Observatory feature page themed around
**materials** (構成要素) — the elements makers build with. This document
organizes the ideas; a concrete implementation spec follows later.

> Status: **draft / ideation**. Names, scope, and section list are not final.
> Follow `docs/observatory/observatory-architecture.md` for how to implement,
> and remember the Observatory design-freedom rule: this page should have its
> own identity, not mimic other pages.

## Page identity

- **Working title:** The Alchemist's Table
    - "Table" is a deliberate double meaning: the alchemist's work surface AND
      the **periodic table** of elements — which doubles as the page's hero
      visual for a materials theme.
    - It also keeps the flagship section name "The Alchemist" free, and avoids
      colliding with "The Sci-Fi Lab" (no second "... Lab").
- **Route (planned):** `/observatory/alchemists-table`
- **Theme:** materials, combination, experimentation, discovery, lineage.
- **Target emotion:** curiosity, the thrill of discovery, craft/pride.
- **Visual direction (design-freedom):** alchemy + periodic-table motif —
  element cards, a periodic-table grid, crucibles/beakers, parchment with
  glowing reagents. Distinct from Hello World (Impressionist) and Sci-Fi Lab
  (cyberpunk). Dark mode may reuse the shared universe background; light mode is
  bespoke.

## Data model (what we have)

- Each prototype has `materials: string[]` (material/tool names).
- Existing batch analytics: `lib/analysis/batch/build-material-analytics.ts`
  provides:
    - `materialCounts` — full frequency histogram (all materials)
    - `topMaterials` — top 30 by frequency
    - `yearlyTopMaterials` — top 30 per year (year from `releaseDate`, fallback
      `createDate`)
- Engagement (`goodCount`, `viewCount`) and dates (`createDate`, `releaseDate`,
  `updateDate`) and `status` are available per prototype.

**Not yet built:** material co-occurrence (pairs), per-material combination
diversity, earliest-release per pair, and per-prototype material counts. Most
combination-themed sections depend on a new co-occurrence module (see Data plan).

## Sections

Data status legend: ✅ existing analytics · 🔨 needs new analytics · 🎨 mostly
visualization.

### Group 1 — The Catalog (the materials themselves)

- **The Periodic Table (素材の周期表)** — 🎨 (data ✅)
    - Full catalog of materials, sized/grouped by frequency. The page's hero
      visual. Source: `materialCounts` / `topMaterials`.
- **In Season / Fading (旬と衰退)** — ✅
    - Rising vs declining materials over the years. Source: `yearlyTopMaterials`.
- **Lost Technology (ロストテク)** — 🔨 (light)
    - Material ranking among memorialized works (`status: 4`). Filter by status,
      then aggregate materials.

### Group 2 — The Combinations (組み合わせ) — the core

- **The Alchemist (初の配合)** — 🔨 — flagship
    - The prototype that FIRST combined a given pair of materials (the pioneer of
      a fusion). Needs co-occurrence + earliest `releaseDate` per pair.
- **Iron Combos / Power Couples (鉄板の配合)** — 🔨
    - The most frequent co-occurring material pairs.
- **The Versatile Element (万能素材)** — 🔨
    - The material that combines with the widest variety of others (highest
      distinct co-occurrence degree) — the "Swiss Army knife".
- **The Missing Link (未踏の配合)** — 🔨
    - Popular materials that (almost) never co-occur — blue-ocean combinations.
      (Also listed under Explorer's Guild in analysis-ideas.md.)
- **The Bridge Builder (橋渡し作品)** — 🔨 — higher difficulty
    - Works that connect two otherwise-separate material communities (graph
      betweenness). Optional / later.

### Group 3 — The Scale & Style (how materials are used)

- **The Kitchen Sink (全部盛り)** — 🔨 (easy)
    - Ranking of prototypes using the most materials, plus the distribution of
      material-count per work.
- **Less is More? (ミニマリスト)** — 🔨 (easy)
    - Correlation between material-count and engagement (good rate). Do lean
      builds punch above their weight?
- **The Loner (孤高の素材)** — 🔨
    - Materials most often used alone (lowest co-occurrence) — the soloists.

## Data plan (backend)

Add one co-occurrence module (e.g.
`lib/analysis/batch/build-material-cooccurrence.ts`) that a single pass can
produce, powering most of Group 2/3:

- `pairCounts` — count per unordered material pair (use a canonical sorted key).
- `degree` — per material, the number of DISTINCT co-occurring materials
  (for The Versatile Element / The Loner).
- `pairFirstRelease` — per pair, the earliest-releasing prototype
  (id + `releaseDate`) for The Alchemist.
- `materialsPerPrototype` — `materials.length` per prototype
  (for The Kitchen Sink / Less is More; trivial, could live inline).

Considerations:

- Apply a minimum-frequency threshold to pairs/materials to cut noise (long tail
  of one-off materials). Make the threshold explicit and `log()` what is dropped.
- Pair space is O(n^2) per prototype in materials — fine given small
  per-prototype material counts, but cap or guard pathological cases.
- Normalize material strings consistently with the existing analytics (same
  casing/trimming) so counts line up.

## Suggested v1 scope

Ship a page that is visually strong and combination-driven, favoring existing
data + the flagship + low-effort high-impact sections:

1. The Periodic Table (hero, data ✅)
2. The Alchemist (flagship, 🔨)
3. Iron Combos (🔨, same co-occurrence base as The Alchemist)
4. The Kitchen Sink (🔨, easy, striking)
5. Less is More? (🔨, easy, insight)

Defer to v2 (all reuse the same co-occurrence module): The Versatile Element,
The Missing Link, The Loner, The Bridge Builder, Lost Technology, In Season /
Fading. This matches the "feature pages release periodically" intent.

## Open questions / decisions

- Final page title (working: The Alchemist's Table) and route slug.
- Card visuals on the top page: color scheme (currently reuses `purple`) — do we
  want a bespoke `cardColors` scheme (e.g. an "alchemy"/violet-gold palette)?
- Whether "The Missing Link" lives here or under The Explorer's Guild (it is
  listed there in analysis-ideas.md) — avoid duplicating the same analysis on
  two pages.
- Co-occurrence thresholds and how pairs are surfaced in the UI (ranked list,
  matrix, or interactive).
