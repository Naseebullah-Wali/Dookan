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
        return items.value.some(item => item.product_id === productId)
    }

    async function fetchWishlist() {
        if (!authStore.isAuthenticated) {
            items.value = []
            return
        }

        loading.value = true
        error.value = null
        try {
            const response = await api.get('/wishlist')
            items.value = response.data.data || []
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
            const response = await api.post('/wishlist', {
                product_id: product.id
            })
            items.value.push(response.data.data)
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
            const item = items.value.find(i => i.product_id === productId)
            if (item) {
                await api.delete(`/wishlist/${item.id}`)
                items.value = items.value.filter(i => i.product_id !== productId)
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
