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
        return items.value.some(item => item.product_id === productId)
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
                    products (
                        id,
                        name,
                        price,
                        image,
                        stock,
                        category_id
                    )
                `)
                .eq('user_id', authStore.user.id)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            // Transform Supabase response to match app structure
            items.value = data.map(item => ({
                id: item.id,
                product_id: item.product_id,
                created_at: item.created_at,
                product: item.products // Supabase returns the joined relation as 'products'
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
                product_id: product.id,
                created_at: data.created_at,
                product: product // Use the product object passed in for immediate UI update
            })

            window.showToast('Added to wishlist!', 'success')
            return true
        } catch (err) {
            error.value = err.message
            console.error('Failed to add to wishlist:', err)
            window.showToast('Failed to add to wishlist', 'error')
            return false
        } finally {
            loading.value = false
        }
    }

    async function removeFromWishlist(productId) {
        const item = items.value.find(i => i.product_id === productId)
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
            items.value = items.value.filter(i => i.product_id !== productId)

            window.showToast('Removed from wishlist', 'info')
            return true
        } catch (err) {
            error.value = err.message
            console.error('Failed to remove from wishlist:', err)
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
