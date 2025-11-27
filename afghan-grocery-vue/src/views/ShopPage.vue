<template>
  <div class="shop-page">
    <AppHeader />
    
    <!-- Page Header -->
    <section class="page-header py-4 bg-light border-bottom">
      <div class="container">
        <div class="row mb-3">
          <div class="col-12">
            <h1 class="mb-2">Shop All Products</h1>
            <div class="section-divider"></div>
          </div>
        </div>
        <div class="row g-3">
          <div class="col-lg-8 col-md-7 col-12">
            <div class="input-group shadow-sm">
              <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products..."
                class="form-control border-start-0"
                @input="handleSearch"
              />
            </div>
          </div>
          <div class="col-lg-3 col-md-4 col-sm-8 col-9">
            <select v-model="sortBy" class="form-select shadow-sm">
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
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
                <h5 class="mb-0 fw-bold">Filters</h5>
                <button @click="clearFilters" class="btn btn-link btn-sm text-primary p-0 text-decoration-underline">Clear All</button>
              </div>

              <!-- Categories -->
              <div class="mb-4 pb-4 border-bottom">
                <h6 class="fw-semibold mb-3">Categories</h6>
                <div class="d-flex flex-column gap-2">
                  <button
                    v-for="category in categories"
                    :key="category.id"
                    :class="['btn btn-sm text-start', selectedCategory === category.id ? 'btn-primary' : 'btn-outline-secondary']"
                    @click="selectedCategory = category.id"
                  >
                    {{ category.icon }} {{ category.name }}
                  </button>
                  <button
                    :class="['btn btn-sm text-start', !selectedCategory ? 'btn-primary' : 'btn-outline-secondary']"
                    @click="selectedCategory = null"
                  >
                    All Products
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
                <h6 class="fw-semibold mb-3">Other Filters</h6>
                <div class="form-check mb-2">
                  <input v-model="inStockOnly" type="checkbox" class="form-check-input" id="inStockCheck" />
                  <label class="form-check-label" for="inStockCheck">In Stock Only</label>
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
            <span class="fw-semibold">{{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'product' : 'products' }} found</span>
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
            <h2 class="mb-3">No products found</h2>
            <p class="text-muted mb-4">Try adjusting your search or filters</p>
            <button @click="clearFilters" class="btn btn-primary">Clear Filters</button>
          </div>
          
          <!-- Products Grid -->
          <div v-else class="row g-3">
            <div v-for="product in filteredProducts" :key="product.id" class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-6">
              <ProductCard :product="product" />
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Filters Offcanvas -->
      <div class="offcanvas offcanvas-start" tabindex="-1" id="filtersOffcanvas" aria-labelledby="filtersOffcanvasLabel">
        <div class="offcanvas-header border-bottom">
          <h5 class="offcanvas-title fw-bold" id="filtersOffcanvasLabel">Filters</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <!-- Categories -->
          <div class="mb-4 pb-4 border-bottom">
            <h6 class="fw-semibold mb-3">Categories</h6>
            <div class="d-flex flex-column gap-2">
              <button
                v-for="category in categories"
                :key="category.id"
                :class="['btn btn-sm text-start', selectedCategory === category.id ? 'btn-primary' : 'btn-outline-secondary']"
                @click="selectedCategory = category.id"
                data-bs-dismiss="offcanvas"
              >
                {{ category.icon }} {{ category.name }}
              </button>
              <button
                :class="['btn btn-sm text-start', !selectedCategory ? 'btn-primary' : 'btn-outline-secondary']"
                @click="selectedCategory = null"
                data-bs-dismiss="offcanvas"
              >
                All Products
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
            <h6 class="fw-semibold mb-3">Other Filters</h6>
            <div class="form-check mb-2">
              <input v-model="inStockOnly" type="checkbox" class="form-check-input" id="inStockCheckMobile" />
              <label class="form-check-label" for="inStockCheckMobile">In Stock Only</label>
            </div>
          </div>

          <!-- Clear All Button -->
          <button @click="clearFilters" class="btn btn-outline-danger w-100" data-bs-dismiss="offcanvas">Clear All Filters</button>
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
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import PriceRangeFilter from '@/components/filters/PriceRangeFilter.vue'
import RatingFilter from '@/components/filters/RatingFilter.vue'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()

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

async function fetchFilteredProducts() {
  loading.value = true
  const filters = {}
  
  if (selectedCategory.value) filters.category = selectedCategory.value
  if (searchQuery.value) filters.search = searchQuery.value
  if (priceRange.value.min > 0) filters.minPrice = priceRange.value.min
  if (priceRange.value.max < 5000) filters.maxPrice = priceRange.value.max
  
  await productsStore.fetchProducts(filters)
  loading.value = false
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
