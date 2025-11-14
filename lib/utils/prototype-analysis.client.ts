'use client';

import { logger as clientLogger } from '@/lib/logger.client';
import {
  buildAnniversaries,
  buildAnniversarySlice,
} from '@/lib/utils/prototype-analysis-helpers';
import type {
  AnniversaryCandidatePrototype,
  ClientPrototypeAnalysis,
} from '@/lib/utils/prototype-analysis.types';

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
 * const analysis = analyzeCandidates(anniversaryCandidates.prototypes);
 * // analysis.anniversaries reflects user's timezone
 * ```
 */
export function analyzeCandidates(
  candidates: AnniversaryCandidatePrototype[],
  options?: { logger?: MinimalLogger },
): ClientPrototypeAnalysis {
  const base: MinimalLogger = options?.logger ?? clientLogger;
  const logger = base.child({ action: 'analyzeCandidates' });

  // Early return if no candidates
  if (candidates.length === 0) {
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
  const { birthdayPrototypes, newbornPrototypes } =
    buildAnniversaries(candidates);

  logger.info(
    {
      candidateCount: candidates.length,
      birthdayCount: birthdayPrototypes.length,
      newbornCount: newbornPrototypes.length,
    },
    'Client-side anniversaries computed from candidates',
  );

  const anniversaries = buildAnniversarySlice(
    birthdayPrototypes,
    newbornPrototypes,
  );

  return { anniversaries };
}
