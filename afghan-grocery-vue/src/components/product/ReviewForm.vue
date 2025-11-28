<template>
  <div class="card border-0 shadow-sm p-4 mb-5">
    <h3 class="h4 fw-bold mb-4">Write a Review</h3>
    
    <div v-if="!authStore.isAuthenticated" class="alert alert-secondary text-center py-4 mb-0">
      <p class="mb-0">Please <router-link to="/login" class="fw-bold text-decoration-none">login</router-link> to write a review</p>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="form-label fw-bold d-block">Your Rating *</label>
        <StarRating v-model="formData.rating" :editable="true" />
      </div>

      <div class="mb-4">
        <label class="form-label fw-bold">Your Review *</label>
        <textarea
          v-model="formData.comment"
          class="form-control"
          rows="4"
          placeholder="Share your experience with this product..."
          required
        ></textarea>
      </div>

      <div class="d-flex justify-content-end">
        <button type="submit" class="btn btn-primary px-4" :disabled="loading || !formData.rating">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ loading ? 'Submitting...' : 'Submit Review' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import StarRating from '@/components/common/StarRating.vue'
import { useReviewsStore } from '@/stores/reviews'

const props = defineProps({
  productId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['review-submitted'])

const authStore = useAuthStore()
const reviewsStore = useReviewsStore()

const formData = ref({
  rating: 0,
  comment: ''
})

const loading = ref(false)

async function handleSubmit() {
  // Prevent duplicate submissions
  if (loading.value) {
    return
  }

  if (!formData.value.rating || !formData.value.comment.trim()) {
    window.showToast('Please provide a rating and comment', 'error')
    return
  }

  loading.value = true

  try {
    const reviewData = {
      product_id: props.productId,
      rating: formData.value.rating,
      comment: formData.value.comment.trim()
    }

    const newReview = await reviewsStore.createReview(reviewData)
    
    window.showToast('Review submitted successfully!', 'success')
    
    // Reset form
    formData.value = {
      rating: 0,
      comment: ''
    }

    // Emit event to parent
    emit('review-submitted', newReview)
  } catch (error) {
    console.error('Failed to submit review:', error)
    window.showToast('Failed to submit review. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Custom styles removed in favor of Bootstrap classes */
</style>
