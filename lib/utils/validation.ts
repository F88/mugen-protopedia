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
    .regex(/^[0-9,]*$/, {
      message: 'IDs must contain only digits and commas.',
    })
    .transform((val) => {
      // Split by comma, trim spaces, filter out empty strings, convert to number
      const ids = val
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map(Number);
      // Filter out NaN values
      return ids.filter((id) => !isNaN(id));
    })
    .optional(),
  title: z
    .string()
    .max(1_000, { message: 'Title must be 1,000 characters or less.' })
    .nullable()
    .optional(),
});

const isPositiveInteger = (value: number): boolean =>
  Number.isInteger(value) && value > 0;

const splitIds = (rawValues: string[]): string[] =>
  rawValues.flatMap((rawValue) =>
    rawValue
      .split(',')
      .map((token) => token.trim())
      .filter((token) => token.length > 0),
  );

export const parseDirectLaunchParams = (
  searchParams: URLSearchParams,
): Result<DirectLaunchParams, ValidationError> => {
  const rawIds = searchParams.getAll('id');
  const rawTitle = searchParams.get('title');

  const tokens = splitIds(rawIds);
  const ids = tokens
    .map((token) => Number(token))
    .filter((numeric) => !Number.isNaN(numeric) && isPositiveInteger(numeric));

  const parseResult = directLaunchSchema.safeParse({ title: rawTitle });

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

  const normalizedTitle =
    parseResult.data.title === null ? undefined : parseResult.data.title;

  return {
    type: 'success',
    value: {
      ids,
      title: normalizedTitle,
    },
  };
};
