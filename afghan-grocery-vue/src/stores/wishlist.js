import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import api from '@/services/api'

export const useWishlistStore = defineStore('wishlist', () => {
    const authStore = useAuthStore()
    const items = ref([])
    const loading = ref(false)
    const error = ref(null)

    const itemCount = computed(() => items.value.length)

    const isInWishlist = (productId) => {
        return items.value.some(item => item.productId === productId)
    }

    async function fetchWishlist() {
        if (!authStore.isAuthenticated || !authStore.user) {
            items.value = []
            return
        }

        loading.value = true
        error.value = null
        try {
            const response = await api.get('/wishlist')
            const data = response.data || []
            // Backend returns wishlist items with nested products from join
            items.value = data.map(item => {
                // Supabase join returns products as nested array or object
                const productData = item.products ? (Array.isArray(item.products) ? item.products[0] : item.products) : item.product
                return {
                    id: item.id,
                    productId: item.product_id || item.productId,
                    createdAt: item.created_at || item.createdAt,
                    product: productData || item
                }
            })
        } catch (err) {
            error.value = err.message || err
        } finally {
            loading.value = false
        }
    }

    async function addToWishlist(product) {
        if (!authStore.isAuthenticated) {
            window.showToast('Please login to add to wishlist', 'info')
            return false
        }

        if (isInWishlist(product.id)) {
            window.showToast('Already in wishlist', 'info')
            return false
        }

        loading.value = true
        error.value = null
        try {
            const res = await api.post('/wishlist', { product_id: product.id })
            const data = res.data
            items.value.unshift({
                id: data.id,
                productId: product.id,
                createdAt: data.created_at,
                product: product
            })
            window.showToast('Added to wishlist!', 'success')
            return true
        } catch (err) {
            error.value = err.message || err
            window.showToast('Failed to add to wishlist', 'error')
            return false
        } finally {
            loading.value = false
        }
    }

    async function removeFromWishlist(productId) {
        const item = items.value.find(i => i.productId === productId)
        if (!item) return false

        loading.value = true
        error.value = null
        try {
            await api.delete(`/wishlist/${item.id}`)
            // Remove from local state
            items.value = items.value.filter(i => i.productId !== productId)
            window.showToast('Removed from wishlist', 'info')
            return true
        } catch (err) {
            error.value = err.message
            window.showToast('Failed to remove from wishlist', 'error')
            return false
        } finally {
            loading.value = false
        }
    }

    async function clearWishlist() {
        if (!authStore.isAuthenticated || !authStore.user) return false

        loading.value = true
        error.value = null
        try {
            await api.delete('/wishlist')
            items.value = []
            return true
        } catch (err) {
            error.value = err.message
            window.showToast('Failed to clear wishlist', 'error')
            return false
        } finally {
            loading.value = false
        }
    }

    async function toggleWishlist(product) {
        const wasInWishlist = isInWishlist(product.id)
        if (wasInWishlist) {
            return await removeFromWishlist(product.id)
        } else {
            return await addToWishlist(product)
        }
    }

    return {
        items,
        loading,
        error,
        itemCount,
        isInWishlist,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist
    }
})
