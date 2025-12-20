/**
 * Orders Service - Supabase Implementation
 * Handles all order-related database operations
 */
import { supabase, getCurrentUser } from '../lib/supabase'

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
        const user = await getCurrentUser()
        if (!user) throw new Error('Not authenticated')

        let { items, address, ...orderInfo } = orderData

        // If address is an object, create it first
        if (address && typeof address === 'object') {
            const { addressService } = await import('./addressService')
            const newAddress = await addressService.create({
                full_name: address.recipient_name || address.full_name,
                phone: address.phone,
                street: address.street,
                city: address.city,
                state: address.province || address.state,
                zip: address.zip || '00000',
                country: address.country || 'Afghanistan',
                is_default: address.is_default || false
            })
            orderInfo.address_id = newAddress.id
        } else if (orderData.address_id) {
            orderInfo.address_id = orderData.address_id
        }

        // Calculate total
        const total = orderInfo.subtotal +
            (orderInfo.shipping_fee || 0) +
            (orderInfo.tax || 0) -
            (orderInfo.discount || 0)

        // Create order
        const allowedMethods = ['cod', 'card', 'bank_transfer', 'paypal']
        const dbPaymentMethod = allowedMethods.includes(orderInfo.payment_method)
            ? orderInfo.payment_method
            : 'cod'

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                ...orderInfo,
                payment_method: dbPaymentMethod,
                user_id: user.id,
                total,
                status: 'pending',
                payment_status: 'pending'
            })
            .select()
            .single()

        if (orderError) throw orderError

        // Create order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.name,
            product_image: item.image,
            sku: item.sku,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) throw itemsError

        // Fetch complete order with items
        return await this.getById(order.id)
    },

    /**
     * Get user's orders
     * @param {Object} params - Query parameters
     * @param {number} [params.page=1] - Page number
     * @param {number} [params.limit=20] - Items per page
     * @returns {Promise<Object>} Orders with pagination
     */
    async getMyOrders(params = {}) {
        const user = await getCurrentUser()
        if (!user) throw new Error('Not authenticated')

        const { page = 1, limit = 20 } = params

        const from = (page - 1) * limit
        const to = from + limit - 1

        const { data, error, count } = await supabase
            .from('orders')
            .select('*, addresses(*), order_items(*)', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(from, to)

        if (error) throw error

        return {
            orders: data,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    },

    /**
     * Get order by ID
     * @param {number} id - Order ID
     * @returns {Promise<Object>} Order details with items
     */
    async getById(id) {
        const { data, error } = await supabase
            .from('orders')
            .select('*, addresses(*), order_items(*, products(*))')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
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

        let query = supabase
            .from('orders')
            .select('*, addresses(*), profiles(name, email)', { count: 'exact' })

        if (status) {
            query = query.eq('status', status)
        }

        if (payment_status) {
            query = query.eq('payment_status', payment_status)
        }

        if (user_id) {
            query = query.eq('user_id', user_id)
        }

        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query
            .order('created_at', { ascending: false })
            .range(from, to)

        const { data, error, count } = await query

        if (error) throw error

        return {
            orders: data,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
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
        const { data: order, error } = await supabase
            .from('orders')
            .update(data)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return order
    }
}

export default orderService
