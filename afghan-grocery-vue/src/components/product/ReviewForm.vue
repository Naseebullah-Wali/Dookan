<template>
  <div class="review-form-container">
    <div v-if="!authStore.isAuthenticated" class="alert alert-info d-flex align-items-center gap-3 mb-0 p-4">
      <i class="bi bi-info-circle fs-4"></i>
      <div>
        <p class="mb-0">{{ t('messages.reviewLoginRequired') }} <router-link to="/login" class="fw-bold text-decoration-none">{{ $t('auth.login') }}</router-link></p>
      </div>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="review-form">
      <div class="form-group">
        <label class="form-label fw-bold mb-3">
          <i class="bi bi-star-fill text-warning me-2"></i>{{ $t('product.rating') }}
          <span class="text-danger">*</span>
        </label>
        <StarRating v-model="formData.rating" :editable="true" />
        <small class="form-text text-muted d-block mt-2">{{ $t('common.selectRating') }}</small>
      </div>

      <div class="form-group">
        <label class="form-label fw-bold mb-3">
          <i class="bi bi-chat-left-text text-primary me-2"></i>{{ $t('common.review') }}
          <span class="text-danger">*</span>
        </label>
        <textarea
          v-model="formData.comment"
          class="form-control review-textarea"
          rows="4"
          :placeholder="$t('product.shareReview')"
          required
        ></textarea>
        <small class="form-text text-muted d-block mt-2">
          {{ formData.comment.length }} / 500 {{ t('messages.reviewCharacters') }}
        </small>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary btn-lg" :disabled="loading || !formData.rating || !formData.comment.trim()">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <i v-else class="bi bi-check-circle me-2"></i>
          {{ loading ? $t('common.submitting') : $t('product.submitReview') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import StarRating from '@/components/common/StarRating.vue'
import { useReviewsStore } from '@/stores/reviews'

const { t } = useI18n()

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
    window.showToast(t('messages.reviewRequired'), 'error')
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
    
    window.showToast(t('messages.reviewSubmitted'), 'success')
    
    // Reset form
    formData.value = {
      rating: 0,
      comment: ''
    }

    // Emit event to parent
    emit('review-submitted', newReview)
  } catch (error) {
    console.error('Failed to submit review:', error)
    // Show specific error message from backend
    const errorMessage = error?.response?.data?.message || error?.message || t('messages.error')
    window.showToast(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.review-form-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  overflow: hidden;
}

.review-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group:last-child {
  margin-bottom: 1.5rem;
}

.form-label {
  color: var(--bs-dark);
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.review-textarea {
  border: 2px solid var(--bs-border-color);
  border-radius: 0.5rem;
  padding: 0.875rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.review-textarea:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
  outline: none;
}

.form-text {
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
  transform: translateY(-2px);
}
</style>

<style scoped>
/* Custom styles removed in favor of Bootstrap classes */
</style>
