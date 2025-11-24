<template>
  <div class="rating-filter">
    <label class="form-label fw-semibold">Minimum Rating</label>
    <div class="d-flex flex-column gap-2">
      <button
        v-for="rating in [5, 4, 3, 2, 1]"
        :key="rating"
        :class="['btn btn-sm text-start d-flex align-items-center gap-2', selectedRating === rating ? 'btn-primary' : 'btn-outline-secondary']"
        @click="selectRating(rating)"
      >
        <span class="d-flex">
          <i v-for="star in rating" :key="star" class="bi bi-star-fill text-warning"></i>
        </span>
        <span class="small">{{ rating }}+ Stars</span>
      </button>
      <button
        :class="['btn btn-sm text-start', selectedRating === null ? 'btn-primary' : 'btn-outline-secondary']"
        @click="selectRating(null)"
      >
        <span class="small">All Ratings</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedRating = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  selectedRating.value = newVal
})

function selectRating(rating) {
  selectedRating.value = rating
  emit('update:modelValue', rating)
}
</script>

<style scoped>
/* Bootstrap handles all styling */
</style>
