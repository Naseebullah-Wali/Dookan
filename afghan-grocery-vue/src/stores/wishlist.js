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
        return items.value.some(item => item.productId == productId || item.product_id == productId)
    }

    async function fetchWishlist() {
        if (!authStore.isAuthenticated) {
            items.value = []
            return
        }

        loading.value = true
        error.value = null
        try {
            const response = await api.get(`/wishlist?_=${new Date().getTime()}`)

            // Backend returns array directly in response.data, not response.data.data
            const rawItems = Array.isArray(response.data) ? response.data : (response.data.data || [])

            // Transform backend response to consistent format
            items.value = rawItems.map(item => ({
                id: item.id,
                productId: item.product_id,
                product_id: item.product_id,
                created_at: item.created_at,
                product: {
                    id: item.product_id,
                    name: item.name,
                    price: item.price,
                    original_price: item.original_price,
                    image: item.image,
                    stock: item.stock,
                    rating: item.rating,
                    category_id: item.category_id,
                    size: item.size
                }
            }))
        } catch (err) {
            error.value = err.message
            console.error('Failed to fetch wishlist:', err)
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

        // Optimistic update - add to UI immediately
        const optimisticItem = {
            id: Date.now(), // temporary ID
            productId: product.id,
            product_id: product.id,
            created_at: new Date().toISOString(),
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                stock: product.stock,
                rating: product.rating,
                category_id: product.category_id,
                size: product.size
            }
        }
        items.value.push(optimisticItem)

        loading.value = true
        error.value = null
        try {
            const response = await api.post('/wishlist', {
                product_id: product.id
            })

            // Update the optimistic item with real ID from response
            const index = items.value.findIndex(item => item.id === optimisticItem.id)
            if (index !== -1 && response.data && response.data.data && response.data.data.id) {
                items.value[index].id = response.data.data.id
            } else if (index !== -1 && response.data && response.data.id) {
                items.value[index].id = response.data.id
            }

            window.showToast('Added to wishlist!', 'success')
            return true
        } catch (err) {
            // Rollback optimistic update on error
            items.value = items.value.filter(item => item.id !== optimisticItem.id)
            error.value = err.message
            console.error('Failed to add to wishlist:', err)
            window.showToast('Failed to add to wishlist', 'error')
            return false
        } finally {
            loading.value = false
        }
    }

    async function removeFromWishlist(productId) {
        const item = items.value.find(i => i.productId == productId || i.product_id == productId)
        if (!item) {
            return false
        }

        // Optimistic update - remove from UI immediately
        const itemBackup = { ...item }
        items.value = items.value.filter(i => (i.productId != productId && i.product_id != productId))

        loading.value = true
        error.value = null
        try {
            await api.delete(`/wishlist/${item.id}`)
            window.showToast('Removed from wishlist', 'info')
            return true
        } catch (err) {
            // Rollback optimistic update on error
            items.value.push(itemBackup)
            error.value = err.message
            window.showToast('Failed to remove from wishlist', 'error')
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

    function clearWishlist() {
        items.value = []
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
