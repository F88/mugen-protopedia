import type { AnniversariesSlice } from '@/lib/utils/prototype-analysis-helpers';

/**
 * Minimal prototype data required for anniversary analysis.
 * Contains only the essential fields needed to determine if a prototype
 * is a birthday or newborn candidate in the user's timezone.
 */
export type AnniversaryCandidatePrototype = {
  /** Prototype ID */
  id: number;
  /** Prototype title/name */
  title: string;
  /** Release date in ISO 8601 format */
  releaseDate: string;
};

/**
 * UTC-based anniversary candidate metadata for client-side filtering.
 *
 * This type represents pre-computed UTC time windows and date patterns that
 * help clients efficiently filter prototypes before performing timezone-aware
 * anniversary detection. Instead of fetching and analyzing all prototypes,
 * clients can use these metadata to request only relevant candidates.
 *
 * **Purpose:**
 * Enables a "Payload Minimization Strategy" where the server provides UTC-based
 * hints about which prototypes might be anniversaries in the user's timezone,
 * allowing clients to fetch a minimal subset rather than the entire dataset.
 *
 * **Typical data volume:**
 * The 3-day UTC window typically contains a small subset of prototypes compared
 * to the full dataset (~10,000 items). However, due to project deadlines and
 * scheduled release dates, certain days may have concentrated releases resulting
 * in several dozen to over 100 candidates per day. This is expected behavior
 * and still represents significant payload reduction (99%+) compared to fetching
 * the entire dataset.
 *
 * **Fields:**
 * - `metadata.computedAt`: ISO 8601 timestamp of when these candidates were computed.
 *   Used for cache validation and debugging.
 *
 * - `metadata.windowUTC`: ISO 8601 date range covering [yesterday 00:00, tomorrow 23:59:59.999]
 *   in UTC. Prototypes with `releaseDate` within this window are candidates for
 *   anniversary detection (newborn, birthday, yearly milestone, etc. in user's timezone).
 *
 * - `prototypes`: Array of prototype data within the 3-day UTC window.
 *   This allows clients to perform anniversary analysis without fetching the entire dataset.
 *
 * **Usage Pattern:**
 * 1. Server computes these candidates during analysis and includes them in the response
 * 2. Client receives candidates with pre-filtered prototype data (3-day window only)
 * 3. Client runs `analyzePrototypes()` on the small candidate subset in their timezone
 *
 * **Example:**
 * ```typescript
 * // Server provides:
 * {
 *   metadata: {
 *     computedAt: '2025-11-14T09:00:00.000Z',
 *     windowUTC: {
 *       fromISO: '2025-11-13T00:00:00.000Z',
 *       toISO: '2025-11-15T23:59:59.999Z'
 *     }
 *   },
 *   mmdd: [...]
 * }
 *
 * // Client uses pre-filtered data:
 * const analysis = analyzePrototypes(candidates.mmdd);
 * // No need to fetch 10,000 items - only candidates are transferred
 * ```
 *
 * @see {@link buildAnniversaryCandidates} - Function that computes these candidates
 * @see {@link ServerPrototypeAnalysis.anniversaryCandidates} - Where this type is used
 */
export type AnniversaryCandidates = {
  /** Metadata about when and how these candidates were computed */
  metadata: {
    /** Timestamp when these candidates were computed, ISO 8601 format */
    computedAt: string;
    /** UTC time window for anniversary candidates (3-day range: yesterday to tomorrow) */
    windowUTC: {
      /** Start of window (inclusive), ISO 8601 format */
      fromISO: string;
      /** End of window (inclusive), ISO 8601 format */
      toISO: string;
    };
  };
  /** Minimal prototype data for month-day based anniversary detection */
  mmdd: AnniversaryCandidatePrototype[];
};

/**
 * Server-side analysis result (timezone-independent data only).
 *
 * This type represents analysis data computed on the server, which excludes
 * timezone-sensitive fields like anniversaries. The server provides a baseline
 * snapshot of TZ-independent statistics.
 *
 * The `anniversaryCandidates` field provides UTC-based metadata that clients
 * can use to pre-filter prototypes before performing timezone-aware anniversary
 * detection in the user's local timezone.
 *
 * **Anniversary data MUST be computed client-side** using the user's timezone
 * via `useClientAnniversaries` hook or `analyzePrototypes` executed in browser.
 */
export type ServerPrototypeAnalysis = {
  /** Total number of prototypes analyzed */
  totalCount: number;
  /** Distribution of prototypes by status */
  statusDistribution: Record<string, number>;
  /** Number of prototypes with awards */
  prototypesWithAwards: number;
  /** Most common tags (top 10) */
  topTags: Array<{ tag: string; count: number }>;
  /** Most frequently used materials/tools (top 10) */
  topMaterials: Array<{ material: string; count: number }>;
  /** Average age of prototypes in days */
  averageAgeInDays: number;
  /** Distribution by release year */
  yearDistribution: Record<number, number>;
  /** Teams with most prototypes */
  topTeams: Array<{ team: string; count: number }>;
  /** Analysis timestamp */
  analyzedAt: string;
  /** Debug metrics for analysis performance */
  _debugMetrics?: Record<string, number>;
  /**
   * UTC-based metadata for client-side anniversary filtering.
   * Clients can use these windows to pre-filter candidates before
   * performing timezone-aware anniversary detection.
   */
  anniversaryCandidates: AnniversaryCandidates;

  /** Release time distribution (Maker's Rhythm) */
  releaseTimeDistribution: {
    /** Count by day of week (0=Sunday, 6=Saturday) */
    dayOfWeek: number[];
    /** Count by hour of day (0-23) */
    hour: number[];
  };

  /** Creation streak analysis (The Eternal Flame) */
  creationStreak: {
    /** Current streak of consecutive days with releases (up to yesterday/today) */
    currentStreak: number;
    /** Longest streak in history */
    longestStreak: number;
    /** Date when the longest streak ended */
    longestStreakEndDate: string | null;
    /** Total active days (days with at least one release) */
    totalActiveDays: number;
  };

  /** Early Adopter analysis (The Origin) */
  earlyAdopters: Array<{
    tag: string;
    prototypeId: number;
    prototypeTitle: string;
    releaseDate: string;
  }>;

  /** First Penguin analysis (First release of each year) */
  firstPenguins: Array<{
    year: number;
    prototype: {
      id: number;
      title: string;
      releaseDate: string;
      user: string; // First user name or team name
    };
  }>;

  /** Star Alignment analysis (Prototypes released at exact same time) */
  starAlignments: Array<{
    timestamp: string;
    prototypes: Array<{
      id: number;
      title: string;
    }>;
  }>;

  /** Anniversary Effect analysis (Releases on special days) */
  anniversaryEffect: Array<{
    name: string;
    date: string; // MM-DD
    count: number;
    examples: Array<{ id: number; title: string; year: number }>;
  }>;
};

/**
 * Complete analysis result including timezone-sensitive anniversary data.
 *
 * This type extends ServerPrototypeAnalysis with anniversary fields that MUST
 * be computed in the client's timezone for UI-authoritative "today" semantics.
 *
 * Use this type for client-side analysis results where anniversaries reflect
 * the user's local timezone.
 */
export type PrototypeAnalysis = ServerPrototypeAnalysis & {
  /** Anniversary analysis (MUST be computed in client timezone) */
  anniversaries: AnniversariesSlice;
};

/**
 * Client-side analysis result type that contains only anniversary data.
 * Used when analyzing minimal prototype datasets (e.g., AnniversaryCandidatePrototype[]).
 */
export type ClientPrototypeAnalysis = {
  anniversaries: AnniversariesSlice;
};
