import { z } from 'zod';

import type { Result } from './result';

export interface ValidationError {
  status: 'error';
  errors: string[];
}

export type DirectLaunchParams = {
  ids: number[];
  title?: string;
};

export const directLaunchSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9,]*$/, {
      message: 'IDs must contain only digits and commas.',
    })
    .transform((value) => {
      const tokens = value.split(',').filter((token) => token.length > 0);

      if (tokens.length === 0) {
        return [];
      }

      return tokens.map((token) => Number.parseInt(token, 10));
    })
    .optional(),

  title: z
    .string()
    .max(300, { message: 'Title must be 300 characters or less.' })
    .nullable()
    .optional(),
});

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
