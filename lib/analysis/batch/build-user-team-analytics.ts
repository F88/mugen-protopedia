/**
 * @fileoverview
 * User & team analytics. Provides team rankings and a placeholder for future user metrics.
 */

import type { NormalizedPrototype } from '@/lib/api/prototypes';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

export type UserTeamAnalytics = {
  teams: {
    topTeams: Array<{ team: string; count: number }>;
    teamCounts: Record<string, number>;
  };
  users: {
    topUsers: Array<{ user: string; count: number }>;
    userCounts: Record<string, number>;
  };
};

const TOP_TEAM_LIMIT = 30;

/**
 * Aggregates team rankings (and reserves space for upcoming user analytics).
 */
export function buildUserTeamAnalytics(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): UserTeamAnalytics {
  const startTime = Date.now();
  const teamCounts: Record<string, number> = {};

  prototypes.forEach((prototype) => {
    if (prototype.teamNm && prototype.teamNm.trim() !== '') {
      const team = prototype.teamNm.trim();
      teamCounts[team] = (teamCounts[team] ?? 0) + 1;
    }
  });

  const topTeams = Object.entries(teamCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_TEAM_LIMIT)
    .map(([team, count]) => ({ team, count }));

  if (options?.logger) {
    options.logger.debug(
      {
        elapsedMs: Date.now() - startTime,
        distinctTeams: Object.keys(teamCounts).length,
        topTeamCount: topTeams.length,
        totalSamples: prototypes.length,
      },
      '[ANALYSIS] Built user/team analytics',
    );
  }

  return {
    teams: { topTeams, teamCounts },
    users: {
      topUsers: [],
      userCounts: {},
    },
  };
}
