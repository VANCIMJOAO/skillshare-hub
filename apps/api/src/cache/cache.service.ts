import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Reset entire cache
   */
  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  /**
   * Get or set pattern - if not in cache, execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    let value = await this.get<T>(key);

    if (value === undefined) {
      value = await factory();
      await this.set(key, value, ttl);
    }

    return value;
  }

  /**
   * Cache wrapper for method results
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    return await this.cacheManager.wrap(key, fn, ttl);
  }

  /**
   * Generate cache key for workshops
   */
  getWorkshopKey(id: number | string): string {
    return `workshop:${id}`;
  }

  /**
   * Generate cache key for user profile
   */
  getUserKey(id: number | string): string {
    return `user:${id}`;
  }

  /**
   * Generate cache key for workshop list with filters
   */
  getWorkshopListKey(filters: Record<string, any>): string {
    const sortedKeys = Object.keys(filters).sort();
    const queryString = sortedKeys
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    return `workshops:list:${queryString}`;
  }

  /**
   * Generate cache key for analytics
   */
  getAnalyticsKey(userId?: number, timeRange?: string): string {
    return `analytics:${userId || 'global'}:${timeRange || 'all'}`;
  }

  /**
   * Invalidate cache by pattern (for in-memory cache, we clear specific keys)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    // For in-memory cache, we need to clear specific keys
    // In production with Redis, this could use pattern matching
    const commonKeys = [
      `workshops:list:*`,
      `analytics:*`,
      `user:*`,
      `workshop:*`
    ];

    // Clear based on pattern type
    if (pattern.includes('workshop')) {
      await this.del('workshops:list');
    }
    if (pattern.includes('user')) {
      // Clear user-related caches
    }
    if (pattern.includes('analytics')) {
      // Clear analytics caches
    }
  }
}
