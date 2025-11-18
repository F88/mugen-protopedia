/**
 * Utilities for building playlist URLs and working with ProtoPedia prototype IDs.
 *
 * Responsibilities:
 * - Extract prototype page URLs from arbitrary text.
 * - Derive numeric prototype IDs from ProtoPedia URLs.
 * - Parse loosely formatted ID input from textareas.
 * - Sort and deduplicate ID lists.
 * - Build a shareable playlist URL from IDs and an optional title.
 */

import { APP_URL } from '@/lib/config/app-constants';
import { splitGraphemes } from '@/lib/utils';
import { logger } from '@/lib/logger.client';

const PROTOTYPE_URL_GLOBAL_REGEX =
  /https?:\/\/[\w.-]+\/[\w\-./?#[\]@!$&'()*+,;=%]+/gi;
const PROTOTYPE_HREF_REGEX = /href=["']([^"']+)["']/gi;
const PROTOTYPE_URL_ID_SEGMENT_REGEX = /prototype\/(\d+)/;

/**
 * Returns true when the given string is a ProtoPedia prototype page URL.
 *
 * Requirements:
 * - Scheme must be `https://` (http is not allowed).
 * - Origin must be exactly `https://protopedia.net` (no subdomains).
 * - Path must be `/prototype/<numeric-id>` with no extra path segments.
 * - Optional query string (`?`) and/or fragment (`#`) are allowed.
 * - The input is not trimmed; leading/trailing spaces cause a non-match.
 */
export function isPrototypeUrl(url: string): boolean {
  if (!url || url.length === 0) return false;
  const pattern = /^(https:\/\/protopedia\.net\/prototype\/\d+)(?:[?#].*)?$/;
  return pattern.test(url);
}

/**
 * Extracts all ProtoPedia prototype page URLs from a free-form string.
 *
 * - Extracts only URLs that would satisfy {@link isPrototypeUrl}.
 * - Returns unique URLs in the order they appear.
 * - Ignores non-matching substrings.
 * - When `baseUrl` is provided, also considers `<a href="...">` style
 *   values (including relative paths) and resolves them against the
 *   base URL prior to filtering.
 */
export function extractPrototypeUrls(raw: string, baseUrl?: string): string[] {
  if (!raw || raw.length === 0) return [];
  logger.debug(
    {
      rawLength: raw.length,
      baseUrl,
    },
    'extractPrototypeUrls: start',
  );
  const found: string[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  const regex = new RegExp(PROTOTYPE_URL_GLOBAL_REGEX); // new instance per call
  while ((match = regex.exec(raw)) !== null) {
    const whole = match[0];
    if (!seen.has(whole) && isPrototypeUrl(whole)) {
      seen.add(whole);
      found.push(whole);
    }
  }

  if (baseUrl && baseUrl.length > 0) {
    logger.debug(
      { baseUrl },
      'extractPrototypeUrls: baseUrl provided for relative href resolution',
    );
    let hrefMatch: RegExpExecArray | null;
    const hrefRegex = new RegExp(PROTOTYPE_HREF_REGEX); // new instance per call
    while ((hrefMatch = hrefRegex.exec(raw)) !== null) {
      const hrefValue = hrefMatch[1];
      if (!hrefValue || hrefValue.length === 0) {
        continue;
      }

      try {
        const absolute = new URL(hrefValue, baseUrl).toString();
        if (!seen.has(absolute) && isPrototypeUrl(absolute)) {
          seen.add(absolute);
          found.push(absolute);
        }
      } catch {
        // Ignore invalid URLs or resolution errors
      }
    }
  }

  // Debug: log how many prototype URLs were extracted in total
  if (found.length > 0) {
    logger.debug(
      {
        count: found.length,
        urlsPreview: found.join(', '),
      },
      'extractPrototypeUrls: extracted prototype URLs',
    );
  } else {
    logger.debug(
      {
        baseUrl,
      },
      'extractPrototypeUrls: no prototype URLs found',
    );
  }
  return found;
}

/**
 * Normalizes a list of ProtoPedia URLs to their numeric prototype IDs.
 *
 * - Considers only URLs that satisfy {@link isPrototypeUrl}.
 * - Extracts the numeric segment after `/prototype/`.
 * - Filters out invalid or negative values.
 * - Returns unique IDs in first-seen order.
 */
export function normalizeIdsFromUrls(urls: string[]): number[] {
  logger.debug({ urlCount: urls.length }, 'normalizeIdsFromUrls: start');
  const result: number[] = [];
  const seen = new Set<number>();
  for (const url of urls) {
    if (!isPrototypeUrl(url)) continue;
    const m = PROTOTYPE_URL_ID_SEGMENT_REGEX.exec(url);
    if (!m) continue;
    const num = parseInt(m[1], 10);
    if (!Number.isNaN(num) && num >= 0 && !seen.has(num)) {
      seen.add(num);
      result.push(num);
    }
  }
  logger.debug(
    { idCount: result.length, ids: result },
    'normalizeIdsFromUrls: done',
  );
  return result;
}

/**
 * Parses numeric prototype IDs from textarea-style input.
 *
 * Expected valid characters are:
 * - Half-width digits `0-9`.
 * - Newline characters (LF `\n`, CRLF `\r\n`, or CR `\r`).
 * - Empty lines (no characters) are allowed and ignored.
 *
 * Behavior:
 * - Splits input by newline characters.
 * - For each non-empty line consisting only of digits, parses it as a
 *   non-negative integer.
 * - Lines containing any non-digit character are treated as invalid and
 *   ignored by this function (they should be rejected at validation layer).
 * - Keeps duplicates and preserves line order.
 */
export function parsePrototypeIdLines(input: string): number[] {
  if (!input || input.length === 0) return [];
  logger.debug({ inputLength: input.length }, 'parsePrototypeIdLines: start');
  const lines = input.split(/\r?\n|\r/);
  const out: number[] = [];

  for (const line of lines) {
    if (line === '') continue; // allow and ignore empty lines
    if (!/^\d+$/.test(line)) {
      // Invalid line (contains non-digit characters) is ignored here.
      continue;
    }
    const num = parseInt(line, 10);
    if (!Number.isNaN(num) && num >= 0) {
      out.push(num);
    }
  }
  logger.debug(
    { lineCount: lines.length, idCount: out.length, ids: out },
    'parsePrototypeIdLines: done',
  );
  return out;
}

/**
 * Returns a new array with IDs sorted in ascending numeric order.
 *
 * Duplicates are preserved; only the order is changed.
 */
export function sortIdsWithDuplicates(ids: number[]): number[] {
  logger.debug({ count: ids.length, ids }, 'sortIdsWithDuplicates: start');
  const sorted = [...ids].sort((a, b) => a - b);
  logger.debug(
    { count: sorted.length, ids: sorted },
    'sortIdsWithDuplicates: done',
  );
  return sorted;
}

/**
 * Removes duplicate IDs while preserving the order of first occurrence.
 *
 * Example: [1, 5, 2, 5, 2] -> [1, 5, 2].
 */
export function deduplicateIdsPreserveOrder(ids: number[]): number[] {
  logger.debug(
    { count: ids.length, ids },
    'deduplicateIdsPreserveOrder: start',
  );
  const seen = new Set<number>();
  const result: number[] = [];
  for (const id of ids) {
    if (!seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }
  logger.debug(
    { count: result.length, ids: result },
    'deduplicateIdsPreserveOrder: done',
  );
  return result;
}

/**
 * Builds a shareable playlist URL from a list of IDs and optional title.
 *
 * - Uses `APP_URL` as the origin.
 * - Encodes IDs as a comma-separated `id` query parameter when any IDs
 *   are provided.
 * - Adds a `title` query parameter when a non-empty title is provided
 *   and its grapheme length (user-perceived characters) is within the
 *   direct-launch limit (300). The title is used as-is without
 *   trimming; callers are responsible for any additional
 *   normalization.
 * - When neither IDs nor title are valid, returns an empty string.
 */
export function buildPlaylistUrl(ids: number[], title: string): string {
  // Guard early: when neither IDs nor title are even candidates,
  // there is no meaningful playlist URL to build.
  if ((!ids || ids.length === 0) && (!title || title.length === 0)) {
    logger.debug({}, 'buildPlaylistUrl: skipped (no ids and empty title)');
    return '';
  }

  const params = new URLSearchParams();

  // Basic validation: only keep non-negative integers as IDs.
  const safeIds = ids.filter((id) => Number.isInteger(id) && id >= 0);
  if (safeIds.length > 0) {
    params.set('id', safeIds.join(','));
  }

  // NOTE: We intentionally do not trim the title here. The
  // direct-launch validation layer uses the same 300-character limit
  // (based on grapheme clusters). This builder mirrors that
  // constraint and otherwise encodes the provided value as-is when it
  // is non-empty.
  const titleGraphemes = splitGraphemes(title);
  if (titleGraphemes.length > 0 && titleGraphemes.length <= 300) {
    params.set('title', title);
  }

  const query = params.toString();
  if (query.length === 0) {
    // When neither IDs nor title are valid, there is no meaningful
    // playlist URL to build.
    logger.debug(
      { ids: safeIds, title },
      'buildPlaylistUrl: skipped (no valid ids/title)',
    );
    return '';
  }

  // Note: The path segment is not significant for playlist detection;
  // play mode is resolved purely from the presence of `id` / `title`
  // query parameters.
  const url = `${APP_URL}/?${query}`;
  logger.debug(
    { ids: safeIds, title, url },
    'buildPlaylistUrl: built playlist URL',
  );
  return url;
}
