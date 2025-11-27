'use client';

import { logger as clientLogger } from '@/lib/logger.client';
import { buildAnniversaryCandidateTotals } from '@/lib/utils/anniversary-candidate-metrics';
import {
  buildAnniversaries,
  buildAnniversarySlice,
} from '../shared/anniversaries';
import type {
  AnniversaryCandidatePrototype,
  ClientPrototypeAnalysis,
} from '@/lib/analysis/types';

/**
 * Minimal logger interface for dependency injection
 */
type MinimalLogger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  child: (bindings: Record<string, unknown>) => MinimalLogger;
};

/**
 * Analyzes anniversary candidates in the user's local timezone.
 *
 * This function is designed to run on the client-side with pre-filtered
 * candidate prototypes from the server. It only computes anniversary-related
 * data (birthdays and newborns) using the browser's timezone.
 *
 * **Client-side only:**
 * - Uses minimal `AnniversaryCandidatePrototype[]` data (id, title, releaseDate)
 * - Computes anniversaries in user's browser timezone
 * - Returns only anniversary data (no server-side statistics)
 *
 * @param candidates - Pre-filtered anniversary candidates from server
 * @param options - Optional logger configuration
 * @returns Client analysis with anniversary data only
 *
 * @example
 * ```typescript
 * // In a client component or hook
 * const { anniversaryCandidates } = serverAnalysis;
 * const analysis = analyzeCandidates(anniversaryCandidates.mmdd);
 * // analysis.anniversaries reflects user's timezone
 * ```
 */
export function analyzeCandidates(
  candidates: AnniversaryCandidatePrototype[],
  options?: { logger?: MinimalLogger; referenceDate?: Date },
): ClientPrototypeAnalysis {
  const base: MinimalLogger = options?.logger ?? clientLogger;
  const logger = base.child({ action: 'analyzeCandidates' });
  const totals = buildAnniversaryCandidateTotals(candidates, {
    referenceDate: options?.referenceDate,
  });

  // Early return if no candidates
  if (candidates.length === 0) {
    logger.debug(
      {
        totals,
        anniversaries: {
          birthdayCount: 0,
          newbornCount: 0,
        },
      },
      'Client-side anniversaries computed from candidates',
    );
    return {
      anniversaries: {
        birthdayCount: 0,
        birthdayPrototypes: [],
        newbornCount: 0,
        newbornPrototypes: [],
      },
    };
  }

  // Compute timezone-sensitive anniversaries
  const { birthdayPrototypes, newbornPrototypes } = buildAnniversaries(
    candidates,
    { logger },
  );

  logger.debug(
    {
      totals,
      anniversaries: {
        birthdayCount: birthdayPrototypes.length,
        newbornCount: newbornPrototypes.length,
      },
    },
    '[ANALYSIS] Client-side anniversaries computed from candidates',
  );

  const anniversaries = buildAnniversarySlice(
    birthdayPrototypes,
    newbornPrototypes,
    { logger },
  );

  return { anniversaries };
}
