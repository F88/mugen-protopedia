import { fetchPrototypesNoStore } from '@/app/actions/prototypes-gateway';

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { logger } from '@/lib/logger.client';
import { constructDisplayMessage } from '@/lib/network-utils';

export const getLatestPrototypeById = async (
  id: number,
): Promise<PrototypeForMpp | null> => {
  logger.debug('getLatestPrototypeById called', { id });
  const result = await fetchPrototypesNoStore({
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
  logger.debug('Fetched latest prototype', { prototype: result.data[0] });
  return result.data[0] ?? null;
};
