/**
 * Server-side feature flags read from environment variables.
 */

/**
 * Master opt-in for the promidas repository migration (#181).
 *
 * When enabled, prototype reads go through the promidas in-memory Repository
 * (see `lib/promidas-repository.ts`) instead of the legacy `prototypeMapStore`
 * path. Controlled by `USE_PROMIDAS_REPOSITORY`: the exact string `'true'`
 * enables it; anything else (or unset) disables it. Default: disabled (legacy
 * map-store), so enabling is an explicit opt-in and flipping it off is an
 * instant rollback.
 */
export function isPromidasRepositoryEnabled(): boolean {
  return process.env.USE_PROMIDAS_REPOSITORY === 'true';
}
