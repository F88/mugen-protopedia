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
  the oversized home page component. (#168)

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
