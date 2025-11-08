import { createProtoPediaClient } from 'protopedia-api-v2-client';
import { logger as baseLogger } from '@/lib/logger';

const accessToken = process.env.PROTOPEDIA_API_V2_TOKEN;
const baseUrl = process.env.PROTOPEDIA_API_V2_BASE_URL;
const logLevel =
  (process.env.PROTOPEDIA_API_V2_LOG_LEVEL as
    | 'silent'
    | 'error'
    | 'warn'
    | 'info'
    | 'debug'
    | undefined) ?? 'error';

// console.debug('process.env.PROTOPEDIA_API_V2_TOKEN', process.env.PROTOPEDIA_API_V2_TOKEN);

// Check if token is set and valid (not a placeholder)
const validToken = accessToken && accessToken !== 'your_token_here' ? accessToken : undefined;

if (!validToken) {
  baseLogger.warn(
    'PROTOPEDIA_API_V2_TOKEN is not set or is using placeholder value. Attempting to access API without authentication.',
  );
}

baseLogger.debug({ logLevel }, 'ProtoPedia client configuration');
export const protopedia = createProtoPediaClient({
  token: validToken,
  baseUrl,
  fetch: (url, init) =>
    globalThis.fetch(url, {
      ...init,
      cache: 'force-cache',
      next: {
        revalidate: 60,
      },
    }),
  // Reduce noisy logs in development; can be overridden via env
  logLevel,
});

// Lightweight helper for prototype detail by id
// Uses the same env-driven configuration as the client above.
export class ProtopediaApiError extends Error {
  status?: number;
  body?: string;
}

export async function getPrototypeById(id: number): Promise<{
  prototypeNm?: string;
  mainUrl?: string;
  freeComment?: string;
  teamNm?: string;
} | null> {
  const resolvedBaseUrl = (baseUrl || 'https://protopedia.net/v2/api').replace(/\/$/, '');
  const url = `${resolvedBaseUrl}/prototypes/${id}`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (validToken) {
    headers.Authorization = `Bearer ${validToken}`;
  }

  const res = await fetch(url, {
    headers,
    method: 'GET',
    cache: 'force-cache',
    next: {
      revalidate: 60,
    },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new ProtopediaApiError(`Upstream error: ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  return (await res.json()) as {
    prototypeNm?: string;
    mainUrl?: string;
    freeComment?: string;
    teamNm?: string;
  };
}
