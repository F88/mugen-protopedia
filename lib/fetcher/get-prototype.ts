import { fetchPrototypeById } from '@/app/actions/prototypes';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { logger } from '@/lib/logger.client';
import { constructDisplayMessage } from '@/lib/network-utils';

export const getPrototype = async (
  id: number,
): Promise<NormalizedPrototype | undefined> => {
  // logger.debug('getPrototype called', { id });
  const result = await fetchPrototypeById(String(id));
  if (!result.ok) {
    const displayMessage = constructDisplayMessage(result);
    logger.error('Failed to fetch prototype via server function', {
      id,
      status: result.status,
      message: displayMessage,
    });
    throw new Error(displayMessage);
  }
  return result.data;
};
