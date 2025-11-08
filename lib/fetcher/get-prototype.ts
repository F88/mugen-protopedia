import { fetchPrototypeById } from '@/app/actions/prototypes';
import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { logger } from '@/lib/logger.client';

export const getPrototype = async (id: number): Promise<NormalizedPrototype | undefined> => {
  logger.debug('getPrototype called', { id });
  const result = await fetchPrototypeById(String(id));
  if (!result.ok) {
    logger.error('Failed to fetch prototype via server function', {
      id,
      status: result.status,
      error: result.error,
    });
    throw new Error(result.error ?? 'Failed to fetch prototype');
  }
  return result.data;
};
