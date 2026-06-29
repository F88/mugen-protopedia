# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [CalVer](https://calver.org/).

## [Unreleased]

### Changed

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
