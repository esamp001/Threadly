/**
 * Simple in-memory cache for thread filtering
 * Provides basic caching functionality to improve API response times
 */

class CacheHelper {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Generate cache key for filtered threads
   * @param {string} filter - The filter type (hot, latest, top)
   * @param {number} page - Page number
   * @param {number} limit - Page limit
   * @param {string} userId - User ID for personalization
   * @returns {string} Cache key
   */
  generateKey(filter, page, limit, userId) {
    return `threads:${filter}:${page}:${limit}:${userId || 'anonymous'}`;
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {object|null} Cached data or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set cache data
   * @param {string} key - Cache key
   * @param {object} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl
    });
  }

  /**
   * Clear cache for specific filter
   * @param {string} filter - Filter type to clear
   */
  clearFilter(filter) {
    for (const [key] of this.cache) {
      if (key.startsWith(`threads:${filter}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all thread cache
   */
  clearAll() {
    for (const [key] of this.cache) {
      if (key.startsWith('threads:')) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
const cache = new CacheHelper();
module.exports = cache;
