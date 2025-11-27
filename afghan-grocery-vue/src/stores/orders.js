import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderService } from '@/services'

export const useOrdersStore = defineStore('orders', () => {
    const orders = ref([])
    const currentOrder = ref(null)
    const pagination = ref({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    })
    const loading = ref(false)
    const error = ref(null)

    async function createOrder(orderData) {
        loading.value = true
        error.value = null
        try {
            const order = await orderService.create(orderData)
            currentOrder.value = order
            return order
        } catch (err) {
            error.value = err.message || 'Failed to create order'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function fetchMyOrders(params = {}) {
        loading.value = true
        error.value = null
        try {
            const response = await orderService.getMyOrders(params)

            // Handle paginated response
            if (response.data && response.pagination) {
                orders.value = response.data
                pagination.value = response.pagination
            } else {
                orders.value = Array.isArray(response) ? response : response.data || []
            }

            return orders.value
        } catch (err) {
            error.value = err.message
            orders.value = []
            return []
        } finally {
            loading.value = false
        }
    }

    async function fetchOrderById(id) {
        loading.value = true
        error.value = null
        try {
            const order = await orderService.getById(id)
            currentOrder.value = order
            return order
        } catch (err) {
            error.value = err.message
            return null
        } finally {
            loading.value = false
        }
    }

    async function fetchAllOrders(filters = {}) {
        loading.value = true
        error.value = null
        try {
            const response = await orderService.getAll(filters)

            // Handle paginated response
            if (response.data && response.pagination) {
                orders.value = response.data
                pagination.value = response.pagination
            } else {
                orders.value = Array.isArray(response) ? response : response.data || []
            }

            return orders.value
        } catch (err) {
            error.value = err.message
            orders.value = []
            return []
        } finally {
            loading.value = false
        }
    }

    async function updateOrderStatus(id, data) {
        loading.value = true
        error.value = null
        try {
            const updatedOrder = await orderService.updateStatus(id, data)

            // Update in list if exists
            const index = orders.value.findIndex(o => o.id === id)
            if (index !== -1) {
                orders.value[index] = updatedOrder
            }

            // Update current order if it's the same
            if (currentOrder.value?.id === id) {
                currentOrder.value = updatedOrder
            }

            return updatedOrder
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    function clearOrders() {
        orders.value = []
        currentOrder.value = null
        pagination.value = {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
        }
    }

    return {
        orders,
        currentOrder,
        pagination,
        loading,
        error,
        createOrder,
        fetchMyOrders,
        fetchOrderById,
        fetchAllOrders,
        updateOrderStatus,
        clearOrders
    }
})
