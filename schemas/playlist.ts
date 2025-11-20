import { z } from 'zod';

import { isPrototypeUrl } from '@/lib/utils/playlist-builder';

export const playlistTitleSchema = z
  .string()
  .optional()
  .transform((value) => value ?? '')
  .refine((value) => value.length === 0 || value.length <= 300, {
    message: 'Playlist title must be 300 characters or fewer.',
  });

export const prototypeIdTextSchema = z
  .string()
  .transform((value) => value ?? '')
  .refine(
    (value) => {
      if (value.length === 0) return true;
      const lines = value.split(/\r?\n|\r/);
      return lines.every((line) => line.length === 0 || /^\d+$/.test(line));
    },
    {
      message: 'Each non-empty line must contain digits only.',
    },
  );

export const prototypeUrlsTextSchema = z
  .string()
  .transform((value) => value ?? '')
  .refine(
    (value) => {
      if (value.length === 0) return true;
      const lines = value.split(/\r?\n|\r/);
      return lines.every((line) => line.length === 0 || isPrototypeUrl(line));
    },
    {
      message:
        'Each non-empty line must be a valid ProtoPedia prototype URL (https://protopedia.net/prototype/<id>).',
    },
  );

export const pageUrlSchema = z
  .string()
  .transform((value) => value ?? '')
  .refine(
    (value) => value.length === 0 || z.string().url().safeParse(value).success,
    {
      message: 'Please enter a valid URL.',
    },
  )
  .refine((value) => value.length === 0 || value.startsWith('https://'), {
    message: 'Please enter a valid https URL.',
  });

export const rawContentSchema = z
  .string()
  .transform((value) => value ?? '')
  .refine((value) => value.trim().length > 0, {
    message: 'Paste HTML or TSV content to extract from.',
  })
  .refine((value) => value.length <= 100_000, {
    message:
      'Content is too large to process on this page. Please reduce the size (for example by trimming or splitting) and try again.',
  });
