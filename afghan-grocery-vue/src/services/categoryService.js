/**
 * Categories Service - Supabase Implementation
 * Handles all category-related database operations
 */
import { supabase } from '../lib/supabase'
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
        const cached = cacheManager.getCache(cacheKey)
        if (cached && Array.isArray(cached)) {
            return activeOnly ? cached.filter(c => c.active) : cached
        }

        let query = supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true })

        if (activeOnly) {
            query = query.eq('active', true)
        }

        const { data, error } = await query

        if (error) throw error

        // Cache the result
        cacheManager.setCache(cacheKey, data)
        return data
    },

    /**
     * Get category by ID
     * @param {number} id - Category ID
     * @param {string} [lang='en'] - Language code
     * @returns {Promise<Object>} Category data
     */
    async getById(id, lang = 'en') {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    /**
     * Get categories with product counts
     * @param {string} [lang='en'] - Language code
     * @returns {Promise<Array>} Categories with counts
     */
    async getWithCounts(lang = 'en') {
        const cacheKey = cacheManager.getCacheKeys().CATEGORIES

        // Check cache first
        const cached = cacheManager.getCache(cacheKey)
        if (cached && Array.isArray(cached)) {
            return cached
                .filter(c => c.active)
                .map(category => ({
                    ...category,
                    product_count: category.product_count || 0
                }))
        }

        const { data, error } = await supabase
            .from('categories')
            .select('*, products(count)')
            .eq('active', true)
            .order('display_order', { ascending: true })

        if (error) throw error

        // Transform the data to include product count
        const transformed = data.map(category => ({
            ...category,
            product_count: category.products?.[0]?.count || 0
        }))

        // Cache the result
        cacheManager.setCache(cacheKey, data)
        return transformed
    },

    /**
     * Create new category (Admin only)
     * @param {Object} categoryData - Category data
     * @returns {Promise<Object>} Created category
     */
    async create(categoryData) {
        const { data, error } = await supabase
            .from('categories')
            .insert(categoryData)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Update category (Admin only)
     * @param {number} id - Category ID
     * @param {Object} categoryData - Updated category data
     * @returns {Promise<Object>} Updated category
     */
    async update(id, categoryData) {
        const { data, error } = await supabase
            .from('categories')
            .update(categoryData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Delete category (Admin only)
     * @param {number} id - Category ID
     * @returns {Promise<Object>} Success response
     */
    async delete(id) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { message: 'Category deleted successfully' }
    }
}

export default categoryService
