/**
 * Products API Service
 * Handles all product-related API calls
 */
import api from './api'

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
     * @returns {Promise<Object>} Products data with pagination
     */
    async getAll(filters = {}) {
        const params = new URLSearchParams()

        if (filters.category) params.append('category', filters.category)
        if (filters.search) params.append('search', filters.search)
        if (filters.minPrice) params.append('min_price', filters.minPrice)
        if (filters.maxPrice) params.append('max_price', filters.maxPrice)
        if (filters.featured !== undefined) params.append('featured', filters.featured)
        if (filters.page) params.append('page', filters.page)
        if (filters.limit) params.append('limit', filters.limit)

        const response = await api.get(`/products?${params}`)
        return response.data
    },

    /**
     * Get featured products
     * @param {number} [limit=8] - Number of products to fetch
     * @returns {Promise<Array>} Featured products
     */
    async getFeatured(limit = 8) {
        const response = await api.get(`/products/featured?limit=${limit}`)
        return response.data
    },

    /**
     * Get product by ID
     * @param {number} id - Product ID
     * @returns {Promise<Object>} Product data
     */
    async getById(id) {
        const response = await api.get(`/products/${id}`)
        return response.data
    },

    /**
     * Create new product (Admin only)
     * @param {Object} productData - Product data
     * @returns {Promise<Object>} Created product
     */
    async create(productData) {
        const response = await api.post('/products', productData)
        return response.data
    },

    /**
     * Update product (Admin only)
     * @param {number} id - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise<Object>} Updated product
     */
    async update(id, productData) {
        const response = await api.put(`/products/${id}`, productData)
        return response.data
    },

    /**
     * Delete product (Admin only)
     * @param {number} id - Product ID
     * @returns {Promise<Object>} Success response
     */
    async delete(id) {
        const response = await api.delete(`/products/${id}`)
        return response.data
    }
}

export default productService
