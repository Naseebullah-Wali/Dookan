/**
 * Address API Service
 * Handles all address-related API calls
 */
import api from './api'

export const addressService = {
    /**
     * Get all addresses for the current user
     * @returns {Promise<Array>} List of addresses
     */
    async getAll() {
        const response = await api.get('/addresses')
        return response.data
    },

    /**
     * Create a new address
     * @param {Object} addressData - Address data
     * @returns {Promise<Object>} Created address
     */
    async create(addressData) {
        const response = await api.post('/addresses', addressData)
        return response.data
    },

    /**
     * Update an existing address
     * @param {number} id - Address ID
     * @param {Object} addressData - Updated address data
     * @returns {Promise<Object>} Updated address
     */
    async update(id, addressData) {
        const response = await api.put(`/addresses/${id}`, addressData)
        return response.data
    },

    /**
     * Delete an address
     * @param {number} id - Address ID
     * @returns {Promise<Object>} Success response
     */
    async delete(id) {
        const response = await api.delete(`/addresses/${id}`)
        return response.data
    }
}

export default addressService
