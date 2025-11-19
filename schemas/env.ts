import { z } from 'zod';

/**
 * Zod schema defining environment variables consumed by the app.
 * Add variables here for typed + validated access.
 */
export const EnvSchema = z.object({
  GOOGLE_SITE_VERIFICATION_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;
