# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [CalVer](https://calver.org/).

## [Unreleased]

### Changed

- Make `PrototypeForMpp`'s `revision` / `licenseType` / `thanksFlg` optional to
  match promidas's `NormalizedPrototype` (the API may omit them), so their
  optionality is represented honestly rather than masked. The adapter no longer
  re-applies `0` / `1` defaults (promidas already supplies them). (#136, #137)
- Make `PrototypeForMpp`'s `releaseDate` / `updateDate` optional
  (`string | undefined`) instead of forcing them to `''`, reflecting that the
  ProtoPedia API can return null for these. The adapter passes promidas's value
  through, and consumers guard with `!= null` and only process valid dates
  (replacing truthy/falsy checks). (#136, #137)
- Make `PrototypeForMpp` fully `readonly` (including its array fields) to match
  promidas's `NormalizedPrototype` and reflect that normalized prototypes are
  treated as immutable. The normalization adapter now passes promidas's readonly
  arrays through without copying. No runtime behavior change. (#136, #137)
- Type `PrototypeForMpp`'s `status`, `releaseFlg`, `licenseType`, and
  `thanksFlg` with promidas's code types (`StatusCode`, `ReleaseFlagCode`,
  `LicenseTypeCode`, `ThanksFlagCode`) instead of `number`, so invalid codes
  are caught at compile time. No runtime change. (#136, #137)
- Delegate prototype normalization to `promidas` (added as a dependency with
  `promidas-utils`). `normalizePrototype` now adapts `promidas`'s output to the
  internal `PrototypeForMpp` shape; consumers are unchanged. Adopts promidas's
  behavior: empty segments are dropped from pipe-separated fields, and missing
  `summary`/`systemDescription` default to `''`. Adds characterization tests.
  (#136, #137)
- Upgrade `protopedia-api-v2-client` from 2.0.0 to 3.0.0. The v3 type
  definitions make 9 `ResultOfListPrototypesApiResponse` fields optional
  (`teamNm`, `users`, `freeComment`, `releaseDate`, `thanksFlg`, `uuid`,
  `revision`, `releaseFlg`, `licenseType`). `normalizePrototype` now applies
  `''` / `0` fallbacks for the consumed fields, so the prototype model
  contract is unchanged and consumers are unaffected. Prerequisite for
  adopting the `promidas` / `promidas-utils` packages. (#136)
- Rename the local `NormalizedPrototype` type to `PrototypeForMpp` to make
  its app-specific scope explicit and avoid a name clash with the
  `NormalizedPrototype` type exported by `promidas`. (#136)
- Make `AnalysisDashboard` presentational and stop passing a hook as a
  prop (`useLatestAnalysisHook`), which violated the Rules of Hooks and
  blocked React Compiler memoization of the dashboard and its parents. A
  new `AnalysisDashboardContainer` now owns the `useLatestAnalysis` hook.
  Also hoist a value block out of a `try/catch` in the home page so the
  compiler can optimize the max-prototype-id resolver. (#157, #166)
- Extract header-height measurement (the `ResizeObserver` and
  `--header-offset` CSS variable sync) out of `MugenProtoPedia` into a
  `useHeaderHeight` hook, as the first step of incrementally decomposing
  the oversized home page component. The hook also guards `ResizeObserver`
  with a window `resize` fallback and removes `--header-offset` on unmount.
  (#168)
- Extract the max-prototype-id resolver (the `getMaxPrototypeId` server
  action call, its fallback and validation) out of `MugenProtoPedia` into
  a `useMaxPrototypeId` hook. Step B of decomposing the home page. (#168)
- Use the client logger (`@/lib/logger.client`) instead of `console.*` in
  the home page so all of its logging goes through one structured,
  level-aware path (it already used `logger` for most messages). Warnings
  and errors still surface at the default client log level.
- Extract the command window / cheat-code key sequences (visibility, the
  key buffer, the matched-command display, and the Escape-to-close and
  special-sequence handling) out of `MugenProtoPedia` into a
  `useCommandWindow` hook. Step C of decomposing the home page; behavior
  unchanged. The match-reset `setTimeout` is now tracked in a ref, cleared
  before re-scheduling, and cancelled on unmount (no stacked timers or
  post-unmount state updates). (#168)
- Extract the prototype-fetching handlers (random, by-id SHOW, and the
  playlist-mode fetch) out of `MugenProtoPedia` into a `usePrototypeFetching`
  hook. The slot operations stay owned by the page and are injected; the
  playlist fetch is returned for the upcoming playlist-playback work (#158).
  Step D of decomposing the home page; behavior unchanged. (#168)
- Extract the playlist playback orchestration (the queue/signature/timeout
  refs and the queue-prep + timer-loop effects) out of `MugenProtoPedia` into
  a `usePlaylistPlayback` hook, and model its state as a `useReducer` state
  machine in `usePlaylistPlaybackState` (collapsing `isPlaylistPlaying` /
  `isPlaylistCompleted` / `processedCount` and the random title-card style).
  The reducer-backed `dispatch` is stable and position-independent, so the
  late-running orchestration drives state that is declared early and fed back
  into `usePrototypeFetching` without a circular dependency. This removes the
  block `eslint-disable react-hooks/set-state-in-effect` the imperative setters
  required. Final step (E) of decomposing the home page; behavior unchanged.
  (#168, #158)
- Split `MugenProtoPedia` into a container that wires the hooks and derived
  state and a presentational `MugenProtoPediaView` that receives that state and
  the callbacks as props, so the home view is hooks-free and renderable in
  isolation. The analysis dashboard is injected as a `ReactNode` prop (mirroring
  `Header`) to keep the data-fetching `AnalysisDashboardContainer` out of the
  view. Adds Storybook stories for the view. Behavior unchanged. (#71)
- Move the home route's top-level `<main>` layout shell out of the view into a
  `HomeLayout` component owned by `app/page.tsx`, so the page owns the layout
  shell (mirroring `PlaylistEditPage`) while feature logic stays in
  `MugenProtoPedia`. The view now returns a fragment; the shell renders during
  Suspense instead of `null`. Behavior unchanged. (#71)
- Make the date-based Christmas theme injectable: `resolveThemeByDate` and
  `resolveMppThemeType` now accept an optional `now: Date` (defaulting to the
  current time), and `PlayModeTheme` accepts an optional `now` prop. This makes
  the theme deterministic for tests (no global clock mocking) and previewable
  for any date in Storybook. Adds `PlayModeTheme` theme-confirmation stories
  (including a date-injected Christmas preview). Behavior unchanged. (#71)

## [2026.06.29]

### Added

- Enable `typedRoutes` so internal `Link` hrefs are statically type
  checked. (#162)

### Changed

- Upgrade Next.js from 15.5.7 to 16.2.9. (#161)
- Upgrade to ESLint 10 and migrate to the native flat config. (#156,
  #159)
- Update `@vercel/analytics` to v2 and bump several major dependencies
  (jsdom, glob, lucide-react, @chromatic-com/storybook). (#152, #155)
- Simplify PWA icon generation using `@vite-pwa/assets-generator`.
  (#143)

### Fixed

- Remove the hand-written `<head>` from the root layout. In the App
  Router it broke the Metadata API insertion point, which could push
  `<title>`, `<link rel="manifest">`, `<meta name="description">` and
  Open Graph tags into `<body>` (causing Chrome to report "No manifest
  detected"). The FOUC theme bootstrap is kept as a plain inline
  `<script>` so it still runs synchronously before first paint. (#165)
- Make the PWA `apple-touch-icon` full-bleed. (#144)

### Security

- Escape `<` in the JSON-LD structured data before injecting it via
  `dangerouslySetInnerHTML`, so no value can terminate the `<script>`
  tag early. Defensive hardening; current values are static constants
  and the rendered output is unchanged. (#165)

## [2026.06.23]

### Changed

- Disable text selection on the header and the control panel to prevent
  labels and emojis from being accidentally selected on click or drag. The
  prototype ID input remains selectable.
- Remove background color classes from the StatusIndicator component.
