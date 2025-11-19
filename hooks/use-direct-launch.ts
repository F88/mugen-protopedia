'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import type { Result } from '@/lib/utils/result';
import type { ValidationError } from '@/lib/validation/validation';
import { parseDirectLaunchParams } from '@/lib/validation/validation';
import type { DirectLaunchParams } from '@/schemas/direct-launch';

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
