import {
  normalizePrototype as normalizeUpstreamPrototype,
  type UpstreamPrototype,
} from 'promidas/fetcher';
import type { NormalizedPrototype } from 'promidas/types';

export type { UpstreamPrototype };

/**
 * The app-internal prototype type.
 *
 * Alias for promidas's {@link NormalizedPrototype}: the app and the library now
 * share the same normalized shape. The MPP-specific name is kept for clarity at
 * call sites and to avoid a churny rename across the codebase.
 */
export type PrototypeForMpp = NormalizedPrototype;

/**
 * Normalize an upstream prototype into {@link PrototypeForMpp}.
 *
 * Normalization (pipe-separated splitting, JST -> UTC timestamps, and defaults
 * for fields the ProtoPedia API may omit) is delegated entirely to `promidas`,
 * whose output is already the `PrototypeForMpp` shape.
 */
export function normalizePrototypeForMpp(
  p: UpstreamPrototype,
): PrototypeForMpp {
  return normalizeUpstreamPrototype(p);
}
