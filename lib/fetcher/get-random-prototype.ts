import {
  fetchRandomPrototype,
  getRandomPrototypeFromMapOrFetch,
} from '@/app/actions/prototypes';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { logger } from '@/lib/logger.client';
import { constructDisplayMessage } from '@/lib/network-utils';

const FALLBACK_LIMIT = 500;
const FALLBACK_OFFSET = 0;

export const getRandomPrototypeData =
  async (): Promise<NormalizedPrototype | null> => {
    // logger.debug('getRandomPrototypeData called');

    const mapResult = await getRandomPrototypeFromMapOrFetch();

    if (mapResult.ok) {
      return mapResult.data;
    }

    if (mapResult.status === 404) {
      return null;
    }

    if (mapResult.status !== 503) {
      const displayMessage = constructDisplayMessage(mapResult);

      logger.error('getRandomPrototypeData failed via map fetch', {
        status: mapResult.status,
        message: displayMessage,
      });
      throw new Error(displayMessage);
    }

    const fallback = await fetchRandomPrototype({
      limit: FALLBACK_LIMIT,
      offset: FALLBACK_OFFSET,
    });

    if (!fallback.ok) {
      const displayMessage = constructDisplayMessage(fallback);

      logger.error('getRandomPrototypeData failed via fallback fetch', {
        status: fallback.status,
        message: displayMessage,
      });
      throw new Error(displayMessage);
    }

    return fallback.data;
  };
