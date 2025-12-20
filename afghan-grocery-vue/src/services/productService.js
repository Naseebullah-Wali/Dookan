/**
 * Products Service - Supabase Implementation
 * Handles all product-related database operations
 */
import { supabase } from '../lib/supabase'

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

        return {
            products: data,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    },

    /**
     * Get featured products
     * @param {number} [limit=8] - Number of products to fetch
     * @param {string} [lang='en'] - Language code
     * @returns {Promise<Array>} Featured products
     */
    async getFeatured(limit = 8, lang = 'en') {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(id, name_en, name_de, name_fr, name_ps, name_fa, slug)')
            .eq('is_active', true)
            .eq('featured', true)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error
        return data
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
        return { message: 'Product deleted successfully' }
    }
}

export default productService
