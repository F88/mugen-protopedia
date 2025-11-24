import { z } from 'zod';

export type DirectLaunchParams = {
  ids: number[];
  title?: string;
  unleashed?: boolean;
  joe?: boolean;
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

  unleashed: z.boolean().optional(),

  joe: z.boolean().optional(),
});
