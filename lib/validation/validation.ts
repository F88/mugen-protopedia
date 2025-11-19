import type { Result } from '../utils/result';
import type { DirectLaunchParams } from '@/schemas/direct-launch';
import { directLaunchSchema } from '@/schemas/direct-launch';

export interface ValidationError {
  status: 'error';
  errors: string[];
}

const normalizeIdsInput = (rawValues: string[]): string | undefined => {
  if (rawValues.length === 0) {
    return undefined;
  }

  const joined = rawValues.join(',');
  return joined.length > 0 ? joined : undefined;
};

export const parseDirectLaunchParams = (
  searchParams: URLSearchParams,
): Result<DirectLaunchParams, ValidationError> => {
  const rawIds = searchParams.getAll('id');
  const rawTitle = searchParams.get('title');

  const parseResult = directLaunchSchema.safeParse({
    id: normalizeIdsInput(rawIds),
    title: rawTitle,
  });

  // Error aggregation
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((issue) => issue.message);
    return {
      type: 'failure',
      error: {
        status: 'error',
        errors,
      },
    };
  }

  // Successful
  const normalizedTitle =
    parseResult.data.title === null ? undefined : parseResult.data.title;
  return {
    type: 'success',
    value: {
      ids: parseResult.data.id ?? [],
      title: normalizedTitle,
    },
  };
};
