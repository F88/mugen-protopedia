---
title: Display multiple prototypes from Query Params
labels:
  - enhancement
  - ui
---

## Summary
Add a feature to allow displaying multiple prototypes at once by specifying their IDs in the URL query parameters. This enables users to share or bookmark a view showing several prototypes together.

## Background & Goals
- Users want to compare or showcase multiple prototypes in a single view.
- Current implementation only supports single prototype display per page.

## Acceptance Criteria
- When the URL contains multiple prototype IDs in query params (e.g. `?ids=123,456,789`), the app displays all specified prototypes.
- The UI supports a grid or list layout for multiple prototypes.
- Handles invalid or missing IDs gracefully (shows not found or skips).
- Works with direct navigation and sharing/bookmarking.

## Out of Scope
- Advanced filtering, sorting, or grouping.
- Editing prototypes from this view.

## References
- Related: docs/specs/URLから直接起動する機能.md

---
English: Add ability to display multiple prototypes from query params (e.g. `?ids=123,456`).