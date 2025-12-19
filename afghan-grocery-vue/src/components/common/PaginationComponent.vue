<template>
  <nav v-if="totalPages > 1" aria-label="Page navigation" class="mt-4">
    <ul class="pagination justify-content-center">
      <!-- Previous Button -->
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button 
          class="page-link shadow-sm" 
          @click="$emit('page-change', currentPage - 1)"
          :disabled="currentPage === 1"
          aria-label="Previous"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
      </li>

      <!-- Page Numbers -->
      <li 
        v-for="page in visiblePages" 
        :key="page" 
        class="page-item" 
        :class="{ active: currentPage === page, 'd-none d-sm-block': isMobileHidden(page) }"
      >
        <button 
          class="page-link shadow-sm" 
          @click="$emit('page-change', page)"
        >
          {{ page }}
        </button>
      </li>

      <!-- Next Button -->
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button 
          class="page-link shadow-sm" 
          @click="$emit('page-change', currentPage + 1)"
          :disabled="currentPage === totalPages"
          aria-label="Next"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  maxVisible: {
    type: Number,
    default: 5
  }
})

defineEmits(['page-change'])

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, props.currentPage - Math.floor(props.maxVisible / 2))
  const end = Math.min(props.totalPages, start + props.maxVisible - 1)
  
  // Adjust start if end is at totalPages
  const finalStart = Math.max(1, Math.min(start, props.totalPages - props.maxVisible + 1))
  
  for (let i = finalStart; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const isMobileHidden = (page) => {
  // Always show first, last, and current page +/- 1 on mobile
  if (page === 1 || page === props.totalPages || Math.abs(page - props.currentPage) <= 1) {
    return false
  }
  return true
}
</script>

<style scoped>
.pagination {
  gap: 5px;
}

.page-link {
  border-radius: 8px !important;
  color: var(--bs-primary);
  border: 1px solid #dee2e6;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  min-width: 44px;
  text-align: center;
}

.page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
}

.page-link:hover:not(:disabled) {
  background-color: rgba(231, 111, 26, 0.1);
  border-color: var(--bs-primary);
  color: var(--bs-primary);
}

.page-item.disabled .page-link {
  background-color: #f8f9fa;
  color: #6c757d;
}

@media (max-width: 576px) {
  .page-link {
    padding: 0.4rem 0.8rem;
    min-width: 38px;
  }
}
</style>
