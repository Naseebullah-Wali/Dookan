<template>
  <div class="shop-page" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <LoadingSpinner :isLoading="loading" :fullScreen="true" message="Loading products..." />
    <AppHeader />
    
    <!-- Page Header -->
    <section class="page-header py-4 bg-light border-bottom">
      <div class="container">
        <div class="row mb-3">
          <div class="col-12">
            <h1 class="mb-2">{{ $t('shop.title') }}</h1>
            <div class="section-divider"></div>
          </div>
        </div>
        <div class="row g-3">
          <div class="col-lg-8 col-md-7 col-12">
            <div class="input-group shadow-sm">
              <template v-if="languageStore.isRTL">
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="$t('common.search')"
                  class="form-control border-end-0 rounded-start-0"
                  @input="handleSearch"
                />
                <span class="input-group-text bg-white border-start-0 rounded-end-0"><i class="bi bi-search"></i></span>
              </template>
              <template v-else>
                <span class="input-group-text bg-white border-end-0 rounded-start-0"><i class="bi bi-search"></i></span>
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="$t('common.search')"
                  class="form-control border-start-0 rounded-end-0"
                  @input="handleSearch"
                />
              </template>
            </div>
          </div>
          <div class="col-lg-3 col-md-4 col-sm-8 col-9">
            <select v-model="sortBy" class="form-select shadow-sm">
              <option value="">{{ $t('shop.sortBy') }}</option>
              <option value="price-asc">{{ $t('shop.sortOptions.priceLowHigh') }}</option>
              <option value="price-desc">{{ $t('shop.sortOptions.priceHighLow') }}</option>
              <option value="rating">{{ $t('shop.sortOptions.featured') }}</option>
              <option value="newest">{{ $t('shop.sortOptions.newest') }}</option>
            </select>
          </div>
          <div class="col-lg-1 col-md-1 col-sm-4 col-3 d-lg-none">
            <button class="btn btn-outline-primary w-100 shadow-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#filtersOffcanvas">
              <i class="bi bi-funnel"></i>
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="container py-4">
      <!-- Main Layout -->
      <div class="row g-4">
        <!-- Desktop Filters Sidebar -->
        <aside class="col-lg-3 d-none d-lg-block">
          <div class="card border-0 shadow-sm filters-sidebar">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h5 class="mb-0 fw-bold">{{ $t('shop.filters') }}</h5>
                <button @click="clearFilters" class="btn btn-link btn-sm text-primary p-0 text-decoration-underline">{{ $t('shop.clearFilters') }}</button>
              </div>

              <!-- Categories -->
              <div class="mb-4 pb-4 border-bottom">
                <h6 class="fw-semibold mb-3">{{ $t('header.categories') }}</h6>
                <div class="d-flex flex-column gap-2">
                  <button
                    v-for="category in categories"
                    :key="category.id"
                    :class="['btn btn-sm text-start', selectedCategory === category.id ? 'btn-primary' : 'btn-outline-secondary']"
                    @click="selectedCategory = category.id"
                  >
                    {{ category.icon }} {{ languageStore.getLocalizedName(category) }}
                  </button>
                  <button
                    :class="['btn btn-sm text-start', !selectedCategory ? 'btn-primary' : 'btn-outline-secondary']"
                    @click="selectedCategory = null"
                  >
                    {{ $t('shop.allCategories') }}
                  </button>
                </div>
              </div>

              <!-- Price Range -->
              <div class="mb-4 pb-4 border-bottom">
                <PriceRangeFilter
                  :min="priceRange.min"
                  :max="priceRange.max"
                  :absoluteMin="0"
                  :absoluteMax="5000"
                  :step="100"
                  @update:min="priceRange.min = $event"
                  @update:max="priceRange.max = $event"
                />
              </div>

              <!-- Rating Filter -->
              <div class="mb-4 pb-4 border-bottom">
                <RatingFilter v-model="minRating" />
              </div>

              <!-- Additional Filters -->
              <div>
                <h6 class="fw-semibold mb-3">{{ $t('shop.filters') }}</h6>
                <div class="form-check mb-2">
                  <input v-model="inStockOnly" type="checkbox" class="form-check-input" id="inStockCheck" />
                  <label class="form-check-label" for="inStockCheck">{{ $t('product.inStock') }}</label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Products Grid -->
        <div class="col-lg-9 col-12">
          <!-- Results Info -->
          <div class="alert alert-light d-flex align-items-center mb-4">
            <i class="bi bi-info-circle me-2"></i>
            <span class="fw-semibold">{{ $t('shop.productsFound', { count: filteredProducts.length }) }}</span>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="row g-3">
            <div v-for="i in 6" :key="i" class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-6">
              <div class="card border-0 shadow-sm" style="height: 400px;">
                <div class="placeholder-glow">
                  <div class="placeholder col-12" style="height: 250px;"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="filteredProducts.length === 0" class="text-center py-5">
            <div style="font-size: 4rem;" class="mb-4">📦</div>
            <h2 class="mb-3">{{ $t('shop.noProducts') }}</h2>
            <p class="text-muted mb-4">{{ $t('shop.clearFilters') }}</p>
            <button @click="clearFilters" class="btn btn-primary">{{ $t('shop.clearFilters') }}</button>
          </div>
          
          <!-- Products Grid -->
          <div v-else class="row g-3">
            <div v-for="product in filteredProducts" :key="product.id" class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-6">
              <ProductCard :product="product" />
            </div>
          </div>

          <!-- Pagination -->
          <div class="mt-5">
            <PaginationComponent 
              :currentPage="productsStore.pagination.page"
              :totalPages="productsStore.pagination.totalPages"
              @page-change="handlePageChange"
            />
          </div>
        </div>
      </div>

      <!-- Mobile Filters Offcanvas -->
      <div class="offcanvas offcanvas-start" tabindex="-1" id="filtersOffcanvas" aria-labelledby="filtersOffcanvasLabel">
        <div class="offcanvas-header border-bottom">
          <h5 class="offcanvas-title fw-bold" id="filtersOffcanvasLabel">{{ $t('shop.filters') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <!-- Categories -->
          <div class="mb-4 pb-4 border-bottom">
            <h6 class="fw-semibold mb-3">{{ $t('header.categories') }}</h6>
            <div class="d-flex flex-column gap-2">
              <button
                v-for="category in categories"
                :key="category.id"
                :class="['btn btn-sm text-start', selectedCategory === category.id ? 'btn-primary' : 'btn-outline-secondary']"
                @click="selectedCategory = category.id"
                data-bs-dismiss="offcanvas"
              >
                {{ category.icon }} {{ languageStore.getLocalizedName(category) }}
              </button>
              <button
                :class="['btn btn-sm text-start', !selectedCategory ? 'btn-primary' : 'btn-outline-secondary']"
                @click="selectedCategory = null"
                data-bs-dismiss="offcanvas"
              >
                {{ $t('shop.allCategories') }}
              </button>
            </div>
          </div>

          <!-- Price Range -->
          <div class="mb-4 pb-4 border-bottom">
            <PriceRangeFilter
              :min="priceRange.min"
              :max="priceRange.max"
              :absoluteMin="0"
              :absoluteMax="5000"
              :step="100"
              @update:min="priceRange.min = $event"
              @update:max="priceRange.max = $event"
            />
          </div>

          <!-- Rating Filter -->
          <div class="mb-4 pb-4 border-bottom">
            <RatingFilter v-model="minRating" />
          </div>

          <!-- Additional Filters -->
          <div class="mb-4">
            <h6 class="fw-semibold mb-3">{{ $t('shop.filters') }}</h6>
            <div class="form-check mb-2">
              <input v-model="inStockOnly" type="checkbox" class="form-check-input" id="inStockCheckMobile" />
              <label class="form-check-label" for="inStockCheckMobile">{{ $t('product.inStock') }}</label>
            </div>
          </div>

          <!-- Clear All Button -->
          <button @click="clearFilters" class="btn btn-outline-danger w-100" data-bs-dismiss="offcanvas">{{ $t('shop.clearFilters') }}</button>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useLanguageStore } from '@/stores/language'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import PriceRangeFilter from '@/components/filters/PriceRangeFilter.vue'
import RatingFilter from '@/components/filters/RatingFilter.vue'
import PaginationComponent from '@/components/common/PaginationComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useAnalytics } from '@/composables/useAnalytics'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const languageStore = useLanguageStore()
const analytics = useAnalytics()

const searchQuery = ref('')
const selectedCategory = ref(null)
const sortBy = ref('')
const priceRange = ref({ min: 0, max: 5000 })
const minRating = ref(null)
const inStockOnly = ref(false)
const loading = ref(true)
const categories = ref([])

// Client-side filtering and sorting on the server-fetched results
const filteredProducts = computed(() => {
  let products = [...productsStore.products]

  // Rating filter
  if (minRating.value) {
    products = products.filter(p => p.rating >= minRating.value)
  }

  // In stock filter
  if (inStockOnly.value) {
    products = products.filter(p => p.stock > 0)
  }

  // Sorting
  if (sortBy.value === 'price-asc') {
    products.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    products.sort((a, b) => b.price - a.price)
  } else if (sortBy.value === 'rating') {
    products.sort((a, b) => b.rating - a.rating)
  } else if (sortBy.value === 'newest') {
    products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  // Return the products (already paginated by server)
  return products
})

// Debounce search to avoid too many API calls
let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchFilteredProducts()
  }, 500)
}

