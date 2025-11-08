import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { logger } from '@/lib/logger.client';
import { prototypeRepository } from '@/lib/repositories/prototype-repository';

type GetPrototypesOptions = {
  limit?: number;
  offset?: number;
  prototypeId?: number;
};

/**
 * limit 考察
 *
 * 実測結果により  1,000 or 10,000 が最適
 * 実測結果では limit=1, limit=1000 でも約3秒で帰ってくる.
 * APIサーバー側でCDNが効いている、もしくはなんらの工夫により取得件数増大に伴う性能問題を回避していると思われる。
 */
const defaultLimit = 10;

export const getPrototypes = async ({
  limit = defaultLimit,
  offset = 0,
  prototypeId,
}: GetPrototypesOptions): Promise<NormalizedPrototype[]> => {
  const startTime = performance.now();
  logger.debug('getPrototypes called', { limit, offset, prototypeId });

  const result = await prototypeRepository.list({ limit, offset, prototypeId });

  const endTime = performance.now();
  const elapsedMs = endTime - startTime;

  logger.debug('getPrototypes completed', {
    limit,
    offset,
    prototypeId,
    resultCount: result.length,
    elapsedMs: Math.round(elapsedMs * 100) / 100, // 小数点以下2桁まで
  });

  return result;
};
