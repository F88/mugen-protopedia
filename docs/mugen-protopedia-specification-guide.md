# MUGEN ProtoPedia Specification Guide

Use this guide when you translate a product feature into an engineering specification. Feature briefs live separately (see `docs/mugen-protopedia-feature-guide.md`). Specification docs describe **what must be true** and **how to verify it**, without dictating implementation details.

## When to Create a Spec

Store specs under `docs/specs/<feature-name>-spec.md` (or a similar folder) so they can evolve independently from implementation notes.

Create or update a feature specification when you:

- Introduce a new surface in the dashboard or control panel
- Change data aggregation logic (e.g., newborn/birthday windows, badge counts)
- Add user-visible toggles, filters, sorting rules, or fallback states
- Need to capture timezone, accessibility, or localization rules that affect UX

## Recommended Structure

Each spec should cover the following:

1. **Summary & Feature Link** – Concise statement of scope plus a link to the feature doc.
2. **Acceptance Criteria** – Observable requirements, states, and edge-case handling.
3. **Data Requirements** – Inputs, derived fields, and normalization helpers (reference utilities like `normalizeProtoPediaTimestamp`).
4. **Timezone & Locale Rules** – How “today”, formatting, or locale-sensitive text should behave.
5. **Performance Constraints** – Limits, pagination, caching, or payload considerations.
6. **Testing & Stories** – Which Vitest suites or Storybook stories validate the behavior.
7. **Out of Scope / TBD** – Explicit non-goals or follow-up questions.

## Template Snippet

```markdown
# Specification Name

## Summary

- ...

## Linked Feature Doc

- `docs/features/...`

## Acceptance Criteria

- ...

## Data Requirements

- ...

## Timezone & Locale Rules

- ...

## Performance Constraints

- ...

## Testing & Stories

- ...

## Out of Scope / TBD

- ...
```

## Existing Specs

- `docs/specs/anniversaries.md` – Birthdays & newborn aggregation rules。UI 要件・タイムゾーン方針・クライアント再計算フローをまとめています。
- `docs/specs/data-fetching-strategy.md` – API paging, caching, and measurement guidance.
- `docs/specs/slot-and-scroll-behavior.md` – Slot panel UX and scroll handling.

Add new feature docs to this list when they are created.
