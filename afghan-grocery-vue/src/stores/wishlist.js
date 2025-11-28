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
        console.log('Checking wishlist for:', productId, 'Items:', items.value)
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
            const rawItems = response.data.data || []

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
                    image: item.image,
                    stock: item.stock,
                    rating: item.rating,
                    category_id: item.category_id
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

        loading.value = true
        error.value = null
        try {
            await api.post('/wishlist', {
                product_id: product.id
            })
            // Refetch to get complete data with product details
            await fetchWishlist()
            window.showToast('Added to wishlist!', 'success')
            return true
        } catch (err) {
            error.value = err.message
            window.showToast('Failed to add to wishlist', 'error')
            return false
        } finally {
            loading.value = false
        }
    }

    async function removeFromWishlist(productId) {
        loading.value = true
        error.value = null
        try {
            const item = items.value.find(i => i.productId == productId || i.product_id == productId)
            if (item) {
                await api.delete(`/wishlist/${item.id}`)
                items.value = items.value.filter(i => (i.productId != productId && i.product_id != productId))
                window.showToast('Removed from wishlist', 'info')
            }
            return true
        } catch (err) {
            error.value = err.message
            window.showToast('Failed to remove from wishlist', 'error')
            return false
        } finally {
            loading.value = false
        }
    }

    async function toggleWishlist(product) {
        if (isInWishlist(product.id)) {
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
