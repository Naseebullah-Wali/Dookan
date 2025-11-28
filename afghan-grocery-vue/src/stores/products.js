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

    async function createProduct(productData) {
        loading.value = true
        error.value = null
        try {
            const newProduct = await productService.create(productData)
            products.value.unshift(newProduct)
            return newProduct
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateProduct(id, productData) {
        loading.value = true
        error.value = null
        try {
            const updatedProduct = await productService.update(id, productData)
            const index = products.value.findIndex(p => p.id === id)
            if (index !== -1) {
                products.value[index] = updatedProduct
            }
            return updatedProduct
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteProduct(id) {
        loading.value = true
        error.value = null
        try {
            await productService.delete(id)
            products.value = products.value.filter(p => p.id !== id)
            return true
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    async function createCategory(categoryData) {
        loading.value = true
        error.value = null
        try {
            const newCategory = await categoryService.create(categoryData)
            categories.value.push(newCategory)
            return newCategory
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateCategory(id, categoryData) {
        loading.value = true
        error.value = null
        try {
            const updatedCategory = await categoryService.update(id, categoryData)
            const index = categories.value.findIndex(c => c.id === id)
            if (index !== -1) {
                categories.value[index] = updatedCategory
            }
            return updatedCategory
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteCategory(id) {
        loading.value = true
        error.value = null
        try {
            await categoryService.delete(id)
            categories.value = categories.value.filter(c => c.id !== id)
            return true
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
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
        createProduct,
        updateProduct,
        deleteProduct,
        createCategory,
        updateCategory,
        deleteCategory,
        clearProducts
    }
})
