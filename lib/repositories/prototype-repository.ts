import {
  fetchPrototypeById,
  getPrototypeByIdFromMapOrFetch,
} from '@/app/actions/prototypes';

import { type PrototypeForMpp } from '@/lib/api/prototypes';
import { logger } from '@/lib/logger.client';
import { constructDisplayMessage } from '@/lib/network-utils';

import { PrototypeRepository } from './types';

// Simple repository for fetching prototypes via server functions.
// Components should depend on this repository instead of calling fetch directly.
export const prototypeRepository: PrototypeRepository = {
  async getByPrototypeId(id: number): Promise<undefined | PrototypeForMpp> {
    logger.info('prototypeRepository.getByPrototypeId called', { id });
    const stringId = String(id);

    const mapResult = await getPrototypeByIdFromMapOrFetch(stringId);

    if (mapResult.ok) {
      logger.debug(
        'PrototypeRepository.getByPrototypeId served from map store',
        {
          id,
          hasImage: Boolean(mapResult.data.mainUrl),
        },
      );
      return mapResult.data;
    }

    if (mapResult.status === 503) {
      logger.warn(
        'prototypeRepository.getByPrototypeId map store unavailable, falling back',
        {
          id,
        },
      );
    } else {
      logger.warn('prototypeRepository.getByPrototypeId map lookup failed', {
        id,
        status: mapResult.status,
        error: mapResult.error,
      });
    }

    const result = await fetchPrototypeById(stringId);

    if (!result.ok) {
      logger.warn('prototypeRepository.getByPrototypeId fallback failed', {
        id,
        status: result.status,
        error: result.error,
      });

      if (result.status === 404) {
        return undefined;
      }

      throw new Error(constructDisplayMessage(result));
    }

    logger.debug(
      'PrototypeRepository.getByPrototypeId fetched data (fallback)',
      {
        id,
        hasImage: Boolean(result.data.mainUrl),
      },
    );

    return result.data;
  },
};
