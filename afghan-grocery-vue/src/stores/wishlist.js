import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { supabase } from '@/lib/supabase'

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
            const { data, error: fetchError } = await supabase
                .from('wishlists')
                .select(`
                    id,
                    product_id,
                    created_at,
                    products (*)
                `)
                .eq('user_id', authStore.user.id)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            // Transform Supabase response to match app structure (camelCase)
            items.value = data.map(item => ({
                id: item.id,
                productId: item.product_id,
                createdAt: item.created_at,
                product: item.products
            }))
        } catch (err) {
            error.value = err.message
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
            const { data, error: insertError } = await supabase
                .from('wishlists')
                .insert({
                    user_id: authStore.user.id,
                    product_id: product.id
                })
                .select()
                .single()

            if (insertError) throw insertError

            // Add to local state
            items.value.unshift({
                id: data.id,
                productId: product.id,
                createdAt: data.created_at,
                product: product
            })

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
        const item = items.value.find(i => i.productId === productId)
        if (!item) return false

        loading.value = true
        error.value = null
        try {
            const { error: deleteError } = await supabase
                .from('wishlists')
                .delete()
                .eq('id', item.id)

            if (deleteError) throw deleteError

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
            const { error: deleteError } = await supabase
                .from('wishlists')
                .delete()
                .eq('user_id', authStore.user.id)

            if (deleteError) throw deleteError

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
