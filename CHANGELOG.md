# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [CalVer](https://calver.org/).

## [Unreleased]

### Added

- Add an opt-in promidas in-memory Repository
  (`lib/repositories/promidas-repository.ts`) behind `USE_PROMIDAS_REPOSITORY`
  (default off; `prototypes.ts` is the fallback). When enabled, these prototype
  reads resolve via the promidas snapshot through
  `app/actions/prototypes-gateway.ts` instead of `prototypeMapStore`:
    - name lookup (playlist preview)
    - all prototypes (analysis hydrate)
    - max prototype id

### Removed

- Remove the unused `getTsv` method from `PrototypeRepository` (it fetched a
  non-existent `/api/prototypes/tsv` route and had no callers), and delete the
  entirely unused `in-memory-prototype-repository` test helper. Sample-data TSV
  export in `tools/get-sample-data.ts` is unaffected (it uses the SDK's
  `downloadPrototypesTsv` directly).

### Changed

- Build the shareable playlist URL from the running environment's origin instead
  of a hardcoded production domain. The URL builders now return an origin-less
  path (`buildPlaylistUrl` -> `buildPlaylistPath`,
  `buildPlaylistUrlWithPathParams` -> `buildPlaylistPathWithPathParams`) and the
  playlist editor prepends the client's `window.location.origin`, falling back to
  `APP_URL` during SSR (read hydration-safely via `useSyncExternalStore`).
- Resolve prototype names in the playlist preview card with SWR (`useSWR`)
  instead of a hand-rolled `useEffect` fetch. Names now dedupe/cache by id set,
  the manual cancellation flag is gone, and `isLoading` distinguishes "still
  loading" (blank cell) from a genuinely missing name (`(unknown)`). The name
  column takes `w-full` so its width no longer shifts as names arrive.
- Fetch the SHOW / by-id prototype via a promidas-backed non-cached client.
  `getLatestPrototypeById` now calls the `fetchPrototypesNoStore` server action
  in `app/actions/prototypes-gateway.ts` (backed by
  `lib/promidas-no-store-client.ts`, which uses
  promidas's `ProtopediaApiCustomClient.fetchPrototypes` for fetch + normalize +
  structured errors). Implemented as a separate path: the SDK-based no-store
  client, the shared list (force-cache) path, and the random/map-store path are
  untouched, so it can be rolled back by switching the consumer import. The
  SDK-based `fetchPrototypesViaNoStoreClient` action and `protopediaNoStoreClient`
  are now `@deprecated` (retained as a fallback) in favour of the promidas
  versions. The promidas client logs through the app's pino server logger (via a
  small adapter) so its diagnostics are consistent with the rest of the server
  code rather than going to a standalone console logger. (#136, #138)
- Adopt the `promidas` package for ProtoPedia prototype normalization (added
  `promidas` and `promidas-utils` as dependencies). `normalizePrototypeForMpp`
  delegates to promidas's `normalizePrototype`, replacing the local
  normalization utilities (`splitPipeSeparatedString`, `lib/utils/time.ts`, now
  removed), so promidas is the single source of truth for parsing. This adopts
  promidas's behavior: empty segments are dropped from pipe-separated fields
  (`tags` / `users` / `awards` / `events` / `materials`), missing `releaseDate`
  / `updateDate` become `undefined` (not `''`; the API can return null), and
  missing `summary` / `systemDescription` / `releaseFlg` / `licenseType` default
  to `''` / `''` / `2` / `1`. Adds characterization tests. (#136, #137)
- Align the internal `PrototypeForMpp` type with promidas's
  `NormalizedPrototype` and make it a direct alias: fully `readonly`, code-typed
  `status` / `releaseFlg` / `licenseType` / `thanksFlg`, and matching
  optionality. Consumers are unchanged. (#136, #137)
- Upgrade `protopedia-api-v2-client` from 2.0.0 to 3.0.0. The v3 type
  definitions make 9 `ResultOfListPrototypesApiResponse` fields optional
  (`teamNm`, `users`, `freeComment`, `releaseDate`, `thanksFlg`, `uuid`,
  `revision`, `releaseFlg`, `licenseType`). Prerequisite for adopting the
  `promidas` / `promidas-utils` packages. (#136)
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
