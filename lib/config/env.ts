import type { Env } from '@/schemas/env';
import { EnvSchema } from '@/schemas/env';

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // In production you may prefer to throw instead of warn.
  console.warn('[env] Invalid environment variables', parsed.error.flatten());
}

/**
 * Exported typed environment object. Missing/invalid vars become undefined.
 */
export const ENV: Env = parsed.success
  ? parsed.data
  : { GOOGLE_SITE_VERIFICATION_TOKEN: undefined };
