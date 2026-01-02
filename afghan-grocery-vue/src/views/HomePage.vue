<template>
  <div class="home-page">
    <LoadingSpinner :isLoading="loading" :fullScreen="true" size="lg" message="Loading featured products..." />
    <AppHeader />
    
    <!-- Hero Section -->
    <section class="hero py-5 position-relative overflow-hidden">
      <HeroBackground />
      <div class="container position-relative" style="z-index: 2;">
        <div class="row align-items-center min-vh-60">
          <div class="col-lg-6 col-md-6 col-12" :class="{ 'text-center text-md-start': !languageStore.isRTL }">
            <h1 class="display-4 fw-bold mb-4 fade-in-up delay-1">{{ $t('home.hero.title') }}</h1>
            <p class="lead text-muted mb-5 fade-in-up delay-2">
              {{ $t('home.hero.description') }}
            </p>
            <div class="d-flex gap-3 justify-content-center justify-content-md-start flex-wrap fade-in-up delay-3">
              <router-link to="/shop" class="btn btn-primary btn-lg d-inline-flex align-items-center gap-2">
                <i class="bi bi-bag"></i>{{ $t('home.hero.shopNow') }}
              </router-link>
              <router-link to="/tracking" class="btn btn-outline-secondary btn-lg d-inline-flex align-items-center gap-2">
                <i class="bi bi-box-seam"></i>{{ $t('home.hero.trackOrder') }}
              </router-link>
            </div>
          </div>
          <div class="col-lg-6 col-md-6 col-12 d-flex justify-content-center align-items-center fade-in-up delay-2">
            <div class="hero-image-wrapper">
              <img src="/images/delivery-hero.png" alt="Fast Delivery Service" class="img-fluid delivery-hero-img" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <NewsTicker />

    <!-- Categories Section -->
    <section class="categories-section py-5 bg-white">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="mb-2">{{ $t('home.categories.title') }}</h2>
          <div class="section-divider mx-auto"></div>
        </div>
        <div class="row g-4">
          <div
            v-for="category in categories"
            :key="category.id"
            class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6"
          >
            <router-link
              :to="`/shop?category=${category.id}`"
              class="card border-0 shadow-sm text-decoration-none h-100 category-card"
            >
              <div class="card-body text-center p-4">
                <div class="category-icon mb-3">{{ category.icon }}</div>
                <h5 class="card-title text-dark mb-2">{{ languageStore.getLocalizedName(category) }}</h5>
                <p class="card-text text-muted small mb-0">{{ category.count }}+ {{ $t('common.products') }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Divider -->
    <div class="section-separator"></div>

    <!-- Featured Products Section -->
    <section class="featured-section py-5 bg-light">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 class="mb-2">{{ $t('home.featured.title') }}</h2>
            <div class="section-divider"></div>
          </div>
          <router-link to="/shop" class="btn btn-outline-primary">
            {{ $t('home.hero.shopNow') }} <i class="bi bi-arrow-right ms-2"></i>
          </router-link>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="row g-3">
          <div v-for="i in 6" :key="i" class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12">
            <div class="card border-0 shadow-sm" style="height: 350px;">
              <div class="placeholder-glow">
                <div class="placeholder col-12" style="height: 200px;"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Products Carousel -->
        <div v-else>
          <!-- Product Cards Grid -->
          <div class="row g-3">
            <div
              v-for="product in paginatedProducts"
              :key="product.id"
              class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12 carousel-product-item"
            >
              <ProductCard :product="product" />
            </div>
          </div>
          
          <!-- Carousel Controls (Below Cards) -->
          <div v-if="maxPages > 1" class="carousel-controls mt-5 d-flex justify-content-center align-items-center gap-4">
            <!-- Previous Button -->
            <button
              @click="languageStore.isRTL ? nextPage() : prevPage()"
              class="carousel-arrow-btn"
              :aria-label="$t('common.previous') || 'Previous'"
            >
              <i :class="['bi', languageStore.isRTL ? 'bi-chevron-right' : 'bi-chevron-left']"></i>
            </button>
            
            <!-- Pagination Dots -->
            <div class="pagination-dots d-flex gap-2">
              <button
                v-for="page in maxPages"
                :key="page"
                @click="carouselPage = page - 1"
                class="pagination-dot"
                :class="{ active: carouselPage === page - 1 }"
                :aria-label="`Page ${page}`"
              ></button>
            </div>
            
            <!-- Next Button -->
            <button
              @click="languageStore.isRTL ? prevPage() : nextPage()"
              class="carousel-arrow-btn"
              :aria-label="$t('common.next') || 'Next'"
            >
              <i :class="['bi', languageStore.isRTL ? 'bi-chevron-left' : 'bi-chevron-right']"></i>
            </button>
          </div>
        </div>
        
        <!-- Mobile View All Button -->
        <div class="mt-5 text-center d-sm-none">
          <router-link to="/shop" class="btn btn-primary btn-lg">
            {{ $t('common.viewAll') }} <i class="bi bi-arrow-right ms-2"></i>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Section Divider -->
    <div class="section-separator"></div>

    <!-- Testimonials Section -->
    <TestimonialMarquee />

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useLanguageStore } from '@/stores/language'
import { useAnalytics } from '@/composables/useAnalytics'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import NewsTicker from '@/components/common/NewsTicker.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import TestimonialMarquee from '@/components/common/TestimonialMarquee.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import HeroBackground from '@/components/common/HeroBackground.vue'

