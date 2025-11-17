'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { parseDirectLaunchParams } from '@/lib/utils/validation';
import type {
  DirectLaunchParams,
  ValidationError,
} from '@/lib/utils/validation';
import type { Result } from '@/lib/utils/result';

/**
 * A hook to get and validate 'id' and 'title' from URL query parameters
 * for direct launch functionality.
 *
 * It uses a centralized validation utility.
 */
export const useDirectLaunch = (): Result<
  DirectLaunchParams,
  ValidationError
> => {
  const searchParams = useSearchParams();

  return useMemo(() => parseDirectLaunchParams(searchParams), [searchParams]);
};
