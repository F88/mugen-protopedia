export const SKELETON_KINDS = ['static', 'dynamic'] as const;

export type SkeletonKind = (typeof SKELETON_KINDS)[number];

export function hashString(input: string | number): number {
  const s = String(input);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  // Always return non-negative to simplify callers
  return Math.abs(h);
}

/**
 * Pick a skeleton kind deterministically.
 * - When id is provided and is a positive number: use it to pick deterministically
 * - Otherwise: use a stable seed (e.g., useId()) to pick in a SSR-safe way
 */
export function pickSkeletonKind(opts: {
  id?: number;
  seed: string;
}): SkeletonKind {
  const { id, seed } = opts;
  const basis = typeof id === 'number' && id > 0 ? id : seed;
  const idx = hashString(basis) % SKELETON_KINDS.length;
  return SKELETON_KINDS[idx];
}
