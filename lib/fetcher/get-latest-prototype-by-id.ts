import { fetchPrototypesViaNoStoreClient } from '@/app/actions/prototypes';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { logger } from '@/lib/logger.client';
import { constructDisplayMessage } from '@/lib/network-utils';

export const getLatestPrototypeById = async (
  id: number,
): Promise<NormalizedPrototype | null> => {
  // logger.debug('getLatestPrototypeById called', { id });
  const result = await fetchPrototypesViaNoStoreClient({
    prototypeId: id,
    limit: 1,
    offset: 0,
  });
  if (!result.ok) {
    const displayMessage = constructDisplayMessage(result);
    logger.error('Failed to fetch prototype via server function', {
      id,
      status: result.status,
      message: displayMessage,
    });
    throw new Error(displayMessage);
  }
  return result.data[0] ?? null;
};
