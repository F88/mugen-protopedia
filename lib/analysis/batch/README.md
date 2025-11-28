# Batch Analysis Modules

This directory hosts batch-oriented analysis helpers grouped by concern. Each file
performs a single pass over `NormalizedPrototype[]` inputs and exposes a documented
entrypoint for consumers.

- `build-advanced-analysis.ts`: Story-driven metrics (First Penguins, Star Alignments, etc.).
- `build-time-distributions.ts`: Maker's Rhythm time/date distributions (JST-aligned buckets).
- `collect-unique-release-dates.ts`: Date-keyed utilities (unique release days etc.).
- `index.ts`: Aggregate exports for the batch helpers.

| Module                            | Performs Full Scan? | Primary Inputs                                                | Primary Outputs                                                  |
| --------------------------------- | ------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| `build-advanced-analysis.ts`      | true                | `NormalizedPrototype[]`, top tag summary                      | Story-driven metrics (`AdvancedAnalysis`)                        |
| `build-time-distributions.ts`     | true                | `NormalizedPrototype[]`                                       | Maker's Rhythm time/date distributions (`TimeDistributions`)     |
| `build-tag-analytics.ts`          | true                | `NormalizedPrototype[]`                                       | Tag rankings & counts (`TagAnalytics`)                           |
| `build-material-analytics.ts`     | true                | `NormalizedPrototype[]`                                       | Material rankings & counts (`MaterialAnalytics`)                 |
| `build-user-team-analytics.ts`    | true                | `NormalizedPrototype[]`                                       | Team rankings & user-analytics placeholder (`UserTeamAnalytics`) |
| `collect-unique-release-dates.ts` | true                | `NormalizedPrototype[]` (for `buildDateBasedReleaseInsights`) | Date-keyed insights (`DateBasedReleaseInsights`)                 |

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
