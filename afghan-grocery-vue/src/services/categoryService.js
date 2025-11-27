/**
 * Categories API Service
 * Handles all category-related API calls
 */
import api from './api'

export const categoryService = {
    /**
     * Get all categories
     * @param {boolean} [activeOnly=true] - Filter only active categories
     * @returns {Promise<Array>} Categories list
     */
    async getAll(activeOnly = true) {
        const params = activeOnly ? '?active=true' : ''
        const response = await api.get(`/categories${params}`)
        return response.data
    },

    /**
     * Get categories with product counts
     * @returns {Promise<Array>} Categories with product counts
     */
    async getWithCounts() {
        const response = await api.get('/categories/with-counts')
        return response.data
    },

    /**
     * Get category by ID
     * @param {number} id - Category ID
     * @returns {Promise<Object>} Category data
     */
    async getById(id) {
        const response = await api.get(`/categories/${id}`)
        return response.data
    },

    /**
     * Create new category (Admin only)
     * @param {Object} categoryData - Category data
     * @returns {Promise<Object>} Created category
     */
    async create(categoryData) {
        const response = await api.post('/categories', categoryData)
        return response.data
    },

    /**
     * Update category (Admin only)
     * @param {number} id - Category ID
     * @param {Object} categoryData - Updated category data
     * @returns {Promise<Object>} Updated category
     */
    async update(id, categoryData) {
        const response = await api.put(`/categories/${id}`, categoryData)
        return response.data
    },

    /**
     * Delete category (Admin only)
     * @param {number} id - Category ID
     * @returns {Promise<Object>} Success response
     */
    async delete(id) {
        const response = await api.delete(`/categories/${id}`)
        return response.data
    }
}

export default categoryService
