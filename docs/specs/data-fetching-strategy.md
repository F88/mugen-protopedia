---
lang: en
title: Data Fetching Strategy
title-en: Data Fetching Strategy
title-ja: データ取得戦略
related:
    - README.md "Project Overview"
instructions-for-ais:
    - This document should be written in English for AI readability.
    - Content within code fences may be written in languages other than English.
    - Prohibit updating this front-matter.
    - Prohibit updating title line (1st line) in this document.
---

# Data Fetching Strategy

## Context

The MUGEN ProtoPedia application retrieves ProtoPedia prototypes via server actions defined in `app/actions/prototypes.ts`. The core normalization logic lives in `fetchPrototypes`, which performs upstream calls without caching and normalizes the results. Aggregate analysis does not run inside `fetchPrototypes`; it runs when refreshing the canonical snapshot (see below).
Cache‑aware wrappers (`getPrototypesFromCacheOrFetch`, `getAllPrototypesFromMapOrFetch`, `getPrototypeByIdFromMapOrFetch`, `getRandomPrototypeFromMapOrFetch`) delegate to the same normalization logic and coordinate refresh behaviour for the map snapshot.

A separate in-memory `analysisCache` keeps track of analysis results, but prototype lists themselves are not cached beyond Next.js' default data cache (which is limited to roughly 2 MB payloads) and the map snapshot described below.

## UI Error Handling Strategy

> **CRITICAL**: The application prioritizes technical accuracy over simplified user-friendly messages. This is a strict requirement as the target audience includes power users and engineers.

- **Network Errors**: When `fetch` fails (e.g., offline, DNS failure, server down), the UI displays:
  `Possible causes: Offline, DNS, CORS, or Server Down.`
  instead of a generic "No internet connection".
- **API Errors**: Upstream HTTP errors (400, 401, 500, 503) are propagated with their status codes and messages.
- **Timeout**: Connection timeouts (30s) are reported as 504 Gateway Timeout errors.

## Current Behaviour

- **Normalization**:
    - `fetchPrototypes` maps upstream results into `NormalizedPrototype` objects.

- **Analysis**:
    - The canonical snapshot is refreshed when:
        - a successful list fetch occurs **without** a `prototypeId` during
          bootstrap, or
        - the TTL has expired.
    - After a successful refresh, `analyzePrototypes` runs against the canonical
      dataset.
    - The analysis output is cached via `analysisCache`.

- **Map Snapshot Coordination**:
    - `getPrototypesFromCacheOrFetch`:
        - Resolves parameters and fetches data directly through `fetchPrototypes`.
        - On successful list responses **without** a `prototypeId`, schedules
          background refreshes for `prototypeMapStore` when the snapshot is empty
          or stale.
    - `getAllPrototypesFromMapOrFetch`, `getPrototypeByIdFromMapOrFetch`, and
      `getRandomPrototypeFromMapOrFetch`:
        - Build on `prototypeMapStore`, which keeps a canonical snapshot keyed by
          prototype ID.
        - Serve data immediately, even when stale, while TTL expiry triggers a
          lazy refresh.
    - Direct calls:
        - Calling `fetchPrototypes`, `fetchRandomPrototype`, or
          `fetchPrototypeById` directly bypasses snapshot coordination for
          force-refresh scenarios.

- **Upstream Client Caching**:
    - `lib/protopedia-client.ts` exposes two preconfigured clients:
        - `protopediaForceCacheClient`: uses `cache: 'force-cache'` with
          `next.revalidate: 60` and is intended for list, playlist, and
          analysis paths where slightly stale data is acceptable.
        - `protopediaNoStoreClient`: uses `cache: 'no-store'` with
          `next.revalidate: 0` and is intended for SHOW / upstream-only
          paths that always prefer the freshest data.
    - `fetchPrototypesViaForceCacheClient` calls
      `protopediaForceCacheClient.listPrototypes`, benefiting from the
      Next.js Data Cache when payloads are small enough.
    - `fetchPrototypesViaNoStoreClient` (used by the SHOW path via
      `getLatestPrototypeById` and `useLatestPrototypeById`) calls
      `protopediaNoStoreClient.listPrototypes`, explicitly bypassing the
      Data Cache and hitting the upstream API for each request.

