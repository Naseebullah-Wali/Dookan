import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { useAuthStore } from './auth'

export const useReviewsStore = defineStore('reviews', () => {
    const reviews = ref([])
    const loading = ref(false)
    const error = ref(null)
    const authStore = useAuthStore()

    async function fetchProductReviews(productId) {
        loading.value = true
        error.value = null
        try {
            const response = await api.get(`/reviews/product/${productId}`)
            reviews.value = response.data
        } catch (err) {
            error.value = err.message
            reviews.value = []
        } finally {
            loading.value = false
        }
    }

    async function createReview(reviewData) {
        if (!authStore.isAuthenticated) {
            throw new Error('Please login to submit a review')
        }

        loading.value = true
        error.value = null
        try {
            const response = await api.post('/reviews', reviewData)
            // Refresh all reviews for this product after creating one
            await fetchProductReviews(reviewData.product_id)
            return response.data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        reviews,
        loading,
        error,
        fetchProductReviews,
        createReview
    }
})
