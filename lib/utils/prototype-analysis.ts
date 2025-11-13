import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { logger as baseLogger } from '@/lib/logger.client';
import { isBirthDay, calculateAge, isToday } from '@/lib/utils/anniversary-nerd';

/**
 * Analysis result for prototype data containing insights and statistics.
 */
export type PrototypeAnalysis = {
  /** Total number of prototypes analyzed */
  totalCount: number;
  /** Distribution of prototypes by status */
  statusDistribution: Record<string, number>;
  /** Number of prototypes with awards */
  prototypesWithAwards: number;
  /** Most common tags (top 10) */
  topTags: Array<{ tag: string; count: number }>;
  /** Average age of prototypes in days */
  averageAgeInDays: number;
  /** Distribution by release year */
  yearDistribution: Record<number, number>;
  /** Teams with most prototypes */
  topTeams: Array<{ team: string; count: number }>;
  /** Anniversary analysis */
  anniversaries: {
    /** Number of prototypes celebrating birthday today */
    birthdayCount: number;
    /** Prototypes celebrating birthdays with their ages */
    birthdayPrototypes: Array<{
      id: number;
      title: string;
      years: number;
      releaseDate: string;
    }>;
    /** Number of prototypes published today (newborn) */
    newbornCount: number;
    /** Prototypes published today */
    newbornPrototypes: Array<{
      id: number;
      title: string;
      releaseDate: string;
    }>;
  };
  /** Analysis timestamp */
  analyzedAt: string;
};

/**
 * Analyzes a collection of prototype data and generates insights and statistics.
 *
 * This function processes normalized prototype data to extract meaningful insights including:
 * - Status distribution analysis
 * - Awards and achievement statistics
 * - Tag frequency analysis
 * - Age and temporal distribution
 * - Team activity analysis
 * - Anniversary analysis (birthday prototypes with age calculation)
 *
 * @param prototypes - Array of normalized prototype data to analyze
 * @returns Comprehensive analysis object with statistics and insights
 *
 * @example
 * ```typescript
 * const prototypes = await fetchPrototypes({ limit: 100 });
 * if (prototypes.ok) {
 *   const analysis = analyzePrototypes(prototypes.data);
 *   console.log('Status distribution:', analysis.statusDistribution);
 *   console.log('Top tags:', analysis.topTags);
 *   console.log('Birthday prototypes:', analysis.anniversaries.birthdayPrototypes);
 * }
 * ```
 */
export function analyzePrototypes(
  prototypes: NormalizedPrototype[],
): PrototypeAnalysis {
  const logger = baseLogger.child({ action: 'analyzePrototypes' });
  const startTime = performance.now();

  if (prototypes.length === 0) {
    logger.debug('No prototypes to analyze, returning empty analysis');
    return {
      totalCount: 0,
      statusDistribution: {},
      prototypesWithAwards: 0,
      topTags: [],
      averageAgeInDays: 0,
      yearDistribution: {},
      topTeams: [],
      anniversaries: {
        birthdayCount: 0,
        birthdayPrototypes: [],
        newbornCount: 0,
        newbornPrototypes: [],
      },
      analyzedAt: new Date().toISOString(),
    };
  }

  // Status distribution analysis
  const statusDistribution: Record<string, number> = {};
  prototypes.forEach((prototype) => {
    const status = prototype.status ?? 'unknown';
    statusDistribution[status] = (statusDistribution[status] ?? 0) + 1;
  });

  // Awards analysis
  const prototypesWithAwards = prototypes.filter(
    (prototype) => prototype.awards && prototype.awards.length > 0,
  ).length;

  // Tags analysis
  const tagCounts: Record<string, number> = {};
  prototypes.forEach((prototype) => {
    if (prototype.tags && Array.isArray(prototype.tags)) {
      prototype.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      });
    }
  });

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // Age analysis
  const now = new Date();
  const ages = prototypes
    .map((prototype) => {
      const releaseDate = new Date(prototype.releaseDate);
      return (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24); // days
    })
    .filter((age) => !Number.isNaN(age) && age >= 0);

  const averageAgeInDays =
    ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;

  // Year distribution analysis
  const yearDistribution: Record<number, number> = {};
  prototypes.forEach((prototype) => {
    const year = new Date(prototype.releaseDate).getFullYear();
    if (!Number.isNaN(year) && year > 1900) {
      yearDistribution[year] = (yearDistribution[year] ?? 0) + 1;
    }
  });

  // Team analysis
  const teamCounts: Record<string, number> = {};
  prototypes.forEach((prototype) => {
    if (prototype.teamNm && prototype.teamNm.trim() !== '') {
      const team = prototype.teamNm.trim();
      teamCounts[team] = (teamCounts[team] ?? 0) + 1;
    }
  });

  const topTeams = Object.entries(teamCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([team, count]) => ({ team, count }));

  // Anniversary analysis - check for birthday prototypes
  const birthdayPrototypes = prototypes
    .filter(
      (prototype) => prototype.releaseDate && isBirthDay(prototype.releaseDate),
    )
    .map((prototype) => {
      const age = calculateAge(prototype.releaseDate);
      return {
        id: prototype.id,
        title: prototype.prototypeNm,
        years: age.years,
        releaseDate: prototype.releaseDate,
      };
    });

  // Newborn analysis - check for prototypes published today
  const newbornPrototypes = prototypes
    .filter(
      (prototype) => prototype.releaseDate && isToday(prototype.releaseDate),
    )
    .map((prototype) => ({
      id: prototype.id,
      title: prototype.prototypeNm,
      releaseDate: prototype.releaseDate,
    }));

  const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;

  logger.debug(
    {
      totalCount: prototypes.length,
      statusCount: Object.keys(statusDistribution).length,
      uniqueTags: Object.keys(tagCounts).length,
      uniqueTeams: Object.keys(teamCounts).length,
      birthdayCount: birthdayPrototypes.length,
      newbornCount: newbornPrototypes.length,
      elapsedMs,
    },
    'Prototype analysis completed',
  );

  const ret = {
    totalCount: prototypes.length,
    statusDistribution,
    prototypesWithAwards,
    topTags,
    averageAgeInDays: Math.round(averageAgeInDays * 100) / 100,
    yearDistribution,
    topTeams,
    anniversaries: {
      birthdayCount: birthdayPrototypes.length,
      birthdayPrototypes,
      newbornCount: newbornPrototypes.length,
      newbornPrototypes,
    },
    analyzedAt: new Date().toISOString(),
  };

  // console.debug('📊 Prototype data analysis completed:', ret);
  // console.debug(
  //   '📊 Prototype data analysis completed (Anniversaries):',
  //   inspect(ret.anniversaries, {
  //     depth: null,
  //     colors: true,
  //     compact: false,
  //     breakLength: 80,
  //     sorted: true,
  //   }),
  // );

  return ret;
}
