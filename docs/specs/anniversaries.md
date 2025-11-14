# Anniversary Detection (Birthdays & Newborns)

This document specifies how “anniversaries” are detected and displayed in the app:

- Birthdays (prototypes whose birthday is today)
- Newborns (prototypes published today)

The goal is to reflect the user’s local timezone as faithfully as possible while keeping the system robust against upstream time drift and boundary conditions.

## Terminology

- `releaseDate`: ISO 8601 string supplied by ProtoPedia for a prototype’s publication time.
- “Birthday”: The calendar day (month/day) of `releaseDate` matches “today”.
- “Newborn”: `releaseDate` occurs on “today”.

## “Today” Semantics and Timezones

There are two layers that influence how “today” is determined:

1. Server-side analysis (default path)

- Utilities: `isBirthDay(releaseDate)`, `isToday(releaseDate)` in `lib/utils/anniversary-nerd.ts`.
- Birthday detection is intended to align with the user’s local timezone.
- To satisfy mixed environments (e.g., UTC-bound data, local rendering, and tests), `isToday` returns true when either the local-calendar date OR the UTC date of `releaseDate` equals “today”. This inclusive rule avoids off-by-one misses near midnight and when upstream timestamps are normalized in a different zone.

1. Client-side recomputation (optional, recommended when TZ fidelity matters)

- Hook: `useClientAnniversaries()` in `lib/hooks/use-client-anniversaries.ts`.
- Flag: `preferClientTimezoneAnniversaries` on `AnalysisDashboard`.
- Behavior: Fetches a snapshot (up to 10,000 items) in the browser and runs `analyzePrototypes` locally so that birthday/newborn checks follow the end-user’s actual local timezone at render time.
- Fallback: If the client recomputation is still loading or fails, the UI silently falls back to the server-provided analysis to keep the dashboard responsive.

### Rationale

- Local TZ for birthdays makes the displayed age feel correct to the user (“turning N today”).
- Newborns should feel “today” even when upstream timing and client TZ straddle a boundary. The inclusive local-or-UTC check reduces surprising empty states around midnight.

## Display Specification

These rules are enforced by `components/analysis-dashboard.tsx`.

### Birthdays

- Sorting: by `releaseDate` ascending (oldest first), tie-breaker by `id` ascending.
- Limit: show up to 5 items; if there are more, display a trailing `+X more prototypes`.
- Each row: `ID`, `Title`, and age badge. The age badge is recalculated at render using `calculateAge(releaseDate)` to match the user’s local timezone.
- Empty state: “No birthdays today”. The section is always rendered (visible even when empty).

### Newborns

- Membership: `isToday(releaseDate)` where “today” is inclusive (local OR UTC) on the default path.
- Sorting: by `releaseDate` descending (most recent first).
- Limit: list all newborns for the day (no truncation/pagination).
- Each row: `ID`, `Title`, a “NEW” badge (styling), and published time in Japanese locale with seconds (`ja-JP`, `HH:MM:SS`).
- Empty state: “No newborns today”. The section is always rendered.

## Types & Fields

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

## Edge Cases

- Leap Day (Feb 29): A prototype released on Feb 29 is considered a “birthday” on Feb 29 in leap years. In non-leap years, the library treats birthday detection strictly by the calendar day; if special handling is required (e.g., observe on Feb 28), implement it in `isBirthDay` and document it here.
- Near Midnight: The inclusive `isToday` logic reduces flicker around 00:00 across timezones. If your product policy changes, adjust tests and utilities together.

## Performance Considerations

- Client recomputation may download a large payload (up to 10,000 items). Enable `preferClientTimezoneAnniversaries` only on screens where TZ-accurate anniversaries are critical.
- Server-side analysis remains the default for efficiency. The UI seamlessly falls back to server results while the client computation warms up.

## Testing & Storybook

- Unit tests validate “today” detection across local and UTC boundaries.
- Storybook stories cover: multiple birthdays, multiple newborns, both empty, and minimal datasets. Randomized within-day times are used to resemble production data.

## How to Enable Client TZ Recalculation

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