const route = useRoute()
const productsStore = useProductsStore()
const languageStore = useLanguageStore()
const analytics = useAnalytics()
const featuredProducts = ref([])
const carouselPage = ref(0)
const itemsPerPage = ref(6)
const categories = ref([])
const loading = ref(true)
let refreshInterval = null

// Refresh featured products every 5 minutes (300000 ms)
const REFRESH_INTERVAL = 5 * 60 * 1000

async function loadFeaturedProducts() {
  try {
    await productsStore.fetchFeaturedProducts(12)
    featuredProducts.value = productsStore.featuredProducts
    carouselPage.value = 0
  } catch (error) {
    // Error handled by store
  }
}

async function loadHomePageData() {
  try {
    loading.value = true
    
    // Fetch categories with product counts
    await productsStore.fetchCategoriesWithCounts()
    
    if (!productsStore.categories || productsStore.categories.length === 0) {
      console.warn('No categories returned from API')
      categories.value = []
    } else {
      categories.value = productsStore.categories.map(cat => ({
        ...cat,
        count: cat.product_count || 0
      }))
    }
    
    // Fetch featured products
    await loadFeaturedProducts()
  } catch (error) {
    console.error('Error loading homepage data:', error)
    // Silently fail - page still renders
    categories.value = []
    featuredProducts.value = []
  } finally {
    loading.value = false
  }
}

// Carousel navigation
function nextPage() {
  const maxPages = Math.ceil(featuredProducts.value.length / itemsPerPage.value)
  carouselPage.value = (carouselPage.value + 1) % maxPages
}

function prevPage() {
  const maxPages = Math.ceil(featuredProducts.value.length / itemsPerPage.value)
  carouselPage.value = (carouselPage.value - 1 + maxPages) % maxPages
}

const paginatedProducts = computed(() => {
  const start = carouselPage.value * itemsPerPage.value
  const end = start + itemsPerPage.value
  return featuredProducts.value.slice(start, end)
})

const maxPages = computed(() => {
  return Math.ceil(featuredProducts.value.length / itemsPerPage.value)
})

onMounted(async () => {
  await loadHomePageData()
  
  // Track page view
  analytics.trackPageView('Home Page', route.fullPath)

  // Set up interval to refresh featured products
  refreshInterval = setInterval(() => {
    loadFeaturedProducts()
  }, REFRESH_INTERVAL)
})

onUnmounted(() => {
  // Clean up the interval when component is unmounted
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, rgba(231, 111, 26, 0.1) 0%, rgba(47, 157, 82, 0.1) 100%);
  min-height: 70vh;
  display: flex;
  align-items: center;
}

.min-vh-60 {
  min-height: 60vh;
}

.hero-image-wrapper {
  max-width: 500px;
  width: 100%;
  animation: float 3s ease-in-out infinite;
}

.delivery-hero-img {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.categories-section {
  position: relative;
}

.featured-section {
  position: relative;
}

.section-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--bs-primary), var(--bs-secondary));
  border-radius: 2px;
  margin-top: 0.5rem;
}

.section-separator {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(231, 111, 26, 0.2) 20%, rgba(47, 157, 82, 0.2) 80%, transparent 100%);
  margin: 0;
}


.category-card {
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
}

.category-icon {
  font-size: 3rem;
}

/* Animations */
.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.3s; }
.delay-3 { animation-delay: 0.5s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .hero {
    min-height: auto;
  }
  
  .min-vh-60 {
    min-height: auto;
  }
  
  .hero-image-wrapper {
    max-width: 350px;
    margin-top: 2rem;
  }
}

/* Carousel Styles */
.carousel-controls {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

/* Carousel Arrow Buttons */
.carousel-arrow-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--bs-primary);
  background: transparent;
  color: var(--bs-primary);
  cursor: pointer;
  transition: all 0.25s ease;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
}

.carousel-arrow-btn:hover {
  background: var(--bs-primary);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.carousel-arrow-btn:active {
  transform: scale(0.95);
}

.pagination-dots {
  align-items: center;
  justify-content: center;
}

.pagination-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--bs-primary);
  background: transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  padding: 0;
  min-width: 12px;
  min-height: 12px;
}

.pagination-dot:hover {
  background: var(--bs-primary);
  transform: scale(1.25);
}

.pagination-dot.active {
  background: var(--bs-primary);
}

/* Smooth product item appearance */
.carousel-product-item {
  transition: opacity 0.3s ease;
}
</style>
