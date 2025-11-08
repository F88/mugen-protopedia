import { fetchRandomPrototype, getRandomPrototypeFromMapOrFetch } from '@/app/actions/prototypes';
import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { logger } from '@/lib/logger.client';

const FALLBACK_LIMIT = 500;
const FALLBACK_OFFSET = 0;

const resolveErrorMessage = (value: unknown): string => {
  if (value instanceof Error) {
    return value.message;
  }

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return 'Failed to fetch random prototype.';
};

export const getRandomPrototypeData = async (): Promise<NormalizedPrototype | null> => {
  logger.debug('getRandomPrototypeData called');

  const mapResult = await getRandomPrototypeFromMapOrFetch();

  if (mapResult.ok) {
    return mapResult.data;
  }

  if (mapResult.status === 404) {
    return null;
  }

  if (mapResult.status !== 503) {
    const message = resolveErrorMessage(mapResult.error);
    logger.error('getRandomPrototypeData failed via map fetch', {
      status: mapResult.status,
      message,
    });
    throw new Error(message);
  }

  const fallback = await fetchRandomPrototype({
    limit: FALLBACK_LIMIT,
    offset: FALLBACK_OFFSET,
  });

  if (!fallback.ok) {
    const message = resolveErrorMessage(fallback.error);
    logger.error('getRandomPrototypeData failed via fallback fetch', {
      status: fallback.status,
      message,
    });
    throw new Error(message);
  }

  return fallback.data;
};
