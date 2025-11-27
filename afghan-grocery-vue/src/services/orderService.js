/**
 * Orders API Service
 * Handles all order-related API calls
 */
import api from './api'

export const orderService = {
    /**
     * Create a new order
     * @param {Object} orderData - Order data
     * @param {number} orderData.address_id - Delivery address ID
     * @param {string} orderData.payment_method - Payment method (cod, card, bank_transfer)
     * @param {Array} orderData.items - Order items
     * @param {number} orderData.subtotal - Subtotal amount
     * @param {number} [orderData.shipping_fee] - Shipping fee
     * @param {number} [orderData.tax] - Tax amount
     * @param {number} [orderData.discount] - Discount amount
     * @param {string} [orderData.notes] - Order notes
     * @returns {Promise<Object>} Created order
     */
    async create(orderData) {
        const response = await api.post('/orders', orderData)
        return response.data
    },

    /**
     * Get user's orders
     * @param {Object} params - Query parameters
     * @param {number} [params.page=1] - Page number
     * @param {number} [params.limit=20] - Items per page
     * @returns {Promise<Object>} Orders with pagination
     */
    async getMyOrders(params = {}) {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page)
        if (params.limit) queryParams.append('limit', params.limit)

        const response = await api.get(`/orders?${queryParams}`)
        return response.data
    },

    /**
     * Get order by ID
     * @param {number} id - Order ID
     * @returns {Promise<Object>} Order details with items
     */
    async getById(id) {
        const response = await api.get(`/orders/${id}`)
        return response.data
    },

    /**
     * Get all orders (Admin only)
     * @param {Object} filters - Filter options
     * @param {string} [filters.status] - Order status
     * @param {string} [filters.payment_status] - Payment status
     * @param {number} [filters.user_id] - User ID
     * @param {number} [filters.page] - Page number
     * @param {number} [filters.limit] - Items per page
     * @returns {Promise<Object>} Orders with pagination
     */
    async getAll(filters = {}) {
        const params = new URLSearchParams()

        if (filters.status) params.append('status', filters.status)
        if (filters.payment_status) params.append('payment_status', filters.payment_status)
        if (filters.user_id) params.append('user_id', filters.user_id)
        if (filters.page) params.append('page', filters.page)
        if (filters.limit) params.append('limit', filters.limit)

        const response = await api.get(`/orders?${params}`)
        return response.data
    },

    /**
     * Update order status (Admin only)
     * @param {number} id - Order ID
     * @param {Object} data - Update data
     * @param {string} [data.status] - Order status
     * @param {string} [data.payment_status] - Payment status
     * @param {string} [data.tracking_number] - Tracking number
     * @param {string} [data.notes] - Order notes
     * @returns {Promise<Object>} Updated order
     */
    async updateStatus(id, data) {
        const response = await api.put(`/orders/${id}`, data)
        return response.data
    }
}

export default orderService
