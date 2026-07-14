/**
 * @fileoverview
 * Type definitions for all prototype analysis results and related data structures.
 *
 * - Shared types for server/client analysis results
 * - Return types for each analysis feature
 * - Individual analysis types (e.g. Anniversary, Labor of Love)
 *
 * Always provide TSDoc for each type and field to clarify intent and usage.
 */

/**
 * Minimal logger contract used across analysis modules for dependency injection.
 *
 * Mirrors the subset of pino-style loggers we rely on while remaining framework agnostic.
 */
export interface MinimalLogger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  child: (bindings: Record<string, unknown>) => MinimalLogger;
}

/**
 * Represents a prototype celebrating a birthday "today".
 *
 * @property years - Age in years; depends on the timezone where
 *   `calculateAge` was executed. UI recomputation recommended.
 */
export type BirthdayPrototype = {
  id: number;
  title: string;
  years: number;
  releaseDate: string;
  /** Team name, or an empty string when the work has no team. */
  teamNm: string;
  /** All makers ("表示名@profileId" elements); always shown in full. */
  users: readonly string[];
};

/**
 * Represents a prototype published "today".
 *
 * Membership determined by `isToday` at runtime; timezone-sensitive.
 */
export type NewbornPrototype = {
  id: number;
  title: string;
  releaseDate: string;
  /** Team name, or an empty string when the work has no team. */
  teamNm: string;
  /** All makers ("表示名@profileId" elements); always shown in full. */
  users: readonly string[];
};

/**
 * Summary slice containing birthday and newborn prototypes for "today".
 *
 * This type is timezone-sensitive: counts and arrays reflect the timezone where
 * `buildAnniversaries` executed. UI recomputation is strongly recommended.
 */
export type AnniversariesSlice = {
  birthdayCount: number;
  birthdayPrototypes: BirthdayPrototype[];
  newbornCount: number;
  newbornPrototypes: NewbornPrototype[];
};

/**
 * Prototype data for anniversary analysis. Carries the fields needed to decide
 * whether a prototype is a birthday or newborn candidate in the user's timezone
 * (`id`, `title`, `releaseDate`), plus `teamNm` and `users` passed through for
 * display of the team and makers.
 */
export type AnniversaryCandidatePrototype = {
  /** Prototype ID */
  id: number;
  /** Prototype title/name */
  title: string;
  /** Release date in ISO 8601 format */
  releaseDate: string;
  /** Team name, or an empty string when the work has no team. */
  teamNm: string;
  /** All makers ("表示名@profileId" elements); always shown in full. */
  users: readonly string[];
};

/**
 * UTC-based anniversary candidate metadata for client-side filtering.
 *
 * This type represents pre-computed UTC time windows and date patterns that
 * help clients efficiently filter prototypes before performing timezone-aware
 * anniversary detection. Instead of fetching and analyzing all prototypes,
 * clients can use these metadata to request only relevant candidates.
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
  /** Candidate prototypes for month-day based anniversary detection (carrying team/makers for display) */
  mmdd: AnniversaryCandidatePrototype[];
};

/**
 * Server-side analysis result (timezone-independent data only).
 *
 * TODO(rename): this is now the HOME page's analysis only (Observatory surfaces
 * have their own types). Rename `ServerPrototypeAnalysis` -> `HomeAnalysis`
 * (and reconsider `PrototypeAnalysis`) in a follow-up so the name reflects its
 * home-only scope. Deferred: rename touches types.ts, analysis-cache, server,
 * analysis action, analysis-repository, mock helper, hooks, and the dashboard.
 *
 * This type represents analysis data computed on the server, which excludes
 * timezone-sensitive fields like anniversaries. The server provides a baseline
 * snapshot of TZ-independent statistics.
 *
 * The `anniversaryCandidates` field provides UTC-based metadata that clients
 * can use to pre-filter prototypes before performing timezone-aware anniversary
 * detection in the user's local timezone.
 *
 * Anniversary data MUST be computed client-side using the user's timezone
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
  /** Analysis timestamp */
  analyzedAt: string;
  /**
   * UTC-based metadata for client-side anniversary filtering.
   * Clients can use these windows to pre-filter candidates before
   * performing timezone-aware anniversary detection.
   */
  anniversaryCandidates: AnniversaryCandidates;

  /** Release time distribution (hour and day-of-week patterns) */
  releaseTimeDistribution: {
    /** Count by day of week (0=Sunday, 6=Saturday) */
    dayOfWeek: number[];
    /** Count by hour of day (0-23, JST) */
    hour: number[];
    /** Heatmap data: 7 arrays (days) of 24 numbers (hours) */
    heatmap: number[][];
  };

  /** Update time distribution (hour and day-of-week patterns) */
  updateTimeDistribution: {
    /** Count by day of week (0=Sunday, 6=Saturday) */
    dayOfWeek: number[];
    /** Count by hour of day (0-23, JST) */
    hour: number[];
    /** Heatmap data: 7 arrays (days) of 24 numbers (hours) */
    heatmap: number[][];
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

  /** The Maternity Hospital analysis (Events) */
  maternityHospital: {
    /** Top events by number of prototypes */
    topEvents: Array<{ event: string; count: number }>;
    /** Ratio of independent births (no event) */
    independentRatio: number;
  };

  /** Debug metrics for analysis performance */
  _debugMetrics?: Record<string, number>;
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
