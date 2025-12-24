/**
 * Address Service - Supabase Implementation
 * Handles all address-related database operations
 */
import api from './api'

export const addressService = {
    /**
     * Get all addresses for the current user
     * @returns {Promise<Array>} List of addresses
     */
    async getAll() {
        const res = await api.get('/addresses')
        return res.data
    },

    /**
     * Create a new address
     * @param {Object} addressData - Address data
     * @returns {Promise<Object>} Created address
     */
    async create(addressData) {
        const res = await api.post('/addresses', addressData)
        return res.data
    },

    /**
     * Update an existing address
     * @param {number} id - Address ID
     * @param {Object} addressData - Updated address data
     * @returns {Promise<Object>} Updated address
     */
    async update(id, addressData) {
        const res = await api.put(`/addresses/${id}`, addressData)
        return res.data
    },

    /**
     * Delete an address
     * @param {number} id - Address ID
     * @returns {Promise<Object>} Success response
     */
    async delete(id) {
        await api.delete(`/addresses/${id}`)
        return { message: 'Address deleted successfully' }
    }
}

export default addressService
