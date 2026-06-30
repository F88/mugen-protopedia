'use client';

import { useEffect, useState } from 'react';

import { getMaxPrototypeId } from '@/app/actions/prototypes-gateway';
import { logger } from '@/lib/logger.client';

/**
 * Fallback max prototype id used until the real value is resolved, or when the
 * lookup fails or returns an invalid value.
 */
const FALLBACK_MAX_PROTOTYPE_ID = 7_777;

/**
 * Validate a resolved max prototype id. Kept as a standalone predicate so the
 * short-circuiting logical chain (a "value block") stays out of the try/catch
 * in the resolver effect; the React Compiler cannot lower value blocks within a
 * try statement.
 */
const isValidMaxPrototypeId = (value: number | null): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

/**
 * Resolve the maximum prototype id from the server once on mount, returning a
 * fixed fallback until it is available or when the lookup fails.
 */
export function useMaxPrototypeId(): number {
  const [maxPrototypeId, setMaxPrototypeId] = useState<number>(
    FALLBACK_MAX_PROTOTYPE_ID,
  );

  useEffect(() => {
    let isMounted = true;

    const resolveMaxPrototypeId = async () => {
      // The try only wraps the awaited call; all conditional/value-block logic
      // lives after the try/catch so the React Compiler can optimize this. On a
      // thrown error maxId stays null and falls back below, matching the prior
      // catch branch.
      let maxId: number | null = null;
      try {
        maxId = await getMaxPrototypeId();
      } catch (error) {
        logger.warn(
          'Failed to resolve max prototype id, using fallback',
          error,
        );
      }

      if (!isMounted) {
        return;
      }

      setMaxPrototypeId(
        isValidMaxPrototypeId(maxId) ? maxId : FALLBACK_MAX_PROTOTYPE_ID,
      );
    };

    void resolveMaxPrototypeId();

    return () => {
      isMounted = false;
    };
  }, []);

  return maxPrototypeId;
}
