/**
 * Cache Manager - Local Storage-based Caching
 * Implements intelligent caching for products with periodic updates for stock/price
 */

const CACHE_KEYS = {
    PRODUCTS: 'ag_products_cache',
    CATEGORIES: 'ag_categories_cache',
    FEATURED: 'ag_featured_cache',
    CACHE_TIMESTAMP: 'ag_cache_timestamp',
    PRODUCT_DETAILS: 'ag_product_details_cache'
}

const CACHE_TTL = {
    PRODUCTS: 24 * 60 * 60 * 1000, // 24 hours for full product data
    CATEGORIES: 7 * 24 * 60 * 60 * 1000, // 7 days
    FEATURED: 60 * 60 * 1000, // 1 hour for featured products
    PRODUCT_DETAILS: 24 * 60 * 60 * 1000 // 24 hours
}

import { indexedCache } from './indexedCache'

export const cacheManager = {
    /**
     * Check if cache is still valid
     * @param {string} key - Cache key
     * @returns {boolean} True if cache is valid
     */
    isCacheValid(key) {
        try {
            const cached = localStorage.getItem(key)
            if (!cached) return false

            const data = JSON.parse(cached)
            const timestamp = data.timestamp || 0
            const ttl = CACHE_TTL[key] || CACHE_TTL.PRODUCTS
            const now = Date.now()

            return (now - timestamp) < ttl
        } catch (error) {
            console.error('Cache validation error:', error)
            return false
        }
    },

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {Object|null} Cached data or null if invalid
     */
    getCache(key) {
        if (!this.isCacheValid(key)) {
            this.clearCache(key)
            return null
        }

        try {
            // Use IndexedDB for large caches (PRODUCTS, PRODUCT_DETAILS, FEATURED)
            if ([CACHE_KEYS.PRODUCTS, CACHE_KEYS.PRODUCT_DETAILS, CACHE_KEYS.FEATURED].includes(key)) {
                return indexedCache.get(key).then(v => v?.data || null).catch(e => {
                    console.error('Indexed cache get error', e)
                    return null
                })
            }

            const cached = localStorage.getItem(key)
            if (!cached) return null
            const data = JSON.parse(cached)
            return data.data || null
        } catch (error) {
            console.error('Cache retrieval error:', error)
            this.clearCache(key)
            return null
        }
    },

    /**
     * Set cache data
     * @param {string} key - Cache key
     * @param {Object} data - Data to cache
     */
    setCache(key, data) {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            }
            if ([CACHE_KEYS.PRODUCTS, CACHE_KEYS.PRODUCT_DETAILS, CACHE_KEYS.FEATURED].includes(key)) {
                // Use IndexedDB for larger entries
                indexedCache.set(key, cacheData).catch(e => console.error('Indexed cache set error', e))
                return
            }

            localStorage.setItem(key, JSON.stringify(cacheData))
        } catch (error) {
            console.error('Cache storage error:', error)
            // Handle quota exceeded error gracefully
            if (error.name === 'QuotaExceededError') {
                this.clearOldestCache()
                // Try again
                try {
                    const cacheData = {
                        data,
                        timestamp: Date.now()
                    }
                    localStorage.setItem(key, JSON.stringify(cacheData))
                } catch (e) {
                    console.error('Cache storage failed after cleanup:', e)
                }
            }
        }
    },

    /**
     * Clear specific cache
     * @param {string} key - Cache key
     */
    clearCache(key) {
        try {
            if ([CACHE_KEYS.PRODUCTS, CACHE_KEYS.PRODUCT_DETAILS, CACHE_KEYS.FEATURED].includes(key)) {
                indexedCache.remove(key).catch(e => console.error('Indexed cache remove error', e))
                return
            }
            localStorage.removeItem(key)
        } catch (error) {
            console.error('Cache clear error:', error)
        }
    },

    /**
     * Clear all caches
     */
    clearAllCaches() {
        Object.values(CACHE_KEYS).forEach(key => {
            this.clearCache(key)
        })
        // Also clear indexed DB store
        indexedCache.clearAll().catch(e => console.error('Indexed cache clearAll error', e))
    },

    /**
     * Clear oldest cache when storage is full
     */
    clearOldestCache() {
        try {
            const keys = Object.values(CACHE_KEYS)
            let oldestKey = null
            let oldestTime = Date.now()

            keys.forEach(key => {
                const cached = localStorage.getItem(key)
                if (cached) {
                    try {
                        const data = JSON.parse(cached)
                        if (data.timestamp < oldestTime) {
                            oldestTime = data.timestamp
                            oldestKey = key
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            })

            if (oldestKey) {
                this.clearCache(oldestKey)
            }
        } catch (error) {
            console.error('Clear oldest cache error:', error)
        }
    },

    /**
     * Update only stock and price in cached products
     * @param {Array} freshProducts - Fresh product data from server
     * @param {Array} cachedProducts - Cached products
     * @returns {Array} Merged products with updated stock/price
     */
    mergeProductUpdates(freshProducts, cachedProducts) {
        if (!Array.isArray(cachedProducts) || !Array.isArray(freshProducts)) {
            return freshProducts
        }

        const freshMap = new Map(freshProducts.map(p => [p.id, p]))

        return cachedProducts.map(cached => {
            const fresh = freshMap.get(cached.id)
            if (fresh) {
                // Update only stock, price, and compareAtPrice
                return {
                    ...cached,
                    stock: fresh.stock,
                    price: fresh.price,
                    compareAtPrice: fresh.compareAtPrice,
                    is_active: fresh.is_active
                }
            }
            return cached
        })
    },

    /**
     * Get cache key
     * @returns {Object} Cache keys object
     */
    getCacheKeys() {
        return CACHE_KEYS
    },

    /**
     * Get cache TTL
     * @returns {Object} Cache TTL object
     */
    getCacheTTL() {
        return CACHE_TTL
    },

    /**
     * Clear specific cache (or all if key is null)
     * @param {string} [key] - Cache key to clear (if null, clears all caches)
     */
    clearSpecificCache(key) {
        if (key) {
            localStorage.removeItem(key)
            indexedCache.clear(key).catch(e => console.error('Error clearing indexed cache:', e))
        } else {
            // Clear all caches
            Object.values(CACHE_KEYS).forEach(cacheKey => {
                localStorage.removeItem(cacheKey)
            })
            indexedCache.clearAll().catch(e => console.error('Error clearing all indexed caches:', e))
        }
    }
}

export default cacheManager
