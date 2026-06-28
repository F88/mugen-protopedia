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

## Pinned dependencies

These dependencies are pinned to an **exact** version (no `^`/`~` in
`package.json`) so they never move during routine `ncu` batches. Enforce the
pins while updating with `ncu --reject <name>`, and record every pin here **with
its reason**. The exact version itself lives in `package.json`.

### `next` — pinned exact

Reason: Next.js major upgrades are real migrations, not routine bumps. Going
from 15 to 16, for example, makes Turbopack the default build, removes
synchronous Request APIs, changes caching semantics, raises the minimum Node to
20.9, and can change metadata/`<head>` injection (related to issue #141). A
floating range could pull a major in via a blanket update and silently break the
build or the framework, so Next is upgraded deliberately in its own PR with full
verification — never via a patch/minor batch.

## ESLint v10 and eslint-config-next

ESLint 10 works in this repo, but **only with a workaround**, because
`eslint-config-next` (latest `16.2.9`) bundles plugins that have not yet declared
ESLint 10 support:

- **`eslint-plugin-react`** (`7.37.5`) — the real blocker. It auto-detects the
  React version via `context.getFilename()`, which ESLint 10 removed, so loading
  any of its rules throws `TypeError: contextOrFilename.getFilename is not a function`.
  Its last release was 2025-04 (14+ months); the v10 fix is tracked upstream
  in [eslint-plugin-react#3977](https://github.com/jsx-eslint/eslint-plugin-react/issues/3977)
  (open, no release yet). Vercel closed the dedicated request
  [next.js#91702](https://github.com/vercel/next.js/issues/91702) as a duplicate
  and defers ESLint 10 support to these upstream plugins.
- **`eslint-plugin-import` / `eslint-plugin-jsx-a11y`** — their `peerDependencies`
  cap at `eslint ^9`, but they do **not** crash at runtime on ESLint 10 (verified:
  lint runs to completion). Stale peer ranges only, not a real block.

Everything else we use already supports ESLint 10: `eslint-config-prettier`
(`>=7`), `eslint-plugin-storybook` (`>=8`), `typescript-eslint` (`^10`),
`eslint-plugin-react-hooks` (`^10`).

**Workaround** — pin the React version in `eslint.config.mjs` so
`eslint-plugin-react` skips the auto-detection path that calls `getFilename()`:

```js
{
    settings: {
        react: {
            version: '19.2.7';
        }
    }
}
```

Remove this once `eslint-config-next` ships ESLint-10-compatible plugins.

Note: ESLint 10 pulls `eslint-plugin-react-hooks` `7.1.x`, which adds the
`react-hooks/set-state-in-effect` rule. That surfaces new lint errors that
ESLint 9 (with `7.0.x`) did not report; they are real findings to fix, not part
of the compatibility block.

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
