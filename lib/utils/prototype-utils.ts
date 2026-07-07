import { parseUsername } from 'promidas-utils/utils';
import type { ResultOfListPrototypesApiResponse } from 'protopedia-api-v2-client';

export type SortOrder = 'asc' | 'desc';

const toNumericId = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Compare two records with numeric id fields according to sort order.
 */
export function compareById<T extends { id?: number | null }>(
  left: T,
  right: T,
  order: SortOrder = 'asc',
): number {
  const leftId = toNumericId(left.id) ?? Number.POSITIVE_INFINITY;
  const rightId = toNumericId(right.id) ?? Number.POSITIVE_INFINITY;
  const diff = leftId - rightId;
  return order === 'asc' ? diff : -diff;
}

/**
 * Sort prototypes by their numeric ID in the requested order without mutating the input.
 * @param prototypes Records to sort.
 * @param order Sort direction (`asc` by default for ascending order).
 * @returns New array sorted according to the provided order.
 */
export function sortPrototypesById<T extends { id: number }>(
  prototypes: T[],
  order: SortOrder = 'asc',
): T[] {
  return prototypes.slice().sort((a, b) => compareById(a, b, order));
}

/**
 * Return the smallest numeric prototype id present in the response data.
 */
export function getMinPrototypeId(
  prototypes: ResultOfListPrototypesApiResponse[],
): number | undefined {
  let minId: number | undefined;

  for (const prototype of prototypes) {
    const currentId = toNumericId(prototype.id);
    if (currentId === undefined) {
      continue;
    }

    if (minId === undefined || currentId < minId) {
      minId = currentId;
    }
  }

  return minId;
}

/**
 * Return the largest numeric prototype id present in the response data.
 */
export function getMaxPrototypeId(
  prototypes: ResultOfListPrototypesApiResponse[],
): number | undefined {
  let maxId: number | undefined;

  for (const prototype of prototypes) {
    const currentId = toNumericId(prototype.id);
    if (currentId === undefined) {
      continue;
    }

    if (maxId === undefined || currentId > maxId) {
      maxId = currentId;
    }
  }

  return maxId;
}

const PROTOPEDIA_PROTOTYPE_BASE_URL = 'https://protopedia.net/prototype';
export const buildPrototypeLink = (prototypeId: number): string => {
  return `${PROTOPEDIA_PROTOTYPE_BASE_URL}/${prototypeId}`;
};

const PROTOPEDIA_TAG_BASE_URL = 'https://protopedia.net/tag';
export const buildTagLink = (tag: string): string => {
  const url = new URL(PROTOPEDIA_TAG_BASE_URL);
  url.searchParams.set('tag', tag);
  return url.toString();
};

const PROTOPEDIA_MATERIAL_BASE_URL = 'https://protopedia.net/material';
/**
 * Link to a material page. ProtoPedia's canonical material URL is
 * `/material/{id}` (numeric), e.g. https://protopedia.net/material/1863.
 *
 * We only have the material NAME (prototype data carries no material id), so
 * this links by name via `/material/{name}`. ProtoPedia resolves that to the id
 * page for SOME materials (e.g. `Arduino` -> /material/558) but NOT all:
 * long-tail names fall back to the home page (e.g. `SG-90`), and names
 * containing `/` return 404 (an encoded slash is rejected in the path). Linking
 * by name is therefore best-effort, not guaranteed.
 *
 * A reliable id-based link would need name -> id resolution via the material
 * list API, which is not implemented yet (deferred).
 *
 * @param material The material name to link to.
 * @returns Best-effort URL to the material page.
 */
export const buildMaterialLink = (material: string): string => {
  return `${PROTOPEDIA_MATERIAL_BASE_URL}/${encodeURIComponent(material)}`;
};

/**
 * The name to show for a `users` element: the display name if set, otherwise
 * the `@profileId` handle (a maker with no display name is stored as
 * `@profileId`, e.g. `@yuukankin`, which we surface verbatim with its `@`).
 * Falls back to the raw string only for fully malformed input (no profileId).
 */
export const getUserDisplayName = (user: string): string => {
  const { displayName, profileId } = parseUsername(user);
  return displayName || (profileId ? '@' + profileId : user);
};

const PROTOPEDIA_PROTOTYPER_BASE_URL = 'https://protopedia.net/prototyper';
/**
 * Best-effort ProtoPedia author-page URL for a `users` element. The page is
 * `.../prototyper/{profileId}` — the numeric `createId` and mutable display names do
 * NOT resolve — and the profileId is recovered from the string via
 * {@link parseUsername}.
 *
 * ⚠️ NOT GUARANTEED: returns `null` when no profileId can be extracted, and even a
 * non-null URL is only as correct as the embedded profileId. Callers should fall
 * back to plain text when this is `null`.
 *
 * @param user A single `users` element ("表示名@profileId").
 * @returns The author-page URL, or `null` when no profileId is available.
 */
export const buildUserLink = (user: string): string | null => {
  const { profileId } = parseUsername(user);
  if (profileId === '') return null;
  return `${PROTOPEDIA_PROTOTYPER_BASE_URL}/${encodeURIComponent(profileId)}`;
};
