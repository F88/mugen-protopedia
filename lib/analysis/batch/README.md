# Batch Analysis Modules

This directory hosts batch-oriented analysis helpers grouped by concern. Each file
performs a single pass over `PrototypeForMpp[]` inputs and exposes a documented
entrypoint for consumers. For a product-level overview of how these metrics surface
in the UI, refer to `docs/analysis.md`.

- `build-advanced-analysis.ts`: Story-driven metrics (First Penguins, Star Alignments, etc.).
- `build-time-distributions.ts`: Maker's Rhythm time/date distributions (JST-aligned buckets).
- `build-tag-analytics.ts`: Tag rankings & counts.
- `build-material-analytics.ts`: Material rankings & counts.
- `build-material-insights.ts`: Material-centric Observatory insights for The Alchemist's Table (Kitchen Sink, Primordial, Rising Vapors, Newfound, Lost Technology, The Monumental Elements).
- `build-user-team-analytics.ts`: Team rankings & user-analytics placeholder.
- `build-core-summaries.ts`: Status, awards, and average-age summaries.
- `collect-unique-release-dates.ts`: Date-keyed utilities (unique create/update/release days etc.).
- `index.ts`: Aggregate exports for the batch helpers.

| Module                            | Performs Full Scan? | Primary Inputs                                              | Primary Outputs                                                      |
| --------------------------------- | ------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| `build-advanced-analysis.ts`      | true                | `PrototypeForMpp[]`, top tag summary                        | Story-driven metrics (`AdvancedAnalysis`)                            |
| `build-time-distributions.ts`     | true                | `PrototypeForMpp[]`                                         | Maker's Rhythm time/date distributions (`TimeDistributions`)         |
| `build-tag-analytics.ts`          | true                | `PrototypeForMpp[]`                                         | Tag rankings & counts (`TagAnalytics`)                               |
| `build-material-analytics.ts`     | true                | `PrototypeForMpp[]`                                         | Material rankings & counts (`MaterialAnalytics`)                     |
| `build-material-insights.ts`      | true                | `PrototypeForMpp[]`, optional logger                        | The Alchemist's Table material insight sections (`MaterialInsights`) |
| `build-user-team-analytics.ts`    | true                | `PrototypeForMpp[]`                                         | Team rankings & user-analytics placeholder (`UserTeamAnalytics`)     |
| `build-core-summaries.ts`         | true                | `PrototypeForMpp[]`, optional reference date                | Status, awards, average age (`CoreSummaries`)                        |
| `collect-unique-release-dates.ts` | true                | `PrototypeForMpp[]` (for `buildDateBasedPrototypeInsights`) | Date-keyed insights (`DateBasedPrototypeInsights`)                   |

## Full Dataset Scans

Multiple passes over the entire prototype dataset are acceptable. We prioritize
maintenance, readability, and ease of testing for each batch module. Optimize
only when profiling or real-world usage shows a pressing need.

## Batch Classification vs Feature Pages

Feature-page concepts (Hello World, Memorial Park, Sci-Fi Lab, Explorer's Guild)
serve as storytelling lenses for delivering analysis results. Batch modules,
however, should be grouped by data shape and shared processing needs rather than
by narrative theme. Design batches around input structure and analysis targets;
map their outputs to feature pages later in the presentation layer.

## Guidelines

- Keep each module focused on one cohesive analysis routine.
- Add `@fileoverview` explaining the scenario and any timezone assumptions.
- Prefer optional logger injection to instrument performance without hard dependencies.
- Update this README when new batch modules are added so the catalog stays current.
