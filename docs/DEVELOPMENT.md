---
lang: en
title: Development Guide
title-en: Development Guide
title-ja: 開発ガイド
instructions-for-ais:
    - This document should be written in English for AI readability.
    - Content within code fences may be written in languages other than English.
    - Prohibit updating this front-matter.
    - Prohibit updating title line (1st line) in this document.
---

# Development Guide

This document covers local development setup and essential workflow for MUGEN ProtoPedia.

For detailed information on specific topics, see:

- [Logging Policy](./logging.md) - Server/client logging strategy and usage
- [Data Fetching Strategy](./mugen-pp/data-fetching-strategy.md) - Performance and caching details
- [UI Fetch Paths](./mugen-pp/ui-fetch-paths.md) - UI component data flow
- [Dependency Management](./dependency-management.md) - Dependency update policy and constraints

## Requirements

- Node.js 20+
- Package manager: pnpm (recommended), npm, or yarn

## Setup

```bash
# 1) Install deps
pnpm install

# 2) Configure environment
cp .env.example .env.local
# Edit .env.local as needed (see Configuration below)

# 3) Start dev server
pnpm dev
```

Open <http://localhost:3000>.

## Scripts

| Script                             | Purpose                           |
| ---------------------------------- | --------------------------------- |
| `pnpm dev`                         | Start Next.js dev server          |
| `pnpm build`                       | Production build                  |
| `pnpm start`                       | Run built app                     |
| `pnpm test`                        | Run unit tests with Vitest        |
| `pnpm test:watch`                  | Watch mode for tests              |
| `pnpm storybook`                   | Run Storybook locally (port 6006) |
| `pnpm build-storybook`             | Build static Storybook            |
| `pnpm lint` / `pnpm lint:fix`      | Lint codebase (ESLint)            |
| `pnpm format`                      | Format with Prettier              |
| `pnpm tool:save-sample-prototypes` | Save sample data for development  |
| `pnpm generate-pwa-assets`         | Regenerate PWA icons (see below)  |
| `pnpm qa:icons`                    | Validate PWA icons (CI gate)      |
| `pnpm qa:images`                   | Validate images                   |
| `pnpm qa:screenshots`              | Validate screenshots              |

## Configuration (.env)

Adjust values in `.env.local`. For a fully annotated list, see `.env.example`.

| Variable                         | Description                                             |
| -------------------------------- | ------------------------------------------------------- |
| `PROTOPEDIA_API_V2_TOKEN`        | Auth token (optional; improves data surface)            |
| `PROTOPEDIA_API_V2_BASE_URL`     | Override API endpoint                                   |
| `PROTOPEDIA_API_V2_LOG_LEVEL`    | Client library log level (silent/error/warn/info/debug) |
| `PROTOTYPE_PAGE_LIMIT`           | Page size for candidate fetches (default 100)           |
| `LOG_LEVEL` / `LOG_PRETTY`       | Server logging controls (pino)                          |
| `RUN_LIVE_API_TESTS`             | Enables live API tests when `1` and a real token is set |
| `GOOGLE_SITE_VERIFICATION_TOKEN` | Google Search Console verification token                |

See [Logging Policy](./logging.md) for details on logging configuration.

## PWA Icons

App icons are generated with `@vite-pwa/assets-generator` (minimal-2023 preset),
configured in `pwa-assets.config.ts`.

- Regenerate: `pnpm generate-pwa-assets`.
- Source master: `public/icons/icon-1024x1024.png`. It produces six files in
  `public/icons/`: `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`,
  `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico`.
- These filenames are referenced by hand in `app/manifest.ts` and
  `lib/config/metadata.ts`; keep them in sync. `pnpm qa:icons` validates the
  output and runs in CI.
- Do not run `tools/generate-icons.mjs` — it is a deprecated fallback that
  emits the old icon scheme and can overwrite the master image.

## Tech Stack

### Frontend

- Next.js 16 (App Router / Server Functions)
- React 19

### UI

