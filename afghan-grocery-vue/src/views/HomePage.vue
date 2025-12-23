<template>
  <div class="home-page">
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
                <i class="bi bi-box-seam"></i>{{ $t('home.hero.learnMore') }}
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
          <div v-for="i in 4" :key="i" class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12">
            <div class="card border-0 shadow-sm" style="height: 350px;">
              <div class="placeholder-glow">
                <div class="placeholder col-12" style="height: 200px;"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Products Grid -->
        <div v-else class="row g-3">
          <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12"
          >
            <ProductCard :product="product" />
          </div>
        </div>
      </div>
    </section>

    <!-- Section Divider -->
    <div class="section-separator"></div>

    <!-- Testimonials Section -->
    <TestimonialsSection />

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useLanguageStore } from '@/stores/language'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import NewsTicker from '@/components/common/NewsTicker.vue'
import TestimonialsSection from '@/components/common/TestimonialsSection.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import HeroBackground from '@/components/common/HeroBackground.vue'

const productsStore = useProductsStore()
const languageStore = useLanguageStore()
const featuredProducts = ref([])
const categories = ref([])
const loading = ref(true)
let refreshInterval = null

// Refresh featured products every 5 minutes (300000 ms)
const REFRESH_INTERVAL = 5 * 60 * 1000

async function loadFeaturedProducts() {
  try {
    await productsStore.fetchFeaturedProducts(4)
    featuredProducts.value = productsStore.featuredProducts
  } catch (error) {
    console.error('Error loading featured products:', error)
  }
}

onMounted(async () => {
  try {
    // Fetch categories with counts
    await productsStore.fetchCategoriesWithCounts()
    categories.value = productsStore.categories.map(cat => ({
      ...cat,
      count: cat.product_count || 0
    }))
    
    // Fetch featured products on mount
    await loadFeaturedProducts()
  } catch (error) {
    console.error('Error loading homepage data:', error)
    // Set empty arrays on error so page still renders
    categories.value = []
    featuredProducts.value = []
  } finally {
    loading.value = false
  }

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
</style>
