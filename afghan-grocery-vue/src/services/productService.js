/**
 * Products Service - Supabase Implementation
 * Handles all product-related database operations
 */
import { supabase } from '../lib/supabase'
import { cacheManager } from '../utils/cacheManager'

// Helper to get localized field based on current language
const getLocalizedField = (obj, field, lang = 'en') => {
    return obj[`${field}_${lang}`] || obj[`${field}_en`] || obj[field]
}

export const productService = {
    /**
     * Get all products with optional filters
     * @param {Object} filters - Filter options
     * @param {number} [filters.category] - Category ID
     * @param {string} [filters.search] - Search query
     * @param {number} [filters.minPrice] - Minimum price
     * @param {number} [filters.maxPrice] - Maximum price
     * @param {boolean} [filters.featured] - Filter featured products
     * @param {number} [filters.page] - Page number (default: 1)
     * @param {number} [filters.limit] - Items per page (default: 20)
     * @param {string} [filters.lang] - Language code (default: 'en')
     * @returns {Promise<Object>} Products data with pagination
     */
    async getAll(filters = {}) {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            featured,
            page = 1,
            limit = 40,
            lang = 'en'
        } = filters

        // Only use cache for unfiltered requests on page 1
        const cacheKey = cacheManager.getCacheKeys().PRODUCTS
        const shouldUseCache = !category && !search && minPrice === undefined && maxPrice === undefined && !featured && page === 1

        if (shouldUseCache) {
            const cached = cacheManager.getCache(cacheKey)
            if (cached && cached.products) {
                // Defensive check: if cached product array looks unexpectedly small
                // compared to the recorded total or requested limit, invalidate it
                const cachedCount = Array.isArray(cached.products) ? cached.products.length : 0
                const expected = Math.min(limit, cached.total || limit)
                if (cachedCount > 0 && cachedCount < expected) {
                    // Cache appears incomplete/outdated (e.g. contains only 4 items)
                    console.warn('[productService] Invalid product cache detected (cachedCount:', cachedCount, 'expected:', expected, '). Clearing cache and refetching.')
                    cacheManager.clearCache(cacheKey)
                } else {
                    // Fetch fresh data for stock/price updates in background
                    this.refreshProductCache()
                    return cached
                }
            }
        }

        let query = supabase
            .from('products')
            .select('*, categories(id, name_en, name_de, name_fr, name_ps, name_fa, slug)', { count: 'exact' })
            .eq('is_active', true)

        // Apply filters
        if (category) {
            query = query.eq('category_id', category)
        }

        if (search) {
            query = query.or(`name_en.ilike.%${search}%,name_de.ilike.%${search}%,name_fr.ilike.%${search}%,name_ps.ilike.%${search}%,name_fa.ilike.%${search}%,description_en.ilike.%${search}%`)
        }

        if (minPrice !== undefined) {
            query = query.gte('price', minPrice)
        }

        if (maxPrice !== undefined) {
            query = query.lte('price', maxPrice)
        }

        if (featured !== undefined) {
            query = query.eq('featured', featured)
        }

        // Pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        // Order by
        query = query.order('created_at', { ascending: false })

        const { data, error, count } = await query

        if (error) throw error

        const response = {
            products: data,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }

        // Cache only unfiltered, paginated results
        if (shouldUseCache) {
            cacheManager.setCache(cacheKey, response)
        }

        return response
    },

    /**
     * Refresh product cache with fresh stock/price data
     * @private
     */
    async refreshProductCache() {
        try {
            const cached = cacheManager.getCache(cacheManager.getCacheKeys().PRODUCTS)
            if (!cached || !cached.products || cached.products.length === 0) return

            // Fetch only stock and price for cached products
            const productIds = cached.products.map(p => p.id).slice(0, 40) // Only refresh first 40

            const { data: freshData, error } = await supabase
                .from('products')
                .select('id, stock, price, compareAtPrice, is_active')
                .in('id', productIds)

            if (error || !freshData) return

            // Merge updates
            const updated = cacheManager.mergeProductUpdates(freshData, cached.products)

            // Save updated cache
            const updatedCache = {
                ...cached,
                products: updated
            }
            cacheManager.setCache(cacheManager.getCacheKeys().PRODUCTS, updatedCache)
        } catch (error) {
            // Silently fail cache refresh
            console.debug('Cache refresh failed:', error)
        }
    },

    /**
     * Get featured products
     * @param {number} [limit=8] - Number of products to fetch
     * @param {string} [lang='en'] - Language code
     * @returns {Promise<Array>} Featured products
     */
    async getFeatured(limit = 8, lang = 'en') {
        const cacheKey = cacheManager.getCacheKeys().FEATURED

        // Check cache first
        const cached = cacheManager.getCache(cacheKey)
        if (cached && Array.isArray(cached)) {
            // Refresh stock/price in background
            this.refreshFeaturedCache()
            return cached
        }

        const { data, error } = await supabase
            .from('products')
            .select('*, categories(id, name_en, name_de, name_fr, name_ps, name_fa, slug)')
            .eq('is_active', true)
            .eq('featured', true)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        // Cache the result
        cacheManager.setCache(cacheKey, data)
        return data
    },

    /**
     * Refresh featured products cache with fresh data
     * @private
     */
    async refreshFeaturedCache() {
        try {
            const cacheKey = cacheManager.getCacheKeys().FEATURED
            const cached = cacheManager.getCache(cacheKey)
            if (!cached || !Array.isArray(cached)) return

            // Fetch only stock and price for cached products
            const productIds = cached.map(p => p.id)

            const { data: freshData, error } = await supabase
                .from('products')
                .select('id, stock, price, compareAtPrice, is_active')
                .in('id', productIds)

            if (error || !freshData) return

            // Merge updates
            const updated = cacheManager.mergeProductUpdates(freshData, cached)

            // Save updated cache
            cacheManager.setCache(cacheKey, updated)
        } catch (error) {
            // Silently fail cache refresh
            console.debug('Featured cache refresh failed:', error)
        }
    },

    /**
     * Get product by ID
     * @param {number} id - Product ID
     * @param {string} [lang='en'] - Language code
     * @returns {Promise<Object>} Product data
     */
    async getById(id, lang = 'en') {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(id, name_en, name_de, name_fr, name_ps, name_fa, slug)')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    /**
     * Create new product (Admin only)
     * @param {Object} productData - Product data
     * @returns {Promise<Object>} Created product
     */
    async create(productData) {
        const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single()

        if (error) throw error

        // Invalidate product caches
        cacheManager.clearCache(cacheManager.getCacheKeys().PRODUCTS)
        cacheManager.clearCache(cacheManager.getCacheKeys().FEATURED)

        return data
    },

    /**
     * Update product (Admin only)
     * @param {number} id - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise<Object>} Updated product
     */
    async update(id, productData) {
        const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        // Invalidate product caches
        cacheManager.clearCache(cacheManager.getCacheKeys().PRODUCTS)
        cacheManager.clearCache(cacheManager.getCacheKeys().FEATURED)
        cacheManager.clearCache(cacheManager.getCacheKeys().PRODUCT_DETAILS)

        return data
    },

    /**
     * Delete product (Admin only)
     * @param {number} id - Product ID
     * @returns {Promise<Object>} Success response
     */
    async delete(id) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) throw error

        // Invalidate product caches
        cacheManager.clearCache(cacheManager.getCacheKeys().PRODUCTS)
        cacheManager.clearCache(cacheManager.getCacheKeys().FEATURED)
        cacheManager.clearCache(cacheManager.getCacheKeys().PRODUCT_DETAILS)

        return { message: 'Product deleted successfully' }
    }
}

export default productService
