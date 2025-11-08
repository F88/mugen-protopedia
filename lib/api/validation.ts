import { NextResponse } from 'next/server';

type Logger = {
  warn: (obj: unknown, msg?: string) => void;
};

export type LimitOffset = { limit: number; offset: number };

/**
 * Parse and validate `limit` and `offset` query parameters from a Request URL.
 * - Ensures both are integers in string form
 * - Applies defaults when absent
 * - Clamps limit to `maxLimit`
 * - Returns a NextResponse with 400 on validation error (messages kept stable)
 */
export function parseLimitOffsetFromRequest(
  req: Request,
  defaultLimit: number,
  maxLimit: number,
): { ok: true; value: LimitOffset } | { ok: false; response: NextResponse } {
  const url = new URL(req.url);
  const limitParam = url.searchParams.get('limit');
  const offsetParam = url.searchParams.get('offset');

  const limitRaw = limitParam ?? String(defaultLimit);
  const offsetRaw = offsetParam ?? '0';

  if (!/^\d+$/.test(limitRaw) || !/^\d+$/.test(offsetRaw)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid query. limit and offset must be positive integers.' },
        { status: 400 },
      ),
    };
  }

  let limit = Number.parseInt(limitRaw, 10);
  const offset = Number.parseInt(offsetRaw, 10);

  if (!Number.isFinite(limit) || limit <= 0) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid limit. Must be a positive integer.' },
        { status: 400 },
      ),
    };
  }

  if (!Number.isFinite(offset) || offset < 0) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid offset. Must be a non-negative integer.' },
        { status: 400 },
      ),
    };
  }

  // Clamp overly large limits to protect upstream
  limit = Math.min(limit, maxLimit);

  return { ok: true, value: { limit, offset } };
}

/**
 * Parse and validate a positive integer `id` from a string (e.g., route param).
 * - Returns uniform 400 responses on invalid input with stable messages
 */
export function parsePositiveId(
  idStr: string | undefined,
  logger?: Logger,
): { ok: true; value: number } | { ok: false; response: NextResponse } {
  const trimmed = idStr?.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    logger?.warn({ id: idStr }, 'Invalid prototype id');
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid prototype id. Expected a positive integer.' },
        { status: 400 },
      ),
    };
  }

  const id = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(id) || id <= 0) {
    logger?.warn({ id }, 'Prototype id must be > 0');
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid prototype id. Must be a positive integer.' },
        { status: 400 },
      ),
    };
  }

  return { ok: true, value: id };
}
