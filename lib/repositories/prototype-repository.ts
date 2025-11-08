import {
  fetchPrototypeById,
  getAllPrototypesFromMapOrFetch,
  getPrototypeByIdFromMapOrFetch,
  getPrototypesFromCacheOrFetch,
} from '@/app/actions/prototypes';
import { type NormalizedPrototype } from '@/lib/api/prototypes';
import { logger } from '@/lib/logger.client';
import { PrototypeRepository } from './types';

const MAX_MAP_THRESHOLD = 10_000;

// Simple repository for fetching prototypes via server functions.
// Components should depend on this repository instead of calling fetch directly.
export const prototypeRepository: PrototypeRepository = {
  async getAll(): Promise<NormalizedPrototype[]> {
    // logger.info('prototypeRepository.getAll called');

    const mapResult = await getAllPrototypesFromMapOrFetch();

    if (mapResult.ok) {
      // logger.debug('PrototypeRepository.getAll served from map store', {
      // count: mapResult.data.length,
      // });
      if (mapResult.data.length === 0) {
        throw new Error('No prototypes found');
      }
      return mapResult.data;
    }

    logger.warn('prototypeRepository.getAll map store unavailable, attempting fallback', {
      status: mapResult.status,
      error: mapResult.error,
    });

    const fallback = await getPrototypesFromCacheOrFetch({
      limit: MAX_MAP_THRESHOLD,
      offset: 0,
    });

    if (!fallback.ok) {
      throw new Error(`Error fetching prototypes: ${fallback.status} ${fallback.error}`);
    }

    if (fallback.data.length === 0) {
      throw new Error('No prototypes found');
    }

    // logger.debug('PrototypeRepository.getAll served from fallback cache path', {
    // count: fallback.data.length,
    // });

    return fallback.data;
  },

  async list({
    limit = 1,
    offset = 0,
    prototypeId,
  }: { limit?: number; offset?: number; prototypeId?: number } = {}): Promise<
    NormalizedPrototype[]
  > {
    // Log input parameters at info level (browser-safe)
    // logger.info('prototypeRepository.list called', { limit, offset, prototypeId });

    if (prototypeId === undefined && limit >= MAX_MAP_THRESHOLD && offset === 0) {
      const mapResult = await getAllPrototypesFromMapOrFetch();

      if (!mapResult.ok) {
        throw new Error(`Error fetching prototypes: ${mapResult.status} ${mapResult.error}`);
      }

      if (mapResult.data.length === 0) {
        throw new Error('No prototypes found');
      }

      // logger.debug('PrototypeRepository.list served from map store', {
      // limit,
      // offset,
      // count: mapResult.data.length,
      // });

      const sliced = mapResult.data.slice(offset, offset + limit);

      if (sliced.length === 0) {
        throw new Error('No prototypes found');
      }

      return sliced;
    }

    const result = await getPrototypesFromCacheOrFetch({ limit, offset, prototypeId });

    if (!result.ok) {
      throw new Error(`Error fetching prototypes: ${result.status} ${result.error}`);
    }

    logger.debug('PrototypeRepository.list fetched data', {
      limit,
      offset,
      prototypeId,
      count: result.data.length,
    });

    if (result.data.length === 0) {
      throw new Error('No prototypes found');
    }

    return result.data;
  },

  async getByPrototypeId(id: number): Promise<undefined | NormalizedPrototype> {
    logger.info('prototypeRepository.getByPrototypeId called', { id });
    const stringId = String(id);

    const mapResult = await getPrototypeByIdFromMapOrFetch(stringId);

    if (mapResult.ok) {
      logger.debug('PrototypeRepository.getByPrototypeId served from map store', {
        id,
        hasImage: Boolean(mapResult.data.mainUrl),
      });
      return mapResult.data;
    }

    if (mapResult.status === 404) {
      logger.warn('prototypeRepository.getByPrototypeId not found in map store', {
        id,
      });
      return undefined;
    }

    if (mapResult.status === 503) {
      logger.warn('prototypeRepository.getByPrototypeId map store unavailable, falling back', {
        id,
      });
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

      throw new Error(`Error fetching prototype by ID: ${result.status} ${result.error}`);
    }

    logger.debug('PrototypeRepository.getByPrototypeId fetched data (fallback)', {
      id,
      hasImage: Boolean(result.data.mainUrl),
    });

    return result.data;
  },

  async getTsv({
    limit = 1,
    offset = 0,
  }: { limit?: number; offset?: number } = {}): Promise<string> {
    logger.info('prototypeRepository.getTsv called');

    const url =
      `/api/prototypes/tsv` +
      `?limit=${encodeURIComponent(String(limit))}&offset=${encodeURIComponent(String(offset))}`;
    const res = await fetch(url, {
      method: 'GET',
      cache: 'force-cache',
      next: {
        revalidate: 60,
      },
    });
    if (!res.ok) {
      throw new Error(`Error fetching prototypes TSV: ${res.status} ${res.statusText}`);
    }
    const tsvData = await res.text();
    logger.debug('PrototypeRepository.getTsv fetched data', {
      length: tsvData.length,
    });
    return tsvData;
  },
};
