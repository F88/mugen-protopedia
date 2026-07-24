---
name: inspect-protopedia-with-ppv-cli
description: >
  Inspect real ProtoPedia prototype data locally from a PROMIDAS snapshot via
  the ppv-cli command (npm: ppv26-cli), instead of calling the ProtoPedia API
  directly or writing throwaway fetch code. Use this whenever an investigation
  needs actual data values: a specific work's releaseDate / tags / users /
  status, the most recently released works, works matching a tag / user /
  event / material, dataset counts, or verifying assumptions about what the
  API returns (e.g. timestamp or timezone questions). Reach for it even when
  the user doesn't name ppv-cli — any "check the real data for prototype X" /
  "what was just published?" / "how many works have tag Y?" task qualifies.
  Constraint: this skill is specifically the ppv26-cli-based method — it
  only works where ppv-cli is installed (check with `which ppv-cli`); if
  absent, say so and fall back to normal methods.
---

# Inspect ProtoPedia data locally (ppv-cli)

`ppv-cli` is a one-shot CLI for inspecting ProtoPedia API data offline from
local PROMIDAS snapshots: fast data investigation without hitting the
ProtoPedia API, without an API token round-trip, and without writing ad-hoc
fetch scripts. The trade-off is that you read a point-in-time snapshot, not
live data — see the freshness rules below.

**Scope**: this skill documents the ppv26-cli-based method specifically.
There are several valid ways to investigate ProtoPedia data (reading data
files directly, the promidas library, the API, the app code) — do not
conclude that ppv26-cli is the only one. Use this skill when the ppv-cli
route fits; pick another method when it fits the question better.

**Hard rule: NEVER create snapshots automatically.** Do not run
`ppv-cli snapshot create` (or any other snapshot-creating/mutating command)
from this skill, ever. Frequent snapshot creation causes real problems:

- every run writes a new snapshot file, so they pile up and eat disk space;
- each refresh re-fetches the entire dataset, putting needless load on the
  ProtoPedia API;
- and similar operational issues — which is why the snapshot lifecycle
  belongs to the user, not to this skill.

This holds even when the instruction explicitly says to refresh first
(e.g. "スナップショットを最新に更新してから〜"): reply that snapshot updates
are forbidden for the skill and the user must run them ("snapshots の更新は
skill では禁止されています。User 自身が実行して下さい。"), then answer as
best you can from the existing snapshot, stating its age. **Prompting the
user to refresh is fine** when the snapshot looks too old for the question
— just never do it yourself.

## Availability check (do this first)

This skill is, by definition, the investigation method that uses ppv26-cli
— that scoping matters. It only applies where the CLI is installed:

```bash
which ppv-cli
```

If it is not installed, tell the user ppv-cli is unavailable in this
environment and continue with normal methods outside this skill (promidas
library, reading data files directly, app code, or asking the user). Do not
try to install it yourself.

## What the data is (interpretation rules)

- The snapshot is produced by PROMIDAS, so all prototypes are already
  **normalized**: timestamps (`createDate` / `updateDate` / `releaseDate`)
  are **UTC ISO strings** (`...Z`) — the same shape the mugen-protopedia app
  sees at runtime. ProtoPedia's original timestamps are JST; PROMIDAS has
  already subtracted the +9 h offset.
- When reporting times to the user, convert to JST (UTC+9) unless asked
  otherwise — e.g. `2026-07-24T06:01:07Z` is `2026-07-24 15:01 JST`.
- The dataset contains only publicly released works (`releaseFlg=2`,
  `licenseType=1`). `status` is a work-state (idea/developing/completed/
  memorial), NOT a release state — do not filter by it to find "published"
  works; everything in the snapshot is published.
- **Freshness**: data comes from a cached snapshot (stored in
  `~/.ppv-cli/snapshots/`). Every command prints the loaded snapshot's
  summary to stderr, e.g.:

  ```text
  [info] 6511件, 取得時刻: 2026-07-24 15:02:53 (約0.5時間前)
  ```

  Check this line (run once without discarding stderr) to know when the
  loaded snapshot was generated. **Prefer the snapshot even when it is old**
  — most questions (a work's releaseDate, tags, counts, historical facts)
  are not affected by staleness, so just answer from it. Snapshot age only
  matters for "latest info" questions ("what was just published?"); there,
  state the age alongside the answer, and if it is too old, do NOT refresh
  yourself (see the hard rule above) — tell the user and let them decide.

## Commands

Logs go to **stderr**, data to **stdout** — append `2>/dev/null` (or
`--quiet`) when piping.

| Command | Output (stdout) |
|---|---|
| `ppv-cli prototype show <id>` | full prototype as JSON |
| `ppv-cli prototype list --all \| --first <n> \| --last <n>` | TSV: id, name, users (ID ascending) |
| `ppv-cli prototype search [keywords...] [filters]` | TSV: id, name, users |
| `ppv-cli data stats` | store stats for the loaded snapshot |
| `ppv-cli data analyze` | PROMIDAS `analyzePrototypes()` over the snapshot |
| `ppv-cli snapshot list` | list saved snapshot files (read-only; never `snapshot create`) |

Search semantics: positional keywords are ANDed against name/summary.
Filter options are repeatable and ORed within the same option: `--id`
(exact), `--tag`, `--user`, `--event`, `--material` (partial match),
`--status <code>` (exact). All commands accept `--snapshot <file>` to pin a
specific snapshot (default: latest).

## Recipes

```bash
# One work's release timestamp (UTC ISO; convert to JST when reporting)
ppv-cli prototype show 9062 2>/dev/null | jq '{id, prototypeNm, releaseDate, status}'

# The n most recently registered works (highest IDs)
ppv-cli prototype list --last 5 2>/dev/null

# Count works with a tag / by a user / for an event
ppv-cli prototype search --tag M5Stack 2>/dev/null | wc -l

# Full JSON for each search hit (IDs from column 1) — fine for a few IDs
ppv-cli prototype search --event ヒーローズリーグ 2>/dev/null | cut -f1 \
  | while read -r id; do ppv-cli prototype show "$id" 2>/dev/null; done | jq -s .
```

Load note: every ppv-cli invocation loads and validates the whole snapshot
(~20 MB), so avoid `show`-per-ID loops over many IDs — prefer one `search`
/ `list` call and only `show` the handful of IDs you actually need.

Note: high IDs mean recently *registered*, not necessarily recently
*released* — `releaseDate` is the publication time, so for "released in the
last N hours" questions, check `releaseDate` of the recent-ID works (or
search and inspect), don't assume ID order alone is enough.

## When NOT to rely on it

- The question needs data fresher than the loaded snapshot — never refresh
  yourself; state the snapshot age and ask the user whether to refresh.
- The question is about how the *app* transforms data (caching, analysis
  builders, display) — read the app code for that; use ppv-cli only to
  verify the raw input side.
