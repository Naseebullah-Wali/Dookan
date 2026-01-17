<template>
  <div class="star-rating">
    <div class="stars-display" v-if="!editable">
      <div class="stars-container">
        <span v-for="star in 5" :key="star" class="star">
          {{ star <= modelValue ? '⭐' : '☆' }}
        </span>
      </div>
      <span v-if="showValue" class="rating-value">{{ modelValue.toFixed(1) }}</span>
    </div>
    <div class="stars-input" v-else>
      <div class="stars-container">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          :class="['star-btn', { active: star <= (hoverRating || modelValue) }]"
          @click="setRating(star)"
          @mouseenter="hoverRating = star"
          @mouseleave="hoverRating = 0"
          :title="`${star} ${star === 1 ? 'star' : 'stars'}`"
        >
          {{ star <= (hoverRating || modelValue) ? '⭐' : '☆' }}
        </button>
      </div>
      <span class="rating-text">{{ getRatingText(hoverRating || modelValue) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  editable: {
    type: Boolean,
    default: false
  },
  showValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const hoverRating = ref(0)

function setRating(rating) {
  emit('update:modelValue', rating)
}

function getRatingText(rating) {
  const texts = {
    0: '',
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  }
  return texts[rating] || ''
}
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
}

.stars-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.star {
  font-size: 1.25rem;
  color: var(--bs-warning);
  display: inline-block;
  transition: none;
}

.rating-value,
.rating-text {
  font-weight: 600;
  color: var(--bs-dark);
  font-size: 0.95rem;
  white-space: nowrap;
}

.rating-text {
  color: var(--bs-secondary);
  min-width: 70px;
}

.stars-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border: 1px solid var(--bs-border-color);
}

.star-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s ease;
  color: #d0d0d0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  flex-shrink: 0;
}

.star-btn:hover {
  color: #ffc107;
}

.star-btn.active {
  color: #ffc107;
}

.star-btn:active {
  color: #ffc107;
}
</style>