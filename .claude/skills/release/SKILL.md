---
name: release
description: >-
    Cut a versioned release of this repo (mugen-protopedia): bump the version,
    roll the CHANGELOG, commit, tag, and publish a GitHub Release. Use this
    whenever the user asks to "bump ver", "bump the version", "cut a release",
    "make a release", "tag a release", or "release <date>". The project uses a
    non-standard zero-padded CalVer scheme and a manual (non-`npm version`) bump
    that is easy to get wrong, and every outward git step (commit to main, tag,
    push, GitHub Release) must be confirmed with the user first.
---

# Release (version bump)

This project ships by cutting a dated release on `main`. It is never
`npm publish`ed, so the usual semver tooling does not apply — follow the manual
steps below exactly.

## Versioning scheme

- **CalVer with zero-padded month/day**, e.g. `2026.07.03` (today's date, JST).
- The zero-padded form (`07`, `03`) is **not valid semver**, and that is fine:
  the app is never published, versions are bumped by hand, and
  `npm install` / Next / Vercel do not validate the root version string. Keep
  `package.json` identical to the tag — do NOT drop the zero padding.
- `package.json` `version`, the git tag, and the CHANGELOG header all use the
  same CalVer string.

## Before you start

- Decide the CalVer from today's date (the environment's current date, JST).
- Confirm the previous release: `git tag --sort=-creatordate | head` and the
  latest `chore(release):` commit, so the version increments sensibly and you
  have `<prev>` for the compare link.
- Make sure the changes to be released are already on `main`, and that
  `## [Unreleased]` in `CHANGELOG.md` holds the accumulated notes.

## Steps

1. **Bump `package.json` `version`** to the CalVer string — edit the file by
   hand. **Do NOT run `npm version`** (it rejects the zero-padded value and
   creates its own commit/tag).
2. **Bump `package-lock.json`** to match — update the root `"version"` and the
   root package entry `packages[""]."version"` (both near the top of the file).
3. **Roll the CHANGELOG.** Insert a new `## [<CalVer>]` header immediately below
   `## [Unreleased]`, so the accumulated Unreleased entries become that release.
   Leave `## [Unreleased]` in place (now empty) for the next cycle. `CHANGELOG.md`
   is the full technical log — see `readme-changelog-vs-changelog-md` for what
   belongs here vs the README's feature-highlights changelog.
4. **Confirm with the user, then commit** as `chore(release): <CalVer>` directly
   on `main`.
5. **Create an annotated tag** named `<CalVer>` (no `v` prefix) on that commit,
   tagger `F88`: `git tag -a <CalVer> -m "<CalVer>"`.
6. **Push** the commit and the tag to origin (confirm first).
7. **Create the GitHub Release** on that tag, marked `--latest`. `CHANGELOG.md`
   is the source of truth, so do not re-list every change — but a bare pointer is
   too little. Write a short `## Highlights` list of the headline changes, with
   **major framework upgrades (e.g. Next.js 15 → 16) called out as their own bold
   top bullet**, then:
   - `See [CHANGELOG.md](https://github.com/F88/mugen-protopedia/blob/<CalVer>/CHANGELOG.md#<anchor>) for the full list.`
     — the anchor for `## [2026.07.03]` is `#20260703` (brackets and dots
     stripped).
   - `**Full Changelog**: https://github.com/F88/mugen-protopedia/compare/<prev>...<CalVer>`

## Guardrails (do not skip)

- **Confirm before every outward git step** — committing to `main`, tagging,
  pushing, and creating the GitHub Release. The user gates these operations.
- **Never merge PRs** on the user's behalf.
- Half-width characters only in all edited files (project rule).
- Keep the version string identical across `package.json`, `package-lock.json`,
  the tag, and the CHANGELOG header.
