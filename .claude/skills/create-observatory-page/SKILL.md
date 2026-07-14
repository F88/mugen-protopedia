---
name: create-observatory-page
description: >-
    Scaffold and implement a new page or feature under `app/observatory/*` in this
    repo (mugen-protopedia). Use this whenever the user wants to add, create, or
    build an Observatory page/section/feature — e.g. "add an Observatory page",
    "implement the Hall of Fame / Memorial Park / Sci-Fi Lab / Explorer's Guild
    page", "scaffold a new observatory sub-page", "make a new analysis page under
    /observatory", or "add a card to the Observatory top page". The Observatory
    subsystem has its own conventions (per-page theme.ts, opt-in shared building
    blocks, OG images) AND a deliberate design-freedom rule that is easy to get
    wrong — so always use this skill rather than copying another page and assuming
    it must look the same.
---

# Create an Observatory Page

Observatory (`/observatory`) is a distinct subsystem in mugen-protopedia for
analytical, story-driven views of the ProtoPedia universe. This skill is the
actionable workflow for adding a new page (or an external-link card) to it.

## The one rule that overrides all others: design freedom

**Observatory pages are NOT forced to share a single layout, design, or mode of
expression. Each page may be its own free, unique content.**

This is a deliberate product decision by the user. The main app (`/`) values
consistency; Observatory does not. So:

- Do **not** homogenize a new page to match `hello-world/` (or any other page).
  Matching fonts, colors, section rhythm, or component structure is a _choice_,
  never a requirement.
- Every page is encouraged to have its own theme, palette, typography, background
  treatment, and even bespoke components that exist nowhere else.
- The shared building blocks below are **opt-in conveniences**, not a mandate.
  Reach for them when they help; invent something page-specific when they don't.

When in doubt, favor the page's own concept and aesthetic over uniformity. If the
user describes a distinct visual identity (e.g. "Impressionist", "brutalist
terminal", "old newspaper"), lean into it fully.

## Read the source-of-truth docs first

Before writing code, read these — they are authoritative and this skill only
summarizes them:

- `docs/observatory/observatory-architecture.md` — patterns, theme system,
  directory structure, `ObservatoryCard`, and the step-by-step "add a page /
  add a card" procedure. (Note: its front-matter and its 1st/title line are
  marked do-not-update — never edit those.)
