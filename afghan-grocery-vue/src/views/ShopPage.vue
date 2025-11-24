<template>
  <div class="shop-page">
    <AppHeader />
    
    <div class="container py-4">
      <!-- Page Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="mb-4">Shop All Products</h1>
          <div class="row g-3">
            <div class="col-lg-8 col-md-7 col-12">
              <div class="input-group">
                <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search products..."
                  class="form-control"
                  @input="handleSearch"
                />
              </div>
            </div>
            <div class="col-lg-3 col-md-4 col-sm-8 col-9">
              <select v-model="sortBy" class="form-select">
                <option value="">Sort By</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
            <div class="col-lg-1 col-md-1 col-sm-4 col-3 d-lg-none">
              <button class="btn btn-outline-primary w-100" type="button" data-bs-toggle="offcanvas" data-bs-target="#filtersOffcanvas">
                <i class="bi bi-funnel"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="row g-4">
        <!-- Desktop Filters Sidebar -->
        <aside class="col-lg-3 d-none d-lg-block">
          <div class="card border-0 shadow-sm sticky-top" style="top: 88px;">
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
                <div class="form-check">
                  <input v-model="verifiedOnly" type="checkbox" class="form-check-input" id="verifiedCheck" />
                  <label class="form-check-label" for="verifiedCheck">Verified Suppliers Only</label>
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
            <div class="form-check">
              <input v-model="verifiedOnly" type="checkbox" class="form-check-input" id="verifiedCheckMobile" />
              <label class="form-check-label" for="verifiedCheckMobile">Verified Suppliers Only</label>
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
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import PriceRangeFilter from '@/components/filters/PriceRangeFilter.vue'
import RatingFilter from '@/components/filters/RatingFilter.vue'

const route = useRoute()
const productsStore = useProductsStore()

const searchQuery = ref('')
const selectedCategory = ref(null)
const sortBy = ref('')
const priceRange = ref({ min: 0, max: 5000 })
const minRating = ref(null)
const inStockOnly = ref(false)
const verifiedOnly = ref(false)
const loading = ref(true)
const categories = ref([])

const filteredProducts = computed(() => {
  let products = [...productsStore.products]

  // Category filter
  if (selectedCategory.value) {
    products = products.filter(p => p.category === selectedCategory.value)
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    )
  }

  // Price range filter
  products = products.filter(p => 
    p.price >= priceRange.value.min && p.price <= priceRange.value.max
  )

  // Rating filter
  if (minRating.value) {
    products = products.filter(p => p.rating >= minRating.value)
  }

  // In stock filter
  if (inStockOnly.value) {
    products = products.filter(p => p.stock > 0)
  }

  // Verified suppliers filter
  if (verifiedOnly.value) {
    products = products.filter(p => p.verified)
  }

  // Sorting
  if (sortBy.value === 'price-asc') {
    products.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    products.sort((a, b) => b.price - a.price)
  } else if (sortBy.value === 'rating') {
    products.sort((a, b) => b.rating - a.rating)
  } else if (sortBy.value === 'newest') {
    products.sort((a, b) => b.id - a.id)
  }

  return products
})

function handleSearch() {
  // Debouncing handled by v-model
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = null
  sortBy.value = ''
  priceRange.value = { min: 0, max: 5000 }
  minRating.value = null
  inStockOnly.value = false
  verifiedOnly.value = false
}

onMounted(async () => {
  await productsStore.fetchCategories()
  categories.value = productsStore.categories
  
  await productsStore.fetchProducts()
  loading.value = false
  
  // Check for category from route query
  if (route.query.category) {
    selectedCategory.value = route.query.category
  }
})

watch(() => route.query.category, (newCategory) => {
  selectedCategory.value = newCategory || null
})

// Watch for filter changes to update route query (optional, for shareable URLs)
watch([selectedCategory, searchQuery, sortBy, priceRange, minRating, inStockOnly, verifiedOnly], () => {
  const query = {}
  if (selectedCategory.value) query.category = selectedCategory.value
  if (searchQuery.value) query.search = searchQuery.value
  if (sortBy.value) query.sort = sortBy.value
  if (priceRange.value.min !== 0) query.minPrice = priceRange.value.min
  if (priceRange.value.max !== 5000) query.maxPrice = priceRange.value.max
  if (minRating.value) query.minRating = minRating.value
  if (inStockOnly.value) query.inStock = true
  if (verifiedOnly.value) query.verified = true
  
  // router.push({ query }) // Uncomment if you want to update URL
}, { deep: true })
</script>

<style scoped>
/* Minimal custom styles - Bootstrap handles most of the layout */
</style>
