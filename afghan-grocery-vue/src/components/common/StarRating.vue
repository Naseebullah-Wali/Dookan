<template>
  <div class="star-rating">
    <div class="stars-display" v-if="!editable">
      <span v-for="star in 5" :key="star" class="star">
        {{ star <= modelValue ? '⭐' : '☆' }}
      </span>
      <span v-if="showValue" class="rating-value">{{ modelValue.toFixed(1) }}</span>
    </div>
    <div class="stars-input" v-else>
      <button
        v-for="star in 5"
        :key="star"
        type="button"
        :class="['star-btn', { active: star <= (hoverRating || modelValue) }]"
        @click="setRating(star)"
        @mouseenter="hoverRating = star"
        @mouseleave="hoverRating = 0"
      >
        {{ star <= (hoverRating || modelValue) ? '⭐' : '☆' }}
      </button>
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
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.stars-display {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star {
  font-size: 1.25rem;
  color: var(--color-warning);
}

.rating-value {
  margin-left: var(--space-2);
  font-weight: 600;
  color: var(--color-text-primary);
}

.stars-input {
  display: flex;
  gap: 4px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  transition: all var(--transition-fast);
  color: var(--color-text-muted);
}

.star-btn:hover,
.star-btn.active {
  color: var(--color-warning);
  transform: scale(1.1);
}
</style>