- `docs/observatory/analysis-ideas.md` — the concept/spec source for pages and
  analyses (Hall of Fame, Memorial Park, Sci-Fi Lab, Explorer's Guild, etc.).
  Find the target page's concept here and honor it. It also has an
  **"Unacceptable ideas"** section — respect it.
- `docs/observatory/ogp-guidelines.md` — per-page Open Graph image guidance.

Use `hello-world/` as a _reference implementation_ to learn the mechanics — not
as a template to clone verbatim.

## First, decide what you're building

There are two very different things a user might mean:

1. **An internal sub-page** (`app/observatory/<page>/page.tsx`) — a full page with
   its own route, theme, background, sections, and OG image. This is the main
   case; follow "Workflow: new sub-page" below.
2. **An external-link card** on the top page (links out to another site, no page
   of its own). This does **not** need a directory/theme/OG image. Just add an
   `ObservatoryCard` with an absolute URL — see section 6 of
   `observatory-architecture.md`. Confirm which one the user wants if unclear.

## Workflow: new sub-page

Mirror the structure of an existing page (`app/observatory/<page>/`):

```text
app/observatory/<page>/
├── page.tsx                 # route entry: metadata, header, background, content
├── background.tsx           # 'use client'; dark = shared universe, light = custom
├── theme.ts                 # page theme (satisfies ObservatoryThemeConfig)
├── content.tsx              # server data fetch + section composition (if data-driven)
├── opengraph-image.tsx      # OG image via shared generator
├── twitter-image.tsx        # usually re-exports the OG image
└── components/              # page-specific sections/components
```

Steps:

1. **Ground the concept.** Pull the page's theme/emotion/content from
   `analysis-ideas.md`. Agree with the user on the visual identity before coding —
   this is where design freedom is exercised.
2. **Write `theme.ts`.** Export a `const` object with
   `as const satisfies ObservatoryThemeConfig` (from
   `app/observatory/shared/theme.types.ts`). Required keys: `colors.light`,
   `colors.dark`, `typography`, `ogImage`. Page-specific keys (`sections`,
   `animation`, anything else) are preserved by `satisfies` — add whatever the
   page needs. Also export inferred types (e.g.
   `export type XSectionKey = keyof typeof theme.sections`).
3. **Write `background.tsx`.** Two-layer pattern: dark mode reuses
   `UniverseBackgroundMainDark` (from `shared/`); light mode is a custom design
   matching the page concept. But this is opt-in — a page may define an entirely
   different background if that serves its identity.
4. **Build the content/sections.** If data-driven, fetch in a server component
   (see `hello-world/content.tsx` using `app/actions/...`) and compose sections.
   `components/observatory-section.tsx` (`ObservatorySection`) is a convenient
   shared wrapper with ~15 built-in color themes — use it or roll your own.
5. **Write `page.tsx`.** Export `metadata` (title/description/openGraph/twitter),
   set `export const revalidate = <seconds>` if the data should be ISR-cached
   (no dynamic APIs → the route pre-renders statically and revalidates), render
   `<ObservatoryHeader colorScheme="..." />` + background + content.
6. **Add OG images.** Copy `opengraph-image.tsx` from an existing page, point it
   at your `theme.ts`, update `alt`/`title`/`subtitle`. Follow `ogp-guidelines.md`.
7. **Register on the top page.** Add an `ObservatoryCard` in
   `app/observatory/page.tsx` and a config entry in `app/observatory/theme.ts`
   (`cards.<key>` for font/colorScheme, and a new `cardColors.<scheme>` if you
   need a new palette). See section 6 of `observatory-architecture.md` for card
   props (`href` internal/external, `titleClassName`, `backgroundImage`,
   `description` as `ReactNode`, etc.). Note: a `cardColors` scheme's `hoverText`
   must differ from its `textColor`, or hover has no visible effect.
8. **Add new fonts** (if the design calls for them) to
   `app/observatory/shared/fonts.ts`: import from `next/font/google`, export a
   `const`, and register it in the `observatoryFonts` map.

## Data sourcing — keep the base analysis lean

Observatory is **sub-content at its own URL**, not part of the 無限PP top page.
The top page depends on the base analysis (`buildAnalysisOverview` /
`getAnalysisOverview`), so **do NOT bolt Observatory-specific analytics onto it** —
growing that pipeline bloats it and slows the top page. This is a real
performance boundary, not a style preference.

Instead:

- **Share the raw data, not the analysis.** Fetch prototypes via
  `getAllPrototypes()` (`app/actions/prototypes-gateway`) — the same source the
  base analysis uses — and compute your page's own metrics in a **dedicated**
  server module/action (e.g. `app/actions/<page>-analysis.ts`). Reuse existing
  batch builders in `lib/analysis/batch/` (e.g. `buildMaterialAnalytics`) rather
  than duplicating logic or extending the shared `AnalysisOverview` type.
- **Compute lazily.** Observatory data need not exist at app startup; build it at
  access time and cache with the page's `revalidate` (ISR), plus a page-specific
  cache if the computation is expensive. Do not warm it on the top-page path.
- **Only reach for `getAnalysisOverview()`** when your page genuinely wants the
  base analysis that the top page already computes — not as a convenient bag to
  extend.
- **If you memoize a repository build, key on the dataset generation
  (`lastFetchedAt`), not `data.length`** — a same-count content change must
  invalidate it. Include the JST day of `now`
  (`createLifecycleMomentContext(...).yyyymmdd`) when the output is date-relative
  (streaks, anniversary windows), or it goes stale at midnight. See the
  "Caching / memoization" note in `docs/observatory/observatory-architecture.md`.

## Repo conventions (do not skip)

- **Half-width characters only** for all numbers/letters/symbols, including inside
  Japanese text (project rule). Use `1` not `１`, `(` not `（`.
- **Verify before done:** `npx tsc --noEmit` and `npx eslint <changed files>` must
  be clean. Prefer running the app (`npm run dev`) to eyeball a visual page.
- **Conventional Commits** (`feat(observatory): ...`), and add a `CHANGELOG.md`
  Unreleased entry on the _same_ branch as the code. Keep list entries short.
- **Branch first** if on `main`; open a PR when asked. Don't commit without the
  user's go.
- Prefer explicit `!= null` over truthy/falsy checks for optional fields.

## Definition of done

- New page renders at `/observatory/<page>` with its own theme/background.
- OG + Twitter images generate for the page.
- A card links to it from the Observatory top page.
- `tsc` and `eslint` pass; CHANGELOG updated; commits follow conventions.
- The page expresses its own identity — it was not needlessly homogenized to
  look like the others.
