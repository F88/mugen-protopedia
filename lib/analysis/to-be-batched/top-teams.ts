/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient top teams analysis.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';

/**
 * Tallies prototypes per team, trimming whitespace and returning the top teams alongside the raw counts map.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Object containing top teams array and complete team counts map.
 */
export function buildTopTeams(prototypes: NormalizedPrototype[]): {
  topTeams: Array<{ team: string; count: number }>;
  teamCounts: Record<string, number>;
} {
  const teamCounts: Record<string, number> = {};
  prototypes.forEach((prototype) => {
    if (prototype.teamNm && prototype.teamNm.trim() !== '') {
      const team = prototype.teamNm.trim();
      teamCounts[team] = (teamCounts[team] ?? 0) + 1;
    }
  });
  const topTeams = Object.entries(teamCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([team, count]) => ({ team, count }));
  return { topTeams, teamCounts };
}
