import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useProductsStore = defineStore('products', () => {
    const products = ref([])
    const categories = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchProducts(filters = {}) {
        loading.value = true
        error.value = null
        try {
            const params = new URLSearchParams()
            if (filters.category) params.append('category', filters.category)
            if (filters.search) params.append('q', filters.search)
            if (filters.minPrice) params.append('price_gte', filters.minPrice)
            if (filters.maxPrice) params.append('price_lte', filters.maxPrice)

            const response = await api.get(`/products?${params}`)
            products.value = response.data
            return products.value
        } catch (err) {
            error.value = err.message
            return []
        } finally {
            loading.value = false
        }
    }

    async function fetchProductById(id) {
        loading.value = true
        error.value = null
        try {
            const response = await api.get(`/products/${id}`)
            return response.data
        } catch (err) {
            error.value = err.message
            return null
        } finally {
            loading.value = false
        }
    }

    async function fetchCategories() {
        try {
            const response = await api.get('/categories')
            categories.value = response.data
            return categories.value
        } catch (err) {
            error.value = err.message
            return []
        }
    }

    return {
        products,
        categories,
        loading,
        error,
        fetchProducts,
        fetchProductById,
        fetchCategories
    }
})
