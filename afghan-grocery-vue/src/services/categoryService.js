/**
 * Categories Service - Supabase Implementation
 * Handles all category-related database operations
 */
import api from './api'
import { cacheManager } from '../utils/cacheManager'

export const categoryService = {
    /**
     * Get all categories
     * @param {boolean} [activeOnly=true] - Filter only active categories
     * @param {string} [lang='en'] - Language code
     * @returns {Promise<Array>} Categories list
     */
    async getAll(activeOnly = true, lang = 'en') {
        const cacheKey = cacheManager.getCacheKeys().CATEGORIES

        // Check cache first
        const cached = await cacheManager.getCache(cacheKey)
        if (cached && Array.isArray(cached)) {
            console.log('[CategoryService] Using cached categories:', cached)
            return activeOnly ? cached.filter(c => c.active) : cached
        }

        try {
            const params = { activeOnly, lang }
            console.log('[CategoryService] Fetching from API with params:', params)
            const res = await api.get('/categories', { params })
            const data = res.data || []
            console.log('[CategoryService] API Response:', data)
            cacheManager.setCache(cacheKey, data)
            const result = activeOnly ? data.filter(c => c.active) : data
            console.log('[CategoryService] Returning filtered categories:', result)
            return result
        } catch (error) {
            console.error('[CategoryService] Error fetching categories:', error)
            throw error
        }
    },

    /**
     * Get category by ID
     * @param {number} id - Category ID
     * @param {string} [lang='en'] - Language code
     * @returns {Promise<Object>} Category data
     */
    async getById(id, lang = 'en') {
        const res = await api.get(`/categories/${id}`, { params: { lang } })
        return res.data
    },

    /**
     * Get categories with product counts
     * @param {string} [lang='en'] - Language code
     * @returns {Promise<Array>} Categories with counts
     */
    async getWithCounts(lang = 'en') {
        const cacheKey = cacheManager.getCacheKeys().CATEGORIES

        // Check cache first
        const cached = await cacheManager.getCache(cacheKey)
        if (cached && Array.isArray(cached)) {
            return cached
                .filter(c => c.active)
                .map(category => ({
                    ...category,
                    product_count: category.product_count || 0
                }))
        }

        const res = await api.get('/categories/with-counts', { params: { lang } })
        const data = res.data || []
        const transformed = data.map(category => ({
            ...category,
            product_count: category.product_count || 0
        }))
        cacheManager.setCache(cacheKey, data)
        return transformed
    },

    /**
     * Create new category (Admin only)
     * @param {Object} categoryData - Category data
     * @returns {Promise<Object>} Created category
     */
    async create(categoryData) {
        const res = await api.post('/categories', categoryData)
        return res.data
    },

    /**
     * Update category (Admin only)
     * @param {number} id - Category ID
     * @param {Object} categoryData - Updated category data
     * @returns {Promise<Object>} Updated category
     */
    async update(id, categoryData) {
        const res = await api.put(`/categories/${id}`, categoryData)
        return res.data
    },

    /**
     * Delete category (Admin only)
     * @param {number} id - Category ID
     * @returns {Promise<Object>} Success response
     */
    async delete(id) {
        await api.delete(`/categories/${id}`)
        // Clear categories cache when deleting
        cacheManager.clearSpecificCache(cacheManager.getCacheKeys().CATEGORIES)
        return { message: 'Category deleted successfully' }
    },

    /**
     * Force refresh categories from server (bypass cache)
     * @param {string} [lang='en'] - Language code
     * @returns {Promise<Array>} Fresh categories list
     */
    async refreshCategories(lang = 'en') {
        // Clear cache first
        cacheManager.clearSpecificCache(cacheManager.getCacheKeys().CATEGORIES)
        // Fetch fresh data
        const params = { activeOnly: true, lang }
        const res = await api.get('/categories', { params })
        const data = res.data || []
        cacheManager.setCache(cacheManager.getCacheKeys().CATEGORIES, data)
        return data.filter(c => c.active)
    }
}

export default categoryService
