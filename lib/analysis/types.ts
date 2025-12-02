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
  /** Teams with most prototypes */
  topTeams: Array<{ team: string; count: number }>;
  /** Analysis timestamp */
  analyzedAt: string;
  /**
   * UTC-based metadata for client-side anniversary filtering.
   * Clients can use these windows to pre-filter candidates before
   * performing timezone-aware anniversary detection.
   */
  anniversaryCandidates: AnniversaryCandidates;

  /** Create time distribution (hour and day-of-week patterns) */
  createTimeDistribution: {
    /** Count by day of week (0=Sunday, 6=Saturday) */
    dayOfWeek: number[];
    /** Count by hour of day (0-23, JST) */
    hour: number[];
    /** Heatmap data: 7 arrays (days) of 24 numbers (hours) */
    heatmap: number[][];
  };

  /** Create date distribution (calendar-based patterns) */
  createDateDistribution: {
    /** Count by month (0=January, 11=December) */
    month: number[];
    /** Count by year (e.g., 2024: 150, 2025: 200) */
    year: Record<number, number>;
    /** Count by date (year -> month -> day -> count). Optimized for O(1) lookup and flexible aggregation. */
    daily: Record<number, Record<number, Record<number, number>>>;
  };

  /** Release time distribution (hour and day-of-week patterns) */
  releaseTimeDistribution: {
    /** Count by day of week (0=Sunday, 6=Saturday) */
    dayOfWeek: number[];
    /** Count by hour of day (0-23, JST) */
    hour: number[];
    /** Heatmap data: 7 arrays (days) of 24 numbers (hours) */
    heatmap: number[][];
  };

  /** Release date distribution (calendar-based patterns) */
  releaseDateDistribution: {
    /** Count by month (0=January, 11=December) */
    month: number[];
    /** Count by year (e.g., 2024: 150, 2025: 200) */
    year: Record<number, number>;
    /** Count by date (year -> month -> day -> count). Optimized for O(1) lookup and flexible aggregation. */
    daily: Record<number, Record<number, Record<number, number>>>;
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

  /** Update date distribution (calendar-based patterns) */
  updateDateDistribution: {
    /** Count by month (0=January, 11=December) */
    month: number[];
    /** Count by year (e.g., 2024: 150, 2025: 200) */
    year: Record<number, number>;
    /** Count by date (year -> month -> day -> count). Optimized for O(1) lookup and flexible aggregation. */
    daily: Record<number, Record<number, Record<number, number>>>;
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

  /** Labor of Love analysis (Gestation period) */
  laborOfLove: {
    /** Top prototypes with longest gestation period */
    longestGestation: Array<{
      id: number;
      title: string;
      durationDays: number;
      createDate: string;
      releaseDate: string;
    }>;
    /** Distribution of gestation periods */
    distribution: Record<string, number>;
  };

  /** The Maternity Hospital analysis (Events) */
  maternityHospital: {
    /** Top events by number of prototypes */
    topEvents: Array<{ event: string; count: number }>;
    /** Ratio of independent births (no event) */
    independentRatio: number;
  };

  /** The Power of Deadlines analysis */
  powerOfDeadlines: {
    /** Top spikes in prototype releases */
    spikes: Array<{ date: string; count: number; score: number }>;
  };

  /** The Weekend Warrior's Crunch analysis */
  weekendWarrior: {
    /**
     * Hourly release counts for the "Extended Weekend Realm" (Fri 18:00 - Mon 24:00).
     * Total 78 hours.
     * Index 0 = Fri 18:00
     * Index 6 = Sat 00:00
     * Index 30 = Sun 00:00
     * Index 54 = Mon 00:00
     * Index 77 = Mon 23:00
     */
    weekendHourlyCounts: number[];
    /** Total count of prototypes released during this 78-hour window */
    totalWeekendCount: number;
  };

  /** The Holy Day analysis */
  holyDay: {
    /** Top days with highest prototype release counts */
    topDays: Array<{ date: string; count: number }>; // MM-DD
  };

  /** Long-Term Evolution analysis (Long maintenance periods) */
  longTermEvolution: {
    /** Top prototypes with longest update span (releaseDate to updateDate) */
    longestMaintenance: Array<{
      id: number;
      title: string;
      maintenanceDays: number;
      releaseDate: string;
      updateDate: string;
    }>;
    /** Average maintenance period in days */
    averageMaintenanceDays: number;
    /** Percentage of prototypes still being maintained (updated after release) */
    maintenanceRatio: number;
  };

  /** Evolution Span analysis (Distribution of active duration) */
  evolutionSpan: {
    /** Distribution of active duration (releaseDate to updateDate) */
    distribution: {
      noUpdates: number;
      sameDayUpdate: number;
      within3Days: number;
      within7Days: number;
      within14Days: number;
      within30Days: number;
      within90Days: number;
      within180Days: number;
      within1Year: number;
      within3Years: number;
      over3Years: number;
    };
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
