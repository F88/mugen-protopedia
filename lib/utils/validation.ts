import { z } from 'zod';

import type { Result } from './result';

interface ValidationError {
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
    .superRefine((value, ctx) => {
      const normalized = value.replace(/\s+/g, '');

      if (normalized.length === 0) {
        return;
      }

      if (!/^[0-9,]*$/.test(normalized)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'IDs must contain only digits and commas.',
        });
      }
    })
    .transform((value) => {
      const tokens = value
        .split(',')
        .map((token) => token.trim())
        .filter((token) => token.length > 0);

      if (tokens.length === 0) {
        return [];
      }

      return tokens.map((token) => Number(token));
    })
    .optional(),
  title: z
    .string()
    .max(100, { message: 'Title must be 100 characters or less.' })
    .nullable()
    .optional(),
});

const normalizeIdsInput = (rawValues: string[]): string | undefined => {
  if (rawValues.length === 0) {
    return undefined;
  }

  return rawValues.join(',');
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
