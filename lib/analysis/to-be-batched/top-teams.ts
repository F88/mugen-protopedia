/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient top teams analysis.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';
import { buildUserTeamAnalytics } from '../batch/build-user-team-analytics';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

/**
 * Tallies prototypes per team, trimming whitespace and returning the top teams alongside the raw counts map.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Object containing top teams array and complete team counts map.
 */
export function buildTopTeams(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): {
  topTeams: Array<{ team: string; count: number }>;
  teamCounts: Record<string, number>;
} {
  const { teams } = buildUserTeamAnalytics(prototypes, options);
  return teams;
}
