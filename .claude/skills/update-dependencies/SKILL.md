---
name: update-dependencies
description: >-
  Update npm dependencies in this repository following its staged, manual update
  policy. Use this whenever the user wants to update, upgrade, bump, or audit npm
  packages / dependencies — e.g. "update deps", "run npm-check-updates", "bump the
  patch versions", "upgrade <package> to the latest", or after a vulnerability
  alert. This repo uses npm (not pnpm/yarn), updates are manual (Renovate is
  retired), and there are real constraints (next is exact-pinned, several
  high-blast-radius packages) — so always use this skill rather than blindly
  running `ncu -u` / `npm update`, which can break CI or the framework.
---

# Update Dependencies

Carefully update npm dependencies in this repo. The goal is small, verifiable,
reversible steps — not a single mass bump that's impossible to debug when
something breaks.

The authoritative policy lives in `docs/dependency-management.md` (repo root).
Read it if anything here is ambiguous; this skill is the actionable workflow.

## Ground rules

- **Package manager is npm.** `package-lock.json` is the committed lockfile and
  CI runs `npm ci --include=optional`. Use `npm install` / `npm ci`. Never create
  a `pnpm-lock.yaml` or `yarn.lock`, and never delete `package-lock.json` — doing
  so breaks CI. (Note: `docs/DEVELOPMENT.md` says "pnpm recommended"; that is an
  unreconciled doc inconsistency — npm is what actually ships.)
- **Work on a dedicated branch**, e.g. `chore/update-deps-YYYYMMDD`. If on `main`,
  create the branch first.
- **Conventional Commits**: `chore(deps): ...` (or `fix(deps): ...` for security).

## Workflow: stage by risk

Inspect what's available first:

```bash
npx npm-check-updates --format group
```

This groups updates into Patch / Minor / Major. Update in that order, verifying
and committing after each stage so a failure is easy to bisect.

### 1. Patch (backwards-compatible fixes) — batch

```bash
npx npm-check-updates -u --target patch --reject next
npm install
```

Run the [verification suite](#verification). Commit: `chore(deps): update patch versions`.

### 2. Minor (backwards-compatible features) — batch, with a few exceptions

```bash
npx npm-check-updates -u --target minor --reject next
npm install
```

Watch these within the minor batch (they have wider surface area):

- **`prettier`** — bump it in its own commit. A formatter bump can reformat the
  whole tree and bury the real diff. If `prettier` changed, run `npm run format`
  and commit the reformat separately.
- **`tailwindcss` / `@tailwindcss/oxide`** — CSS output can shift between minors.
  Check the UI visually (build / storybook), not just that it compiles.
- **Storybook packages** (`@storybook/*`, `storybook`, `eslint-plugin-storybook`)
  — bump as a set; mismatched Storybook versions break.
- **`vitest` + `@vitest/coverage-v8`** — bump together; they must match.

Run the verification suite. Commit: `chore(deps): update minor versions`.

### 3. Major (potentially breaking) — one at a time, never batched

Do each major in its **own branch/PR** with the changelog read and dedicated
testing. Do not include majors in the patch/minor commits above.

## Constraints (do not violate)

- **`next` is exact-pinned** (no `^` in package.json) on purpose. Do not let it
  float with `ncu`. Upgrade Next deliberately, in its own PR, with full testing.
  (A Next major can change metadata/`<head>` behavior, so treat it as a project.)
- **High-blast-radius packages — extra care, prefer their own PR:**
  - `protopedia-api-v2-client` — the core ProtoPedia data client; majors are
    breaking and affect all data fetching.
  - `sharp` — used by PWA icon generation (`npm run generate-pwa-assets`) and the
    image-QA tool. After bumping, re-run `npm run qa:icons` (regenerate icons if
    the output changed).
  - `tailwindcss` / `@tailwindcss/oxide` — drive CSS; oxide is disabled in
    `build`/`test` via `TAILWIND_DISABLE_OXIDE`. Verify the UI.
  - `glob` — used by the image-QA tool (`tools/image-qa`).
  - `eslint` / `typescript` — majors surface new lint/type errors.

## Verification

Run after every stage; everything must be green before committing:

```bash
npm install            # ensure package-lock.json is in sync
npm run lint
npm run test
npm run qa:icons
npm run build
npm run build-storybook   # only if Storybook packages changed
```

If a step fails, isolate the offending package (revert it from this stage and
move it to its own branch) rather than forcing the whole batch through.

## Finishing

- Push the branch and open a PR per stage/major as appropriate.
- If CI fails on something unrelated and network-flaky (e.g. a build-time fetch
  timeout), re-run the job before assuming the bump caused it.