- **Known Constraints**:
    - Upstream responses grow quickly:
        - ≈220 KB for 100 items
        - ≈2.7 MB for 1,000 items
        - ≈16.5 MB for 10,000 items (~20 MB including metadata on production
          responses)
    - Next.js data cache cannot persist payloads larger than ≈2 MB, so large
      requests bypass caching automatically.
    - In-memory caches in a serverless/edge environment are scoped to the
      instance and reset on redeploys or scale events.

### Upstream Measurement Snapshot (2025-10-24)

| API                   | limit  | size or rows | duration (ms) | res body size (bytes) |
| --------------------- | ------ | ------------ | ------------- | --------------------- |
| listPrototypes        | 1      | 1            | 3,388         | 1,078                 |
| listPrototypes        | 100    | 100          | 3,172         | 209,569               |
| listPrototypes        | 1,000  | 1,000        | 3,405         | 2,576,303             |
| listPrototypes        | 10,000 | 5,644        | 4,777         | 15,444,297            |
| downloadPrototypesTsv | 1      | 2            | 3,332         | 749                   |
| downloadPrototypesTsv | 100    | 101          | 3,210         | 41,279                |
| downloadPrototypesTsv | 1,000  | 1,001        | 3,246         | 439,941               |
| downloadPrototypesTsv | 10,000 | 5,645        | 3,538         | 3,254,374             |

These figures originate from ProtoPedia API Ver 2.0 Client documentation and are reproduced here for ease of reference.

## Prototype Map Store (`prototypeMapStore`)

The map store maintains a canonical snapshot of all prototypes keyed by ID. `setAll` replaces the entire snapshot (built from a canonical fetch with `limit=10_000` and `offset=0`) when the payload fits within the 30 MiB guard. Lookups (`getById`, `getRandom`, `getAll`) serve data immediately, even if the snapshot is stale; TTL expiry simply triggers a background refresh via `runExclusive` while still returning the previous snapshot.

- **Benefits**: Provides O(1) ID lookups and constant-time random selection without re-fetching upstream. Offers deterministic stale-while-revalidate behaviour for long-running operations.
- **Risks**: Shares the same instance-scoped constraints as any in-memory cache. If the canonical payload exceeds 30 MiB, the snapshot is skipped and callers must rely on direct fetches.

`getAllPrototypesFromMapOrFetch`, `getPrototypeByIdFromMapOrFetch`, and `getRandomPrototypeFromMapOrFetch` wrap the map store for server actions. They fall back to direct fetches when the snapshot is unavailable or stale beyond the TTL guard.

## Implementation Notes

- Repository helpers call `fetchPrototypes` for paginated requests and rely on `prototypeMapStore` when callers request the full canonical dataset. ID-centric paths consult the map store first and fall back to direct fetches when unavailable.
- UI hooks (`usePrototypes`, client components) continue to request paginated data, avoiding transfers of the full dataset to the browser. Random selection flows leverage the map store for instant responses.
- Logging now differentiates map-store hits and fallback execution, giving observability into refresh frequency and payload sizes.
- Unit tests cover TTL handling, concurrent refresh protection, and payload guard behaviour for the map store (`prototype-map-store.test.ts`).

## Operational Notes

- **Environment Support**: For deployment on serverless platforms, ensure functions remain warm long enough for the TTL to provide value. If not, consider Redis or Planetscale-backed caches.
- **Cache Busting**: Document procedures for forcing refreshes (e.g. redeploy, admin endpoint, or manual clear).
- **Monitoring**: Track cache hit rate and memory usage to validate effectiveness. Adjust TTL/max entries accordingly.

## Future Enhancements

- Store derived analytics and primary data under a shared cache manager with namespaces.
- Explore stale-while-revalidate behaviour: return cached data immediately and refresh asynchronously for next access.
- Investigate persisting canonical datasets (e.g. nightly jobs storing snapshots in object storage) to decrease reliance on live upstream calls.
