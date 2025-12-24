/**
 * Orders Service - Supabase Implementation
 * Handles all order-related database operations
 */
import api from './api'

export const orderService = {
    /**
     * Create a new order
     * @param {Object} orderData - Order data
     * @param {number} orderData.address_id - Delivery address ID
     * @param {string} orderData.payment_method - Payment method (cod, card, bank_transfer, paypal)
     * @param {Array} orderData.items - Order items
     * @param {number} orderData.subtotal - Subtotal amount
     * @param {number} [orderData.shipping_fee] - Shipping fee
     * @param {number} [orderData.tax] - Tax amount
     * @param {number} [orderData.discount] - Discount amount
     * @param {string} [orderData.notes] - Order notes
     * @returns {Promise<Object>} Created order
     */
    async create(orderData) {
        const resp = await api.post('/orders', orderData)
        return resp.data
    },

    /**
     * Get user's orders
     * @param {Object} params - Query parameters
     * @param {number} [params.page=1] - Page number
     * @param {number} [params.limit=20] - Items per page
     * @returns {Promise<Object>} Orders with pagination
     */
    async getMyOrders(params = {}) {
        const { page = 1, limit = 20 } = params
        const res = await api.get('/orders', { params: { page, limit } })
        return res.data
    },

    /**
     * Get order by ID
     * @param {number} id - Order ID
     * @returns {Promise<Object>} Order details with items
     */
    async getById(id) {
        const res = await api.get(`/orders/${id}`)
        return res.data
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
        const { status, payment_status, user_id, page = 1, limit = 20 } = filters

        const res = await api.get('/orders', { params: { status, payment_status, user_id, page, limit } })
        return res.data
    },

    /**
     * Update order status (Admin only)
     * @param {number} id - Order ID
     * @param {Object} data - Update data
     * @param {string} [data.status] - Order status
     * @param {string} [data.payment_status] - Payment status
     * @param {string} [data.tracking_number] - Tracking number
     * @param {string} [data.admin_notes] - Admin notes
     * @returns {Promise<Object>} Updated order
     */
    async updateStatus(id, data) {
        const res = await api.put(`/orders/${id}`, data)
        return res.data
    }
}

export default orderService
