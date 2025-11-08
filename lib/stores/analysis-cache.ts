import type { PrototypeAnalysis } from '@/lib/utils/prototype-analysis';
import { logger as baseLogger } from '@/lib/logger';

/**
 * Cached analysis entry with metadata
 */
type CachedAnalysis = {
  /** The analysis result */
  analysis: PrototypeAnalysis;
  /** When this analysis was cached */
  cachedAt: Date;
  /** Parameters used to generate this analysis */
  params: {
    limit: number;
    offset: number;
    totalCount: number;
  };
  /** Cache key for identification */
  key: string;
};

/**
 * Configuration for analysis cache behavior
 */
type AnalysisCacheConfig = {
  /** Maximum number of cached analyses (default: 50) */
  maxEntries?: number;
  /** TTL in milliseconds (default: 30 minutes) */
  ttlMs?: number;
};

/**
 * In-memory cache for prototype analyses
 */
class AnalysisCache {
  private cache = new Map<string, CachedAnalysis>();
  private readonly maxEntries: number;
  private readonly ttlMs: number;
  private readonly logger = baseLogger.child({ component: 'AnalysisCache' });

  constructor(config: AnalysisCacheConfig = {}) {
    this.maxEntries = config.maxEntries ?? 50;
    this.ttlMs = config.ttlMs ?? 30 * 60 * 1000; // 30 minutes

    this.logger.debug(
      { maxEntries: this.maxEntries, ttlMs: this.ttlMs },
      'Analysis cache initialized',
    );
  }

  /**
   * Generate a cache key from analysis parameters
   */
  private generateKey(params: { limit: number; offset: number; totalCount: number }): string {
    return `analysis:${params.limit}:${params.offset}:${params.totalCount}`;
  }

  /**
   * Check if a cache entry is expired
   */
  private isExpired(entry: CachedAnalysis): boolean {
    return Date.now() - entry.cachedAt.getTime() > this.ttlMs;
  }

  /**
   * Clean expired entries from cache
   */
  private cleanExpired(): void {
    const beforeCount = this.cache.size;
    let removedCount = 0;

    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        removedCount++;
      }
    });

    if (removedCount > 0) {
      this.logger.debug(
        { beforeCount, afterCount: this.cache.size, removedCount },
        'Cleaned expired cache entries',
      );
    }
  }

  /**
   * Ensure cache size doesn't exceed maximum
   */
  private enforceMaxSize(): void {
    if (this.cache.size <= this.maxEntries) {
      return;
    }

    // Remove oldest entries (LRU-like behavior)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.cachedAt.getTime() - b.cachedAt.getTime(),
    );

    const toRemove = this.cache.size - this.maxEntries;
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }

    this.logger.debug(
      { removedCount: toRemove, currentSize: this.cache.size },
      'Enforced cache size limit',
    );
  }

  /**
   * Store an analysis result in cache
   */
  set(
    analysis: PrototypeAnalysis,
    params: { limit: number; offset: number; totalCount: number },
  ): void {
    const key = this.generateKey(params);

    const cached: CachedAnalysis = {
      analysis,
      cachedAt: new Date(),
      params,
      key,
    };

    this.cache.set(key, cached);

    this.logger.debug(
      {
        key,
        totalCount: analysis.totalCount,
        birthdayCount: analysis.anniversaries.birthdayCount,
        cacheSize: this.cache.size,
      },
      'Analysis cached',
    );

    // Maintenance
    this.cleanExpired();
    this.enforceMaxSize();
  }

  /**
   * Retrieve an analysis result from cache
   */
  get(params: { limit: number; offset: number; totalCount: number }): CachedAnalysis | null {
    const key = this.generateKey(params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.logger.debug({ key }, 'Cache miss');
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.logger.debug({ key }, 'Cache hit but expired, removed');
      return null;
    }

    this.logger.debug({ key }, 'Cache hit');
    return entry;
  }

  /**
   * Get all cached analyses (for administrative purposes)
   */
  getAll(): CachedAnalysis[] {
    this.cleanExpired();
    return Array.from(this.cache.values()).sort(
      (a, b) => b.cachedAt.getTime() - a.cachedAt.getTime(),
    );
  }

  /**
   * Get the most recent analysis regardless of parameters
   */
  getLatest(): CachedAnalysis | null {
    this.cleanExpired();

    const entries = Array.from(this.cache.values());
    if (entries.length === 0) {
      return null;
    }

    return entries.reduce((latest, current) =>
      current.cachedAt > latest.cachedAt ? current : latest,
    );
  }

  /**
   * Clear all cached analyses
   */
  clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    this.logger.info({ clearedCount: count }, 'Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxEntries: number;
    ttlMs: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    this.cleanExpired();

    const entries = Array.from(this.cache.values());
    const dates = entries.map((e) => e.cachedAt);

    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      ttlMs: this.ttlMs,
      oldestEntry: dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null,
      newestEntry: dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null,
    };
  }
}

// Global singleton instance
const analysisCache = new AnalysisCache();

export { analysisCache, type CachedAnalysis, type AnalysisCacheConfig };
