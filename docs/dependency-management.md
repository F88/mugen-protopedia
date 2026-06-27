---
lang: en
title: Dependency Management
title-en: Dependency Management
title-ja: 依存関係の管理
instructions-for-ais:
    - This document should be written in English for AI readability.
    - Content within code fences may be written in languages other than English.
    - Prohibit updating this front-matter.
    - Prohibit updating title line (1st line) in this document.
---

# Dependency Management

Policy and constraints for updating npm dependencies in this repository.

## Package manager

- **npm.** `package-lock.json` is the committed lockfile and the source of
  truth. CI installs with `npm ci --include=optional`. Use `npm install` /
  `npm ci`; do not introduce a `pnpm-lock.yaml` or `yarn.lock`.
- Node: `engines.node >= 20`.

> Inconsistency to reconcile: `docs/DEVELOPMENT.md` currently states
> "pnpm (recommended)", but the committed lockfile and CI are npm. Treat npm as
> authoritative until this is intentionally changed.

## Update policy

Dependency updates are performed **manually** (Renovate is no longer used; the
stale `renovate.json` and its open PRs can be removed/closed).

Stage changes by risk and verify at each stage before committing:

1. **Patch** — apply together, verify, commit.
2. **Minor** — apply together, verify, commit. Watch:
    - `prettier` — bump separately; a reformat can produce a large, unrelated diff.
    - `tailwindcss` / `@tailwindcss/oxide` — CSS output can shift; check visually.
    - Storybook packages — bump as a set.
    - `vitest` + `@vitest/coverage-v8` — bump together.
3. **Major** — one dependency per branch/PR, with dedicated testing. Never batch majors.

### Verification (run after each stage)

```bash
npm install        # sync package-lock.json
npm run lint
npm run test
npm run qa:icons
npm run build
npm run build-storybook   # when Storybook packages changed
```

## Pinned / constrained dependencies

- **`next`** is pinned to an exact version (no `^`) on purpose. Upgrade it
  deliberately in its own PR; do not let it float with blanket updates.

## Handle with extra care (high blast radius)

- **`protopedia-api-v2-client`** — the core ProtoPedia data client; major
  versions are breaking and can affect all data fetching.
- **`sharp`** — used by PWA icon generation (`npm run generate-pwa-assets`) and
  the image-QA tool. Re-run `npm run qa:icons` (and regenerate icons if needed)
  after bumping.
- **`tailwindcss` / `@tailwindcss/oxide`** — drive CSS output; oxide is disabled
  in `build`/`test` via `TAILWIND_DISABLE_OXIDE`. Verify the UI visually.
- **`glob`** — used by the image-QA tool (`tools/image-qa`).
- **`eslint` / `typescript`** — major bumps can surface new lint/type errors.
