<template>
  <div class="search-autocomplete position-relative" v-click-outside="closeResults">
    <div class="input-group">
      <span class="input-group-text bg-white border-end-0">
        <i class="bi bi-search text-muted"></i>
      </span>
      <input
        ref="searchInput"
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="form-control border-start-0 ps-0 shadow-none"
        @input="handleInput"
        @focus="showResults = true"
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        @keydown.enter.prevent="selectResult"
        @keydown.esc="closeResults"
      />
      <button v-if="query" @click="clearSearch" class="btn btn-outline-secondary border-start-0 border-end" type="button">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <div v-if="showResults && (results.length > 0 || query)" class="dropdown-menu show w-100 mt-1 border-0 shadow-lg p-0 overflow-hidden" style="max-height: 400px; overflow-y: auto;">
      <div v-if="loading" class="p-4 text-center text-muted">
        <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        <span>Searching...</span>
      </div>

      <div v-else-if="results.length > 0" class="list-group list-group-flush">
        <router-link
          v-for="(result, index) in results"
          :key="result.id"
          :to="`/product/${result.id}`"
          class="list-group-item list-group-item-action d-flex align-items-center gap-3 p-3 border-0 border-bottom"
          :class="{ 'active bg-light text-dark': selectedIndex === index }"
          @click="handleSelect(result)"
        >
          <img :src="result.image" :alt="result.name" class="rounded object-fit-cover" style="width: 50px; height: 50px;" />
          <div class="flex-grow-1">
            <div class="fw-semibold mb-1">{{ result.name }}</div>
            <div class="d-flex gap-3 small">
              <span class="text-primary fw-bold">{{ formatPrice(result.price) }} AFN</span>
              <span class="text-warning"><i class="bi bi-star-fill me-1"></i>{{ result.rating }}</span>
            </div>
          </div>
        </router-link>
      </div>

      <div v-else-if="query" class="p-4 text-center text-muted">
        <span>No products found for "{{ query }}"</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search products...'
  },
  maxResults: {
    type: Number,
    default: 5
  }
})

const router = useRouter()
const productsStore = useProductsStore()

const query = ref('')
const results = ref([])
const showResults = ref(false)
const loading = ref(false)
const selectedIndex = ref(-1)
const searchInput = ref(null)

let debounceTimer = null

watch(query, () => {
  if (!query.value) {
    results.value = []
    selectedIndex.value = -1
  }
})

function handleInput() {
  clearTimeout(debounceTimer)
  loading.value = true

  debounceTimer = setTimeout(() => {
    searchProducts()
  }, 300)
}

function searchProducts() {
  if (!query.value.trim()) {
    results.value = []
    loading.value = false
    return
  }

  const searchQuery = query.value.toLowerCase()
  const allProducts = productsStore.products

  results.value = allProducts
    .filter(p =>
      p.name.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery) ||
      p.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
    )
    .slice(0, props.maxResults)

  loading.value = false
}

function navigateDown() {
  if (selectedIndex.value < results.value.length - 1) {
    selectedIndex.value++
  }
}

function navigateUp() {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

function selectResult() {
  if (selectedIndex.value >= 0 && results.value[selectedIndex.value]) {
    handleSelect(results.value[selectedIndex.value])
  }
}

function handleSelect(result) {
  query.value = result.name
  closeResults()
  router.push(`/product/${result.id}`)
}

function clearSearch() {
  query.value = ''
  results.value = []
  selectedIndex.value = -1
  searchInput.value?.focus()
}

function closeResults() {
  showResults.value = false
  selectedIndex.value = -1
}

function formatPrice(price) {
  return price.toLocaleString()
}

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style scoped>
/* Bootstrap handles all styling */
</style>