- Tailwind CSS 4.x
- shadcn/ui-based local components (see `components/ui/*`)
- lucide-react icons
- Icons should use either emojis or [Lucide](https://lucide.dev/).

### API Client

- [protopedia-api-v2-client - npm](https://www.npmjs.com/package/protopedia-api-v2-client)

#### ProtoPedia date fields

- Upstream timestamps (`createDate`, `updateDate`, `releaseDate`, etc.) arrive as strings like `2025-11-14 12:03:07.0` with no timezone offset information.
- Treat these values as Japan Standard Time when deriving local dates; the API omits offset markers even though the canonical interpretation is JST.
- Do not assume the strings are safe to parse as UTC. Always supply an explicit `Asia/Tokyo` timezone when normalizing or comparing these fields.

##### `normalizeProtoPediaTimestamp`

- Helper defined in `lib/utils/time.ts`. Input: ProtoPedia timestamp string (with optional fractional seconds or offset hints).
- Output: ISO 8601 string in UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`) when the value can be parsed, otherwise `null`.
- Behavior highlights: - Assumes the upstream string is JST when no offset is provided; applies the `Asia/Tokyo` offset before converting to UTC. - Truncates fractional seconds to millisecond precision and tolerates omission/padding of millisecond digits. - Accepts explicit `+HH:MM` offsets when present, but still returns a UTC ISO string. - Rejects malformed timestamps (non-numeric segments, impossible dates after rollover) by returning `null` so callers can fall back gracefully.
- Usage: `lib/api/prototypes.ts` runs every upstream `createDate`/`updateDate`/`releaseDate` through this helper. When it returns `null`, the code retains the raw upstream string so downstream components can still display the original value if desired.

### Tooling

- TypeScript 5.x
- ESLint (with `eslint-config-next`)
- Storybook 10
- GitHub Actions (CI)

### Logging

- pino (JSON structured logs)
- See [Logging Policy](./logging.md) for usage details

### Testing

- Unit: Vitest
- E2E: Playwright
- Mocking: MSW
- Test data: `@faker-js/faker`

### Runtime

- Node.js 20+

### Hosting / Deployment

- Vercel

## Testing & Quality

- Unit tests: Vitest (`__tests__/*`)
- E2E tests: Playwright
- Mocking: MSW (`mocks/server.ts`, `mocks/handlers.ts`)
    - Snapshots are located in `mocks/snapshots/`.
    - `test/` directory is used for tests (`NODE_ENV=test`).
    - `dev/` directory is used for development.
    - `mocks/snapshots/dev/prototypes.json` is git-ignored to allow using large real-world datasets locally.
    - To customize dev data, copy `mocks/snapshots/dev/prototypes.json.sample` to `mocks/snapshots/dev/prototypes.json` and edit it.
- Visual docs: Storybook (with a11y/docs add-ons)

Recommended loop:

```bash
pnpm lint
pnpm test
pnpm storybook
```

### Live API Tests (optional)

Set these to run the opt-in live test:

```bash
export RUN_LIVE_API_TESTS=1
export PROTOPEDIA_API_V2_TOKEN=your_real_token
pnpm test
```

## Coding Style

- TypeScript with strictness. Prefer clarity to cleverness.
- Destructure imports; use `import type` for pure types.
- Comparison rules:

```ts
// booleans: truthy checks
if (isValid) {
}

// strings/numbers: explicit comparison
if (name !== '') {
}
if (items.length > 0) {
}
```

### Custom hook placement (`hooks/` vs `lib/hooks/`)

Decide by whether the hook **touches the data/domain layer** (API clients,
fetchers, server actions, stores):

- **`lib/hooks/`** — domain/data/feature hooks that wrap the data layer or
  encapsulate reusable feature mechanics (e.g. `use-analysis`,
  `use-prototype-slots`, `use-random-prototype`, the key-sequence hooks).
- **`hooks/`** — app- or browser-environment UI hooks that do _not_ reach the
  data layer (e.g. `use-theme`, `use-direct-launch`). A hook that only
  **consumes** data hooks (without touching the data layer itself) belongs here
  too — composition is an app concern.

When in doubt, ask "does this hook import from the data layer?" Yes →
`lib/hooks/`; no → `hooks/`.

## Contributing

1. Create a feature branch (`feat/your-topic`).
2. Follow Conventional Commits (`feat:`, `fix:`, `docs:`...).
3. Add/update tests/stories when changing behavior/UX.
4. Ensure `pnpm lint && pnpm test` pass before opening a PR.
