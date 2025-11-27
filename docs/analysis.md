---
lang: en
title: Analysis Specification
title-en: Analysis Specification
title-ja: 分析仕様
related:
    - docs/*
instructions-for-ais:
    - This document should be written in English for AI readability.
    - Content within code fences may be written in languages other than English.
    - Prohibit updating this front-matter.
    - Prohibit updating title line (1st line) in this document.
---

# Analysis Specification

This document captures the end-to-end specification for the prototype analysis
pipeline. It explains the data sources, the metrics we calculate on the server,
what is cached, and which pieces the UI is expected to recompute in the user's
timezone. It also consolidates the previously standalone anniversary rules.

> **Timezone responsibility (non-negotiable):** Any calculation whose result
> depends on the execution environment's timezone (e.g., "is today a birthday?",
> age badges, "published today" checks) **must be performed on the UI**. The
> server emits UTC-normalized timestamps and bulk analysis for every
> timezone-agnostic metric; the browser then handles client-specific checks as
> needed. **Do not add new timezone-sensitive metrics to the server path.** This
> separation prevents drift when the UI runs in a different locale than the
> server and is a hard requirement for release.

```text
    /!\  TZ ALERT  /!\
 <---------------------------------------------->
 |  原則としてUI以外で「今日」を判定するな! (例外あり)  |
 <---------------------------------------------->
    \!/            \!/
```

> **UIで必ず再計算:** 誕生日や新生児の判定をサーバーに足したくなったら、まず深呼吸して UI での再計算経路を確認すること。サーバーでの一時的な暫定対応を入れる場合でも、最終表示は必ずクライアントTZで検証する。

## Goals

- Provide a deterministic, UTC-normalized analysis payload that can be cached on
  the server and streamed to multiple UI surfaces.
- Keep the payload lean by excluding fields that are not required for
  presentation or client-side timezone corrections (target size: a few MB).
- Clearly document which metrics depend on `releaseDate`/`createDate` and may
  need client recomputation.

## Screen Outputs (Current UI)

The Analysis Dashboard consumes the analysis payload and renders the following
sections. Each item notes whether the value is taken directly from the server
payload or recomputed on the client when timezone fidelity is requested, and
where the final value is generated.

| UI Region               | Data Shown                                                                                                                    | Source                                                                             | Generated Where                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Summary Bar**         | Total prototypes, prototypes with awards, birthday count, newborn count                                                       | `totalCount`, `prototypesWithAwards`, `anniversaries.{birthdayCount,newbornCount}` | Server, except birthday/newborn counts which switch to client when `preferClientTimezoneAnniversaries` is true |
| **Stat Grid**           | Total prototypes, prototypes with awards (+percentage), average age in days (and approx years), number of top tags categories | `totalCount`, `prototypesWithAwards`, `averageAgeInDays`, `topTags.length`         | Server                                                                                                         |
| **Birthday Section**    | Up to 5 birthday prototypes with ID, title, 🎂 age badge                                                                      | `anniversaries.birthdayPrototypes`                                                 | Client handles final filtering/age badge when TZ override enabled; otherwise server snapshot                   |
| **Newborn Section**     | All newborn prototypes with ID, title, localized publish time                                                                 | `anniversaries.newbornPrototypes`                                                  | Client recomputes when TZ override enabled; otherwise server snapshot                                          |
| **Status Distribution** | Cards grouped by status code with counts                                                                                      | `statusDistribution`                                                               | Server                                                                                                         |
| **Popular Tags**        | Up to 6 top tags with counts                                                                                                  | `topTags`                                                                          | Server                                                                                                         |
| **Active Teams**        | Up to 6 teams with counts (hidden when no teams)                                                                              | `topTeams`                                                                         | Server                                                                                                         |

Any future UI module that relies on analysis data must be documented here with
its required fields so that payload pruning can be evaluated.

## Data Flow Overview

1. `app/actions/prototypes.ts` fetches up to 10,000 prototypes and normalizes
   them via `normalizePrototype` (dates become ISO UTC strings).
2. `analyzePrototypes` in `lib/utils/prototype-analysis.ts` consumes the
   normalized array and returns a `PrototypeAnalysis` object.
3. The result is stored in `analysisCache` alongside metadata
   (`limit`,`offset`,`totalCount`).
4. `components/analysis-dashboard.tsx` (and related hooks) render the cached
   snapshot. Optional client recomputation only reprocesses the lightweight
   subset needed for timezone-aware anniversaries.

## Output Schema (Server)

`PrototypeAnalysis` contains the following top-level fields. All dates are ISO
8601 UTC strings.

- `totalCount`: total prototypes analyzed.
- `statusDistribution`: map of status code to count.
- `prototypesWithAwards`: count of entries whose `awards[].length > 0`.
- `topTags`: top 10 `{ tag, count }` pairs.
- `averageAgeInDays`: mean days since `releaseDate`.
- `yearDistribution`: `{ [year]: count }` derived from `releaseDate`.
- `topTeams`: top 10 `{ team, count }` entries using `teamNm`.
- `anniversaries`: birthday/newborn slices (detailed later).
- `anniversaryCandidates` (optional): UTC helper windows for client TZ reruns.
- `tzContext`: execution timezone diagnostics (`runtime`, IANA tz, offset).
- `analyzedAt`: ISO timestamp indicating when the snapshot was produced.

### Payload Minimization Strategy

- We do **not** send the full upstream prototype list to the UI. Only summary
  metrics and the arrays required for anniversary displays are included.
- If the UI needs timezone-sensitive checks (birthday/newborn), it relies on
  `anniversaryCandidates` plus the reduced per-prototype arrays rather than the
  entire dataset.
- Any future client-only metric must explicitly document the minimal fields it
  needs so the server payload stays compact.

## Metrics That Use Date/Time Information

| Metric                                        | Source Field  | Notes                                    |
| --------------------------------------------- | ------------- | ---------------------------------------- |
| `averageAgeInDays`                            | `releaseDate` | Computed in UTC on the server.           |
| `yearDistribution`                            | `releaseDate` | UTC year bucket; unaffected by TZ.       |
| `anniversaries`                               | `releaseDate` | Candidate for client TZ recomputation.   |
| `anniversaryCandidates.newborn.windowUTC`     | `releaseDate` | Provides UTC window for local filtering. |
| `anniversaryCandidates.birthday.monthDaysUTC` | `releaseDate` | List of UTC MM-DD strings to avoid gaps. |
| `datasetMin/datasetMax` (logs only)           | `releaseDate` | Debug info, not sent to UI.              |

All other metrics (status, tags, teams, awards) are timezone-agnostic.

## Client Timezone Recalculation

- Flag: `preferClientTimezoneAnniversaries` on `AnalysisDashboard`.
- Hook: `useClientAnniversaries` downloads the canonical snapshot (still only a
  few MB) and re-runs `analyzePrototypes` in the browser so “today” matches the
  user's IANA timezone.
- Fallback: the UI keeps rendering server data until the client rerun finishes
  or if it errors out.

---

## Anniversary Detection (Birthdays & Newborns)

This section specifies how “anniversaries” are detected and displayed in the
app:

- Birthdays (prototypes whose birthday is today)
- Newborns (prototypes published today)

The goal is to reflect the user’s local timezone as faithfully as possible
while keeping the system robust against upstream time drift and boundary
conditions.

## Terminology

- `releaseDate`: ISO 8601 string supplied by ProtoPedia for a prototype’s publication time.
- “Birthday”: The calendar day (month/day) of `releaseDate` matches “today”.
- “Newborn”: `releaseDate` occurs on “today”.

### “Today” Semantics and Timezones

There are two layers that influence how “today” is determined:

1. Server-side analysis (default path)

- Utilities: `isBirthDay(releaseDate)`, `isToday(releaseDate)` in `lib/utils/anniversary-nerd.ts`.
- Birthday detection is intended to align with the user’s local timezone.
- `isToday` now matches **only** on the local-calendar date. The UTC fallback was removed because it misclassified “yesterday” releases (e.g., prototype #7840 on 2025-11-15 JST) as newborns for users in UTC+ offsets. The server already ships a ±1 day candidate window, so relying on the user’s timezone is safe.

1. Client-side recomputation (optional, recommended when TZ fidelity matters)

- Hook: `useClientAnniversaries()` in `lib/hooks/use-client-anniversaries.ts`.
- Flag: `preferClientTimezoneAnniversaries` on `AnalysisDashboard`.
- Behavior: Fetches a snapshot (up to 10,000 items) in the browser and runs `analyzePrototypes` locally so that birthday/newborn checks follow the end-user’s actual local timezone at render time.
- Fallback: If the client recomputation is still loading or fails, the UI silently falls back to the server-provided analysis to keep the dashboard responsive.

#### Rationale

- Local TZ for birthdays makes the displayed age feel correct to the user (“turning N today”).
- Newborns should feel “today” in the user’s locale. The server’s ±1 day candidate window guarantees that client-side local comparisons still catch releases near UTC boundaries without needing UTC fallbacks.

### Display Specification

These rules are enforced by `components/analysis-dashboard.tsx`.

#### Birthdays

- Sorting: by `releaseDate` ascending (oldest first), tie-breaker by `id` ascending.
- Limit: show up to 5 items; if there are more, display a trailing `+X more prototypes`.
- Each row: `ID`, `Title`, and age badge. The age badge is recalculated at render using `calculateAge(releaseDate)` to match the user’s local timezone.
- Empty state: “No birthdays today”. The section is always rendered (visible even when empty).

#### Newborns

- Membership: `isToday(releaseDate)` where “today” is determined solely by the user’s local timezone.
- Sorting: by `releaseDate` descending (most recent first).
- Limit: list all newborns for the day (no truncation/pagination).
- Each row: `ID`, `Title`, a “NEW” badge (styling), and published time in Japanese locale with seconds (`ja-JP`, `HH:MM:SS`).
- Empty state: “No newborns today”. The section is always rendered.

### Types & Fields

The analysis object contains an `anniversaries` slice:

```ts
type PrototypeAnalysis = {
    anniversaries: {
        birthdayCount: number;
        birthdayPrototypes: Array<{
            id: number;
            title: string;
            years: number;
            releaseDate: string;
        }>;
        newbornCount: number;
        newbornPrototypes: Array<{
            id: number;
            title: string;
            releaseDate: string;
        }>;
    };
    // ...other fields omitted
};
```

`birthdayPrototypes.years` is produced by `calculateAge(releaseDate)`. In the UI, the displayed age is computed at render to ensure local TZ correctness even if the server computed a different value.

### Edge Cases

- Leap Day (Feb 29): A prototype released on Feb 29 is considered a “birthday” on Feb 29 in leap years. In non-leap years, the library treats birthday detection strictly by the calendar day; if special handling is required (e.g., observe on Feb 28), implement it in `isBirthDay` and document it here.
- Near Midnight: Server-provided anniversary candidates always span yesterday/today/tomorrow in UTC, so the client can rely purely on local `isToday` / `isBirthDay` checks without flicker.

### Performance Considerations

- Client recomputation may download a large payload (up to 10,000 items). Enable `preferClientTimezoneAnniversaries` only on screens where TZ-accurate anniversaries are critical.
- Server-side analysis remains the default for efficiency. The UI seamlessly falls back to server results while the client computation warms up.

### Testing & Storybook

- Unit tests validate “today” detection across local and UTC boundaries.
- Storybook stories cover: multiple birthdays, multiple newborns, both empty, and minimal datasets. Randomized within-day times are used to resemble production data.

### How to Enable Client TZ Recalculation

```tsx
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import { useLatestAnalysis } from '@/lib/hooks/use-analysis';

export function Page() {
    return (
        <AnalysisDashboard
            useLatestAnalysisHook={useLatestAnalysis}
            preferClientTimezoneAnniversaries
        />
    );
}
```

That’s it — the dashboard will recompute the anniversaries slice on the client and use it as soon as it’s ready.
