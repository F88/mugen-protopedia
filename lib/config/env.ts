import { z } from 'zod';

/**
 * Zod schema defining environment variables consumed by the app.
 * Add variables here for typed + validated access.
 */
const EnvSchema = z.object({
  GOOGLE_SITE_VERIFICATION_TOKEN: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // In production you may prefer to throw instead of warn.
  console.warn('[env] Invalid environment variables', parsed.error.flatten());
}

/**
 * Exported typed environment object. Missing/invalid vars become undefined.
 */
export const ENV: z.infer<typeof EnvSchema> = parsed.success
  ? parsed.data
  : { GOOGLE_SITE_VERIFICATION_TOKEN: undefined };
