import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productService, categoryService } from '@/services'

export const useProductsStore = defineStore('products', () => {
    const products = ref([])
    const categories = ref([])
    const featuredProducts = ref([])
    const pagination = ref({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    })
    const loading = ref(false)
    const error = ref(null)

    async function fetchProducts(filters = {}) {
        loading.value = true
        error.value = null
        try {
            const response = await productService.getAll(filters)

            // Handle paginated response
            if (response.data && response.pagination) {
                products.value = response.data
                pagination.value = response.pagination
            } else {
                // Fallback for non-paginated response
                products.value = Array.isArray(response) ? response : response.data || []
            }

            return products.value
        } catch (err) {
            error.value = err.message
            products.value = []
            return []
        } finally {
            loading.value = false
        }
    }

    async function fetchFeaturedProducts(limit = 8) {
        loading.value = true
        error.value = null
        try {
            const response = await productService.getFeatured(limit)
            featuredProducts.value = Array.isArray(response) ? response : response.data || []
            return featuredProducts.value
        } catch (err) {
            error.value = err.message
            featuredProducts.value = []
            return []
        } finally {
            loading.value = false
        }
    }

    async function fetchProductById(id) {
        loading.value = true
        error.value = null
        try {
            const product = await productService.getById(id)
            return product
        } catch (err) {
            error.value = err.message
            return null
        } finally {
            loading.value = false
        }
    }

    async function fetchCategories() {
        try {
            const response = await categoryService.getAll(true)
            categories.value = Array.isArray(response) ? response : response.data || []
            return categories.value
        } catch (err) {
            error.value = err.message
            categories.value = []
            return []
        }
    }

    async function fetchCategoriesWithCounts() {
        try {
            const response = await categoryService.getWithCounts()
            categories.value = Array.isArray(response) ? response : response.data || []
            return categories.value
        } catch (err) {
            error.value = err.message
            categories.value = []
            return []
        }
    }

    async function searchProducts(query, filters = {}) {
        return await fetchProducts({
            ...filters,
            search: query
        })
    }

    function clearProducts() {
        products.value = []
        pagination.value = {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
        }
    }

    return {
        products,
        categories,
        featuredProducts,
        pagination,
        loading,
        error,
        fetchProducts,
        fetchFeaturedProducts,
        fetchProductById,
        fetchCategories,
        fetchCategoriesWithCounts,
        searchProducts,
        clearProducts
    }
})