async function fetchFilteredProducts(page = 1) {
  loading.value = true
  const filters = {
    page,
    limit: 40  // show 40 products per page
  }
  
  if (selectedCategory.value) filters.category = selectedCategory.value
  if (searchQuery.value) filters.search = searchQuery.value
  if (priceRange.value.min > 0) filters.minPrice = priceRange.value.min
  if (priceRange.value.max < 5000) filters.maxPrice = priceRange.value.max
  
  await productsStore.fetchProducts(filters)
  loading.value = false
  
  // Scroll to top of product grid
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handlePageChange(page) {
  fetchFilteredProducts(page)
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = null
  sortBy.value = ''
  priceRange.value = { min: 0, max: 5000 }
  minRating.value = null
  inStockOnly.value = false
  fetchFilteredProducts()
}

onMounted(async () => {
  await productsStore.fetchCategories()
  categories.value = productsStore.categories
  
  // Check for category from route query
  if (route.query.category) {
    selectedCategory.value = parseInt(route.query.category)
  }
  
  analytics.trackPageView('Shop Page', route.fullPath)
  await fetchFilteredProducts()
})

// Watchers
watch(selectedCategory, () => {
  fetchFilteredProducts()
})

watch(priceRange, () => {
  // Debounce price range changes
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchFilteredProducts()
  }, 500)
}, { deep: true })

// Update URL when filters change
watch([selectedCategory, searchQuery], () => {
  const query = {}
  if (selectedCategory.value) query.category = selectedCategory.value
  if (searchQuery.value) query.search = searchQuery.value
  
  router.replace({ query })
})
</script>

<style scoped>
.page-header {
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

.section-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--bs-primary), var(--bs-secondary));
  border-radius: 2px;
  margin-top: 0.5rem;
}

.input-group {
  border-radius: 0.375rem;
  overflow: hidden;
}

.input-group .form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.25rem rgba(231, 111, 26, 0.15);
}

.filters-sidebar {
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

/* Custom scrollbar for filters */
.filters-sidebar::-webkit-scrollbar {
  width: 6px;
}

.filters-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.filters-sidebar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.filters-sidebar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
