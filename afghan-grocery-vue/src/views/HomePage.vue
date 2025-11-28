<template>
  <div class="home-page">
    <AppHeader />
    
    <!-- Hero Section -->
    <section class="hero py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8 col-md-10 col-12 text-center">
            <h1 class="display-4 fw-bold mb-4">Send Food, Share Love</h1>
            <p class="lead text-muted mb-5">
              Order essential groceries for your family in Afghanistan. 
              Fresh, quality products delivered to their doorstep.
            </p>
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <router-link to="/shop" class="btn btn-primary btn-lg">
                <i class="bi bi-bag me-2"></i>Shop Now
              </router-link>
              <router-link to="/tracking" class="btn btn-outline-secondary btn-lg">
                <i class="bi bi-box-seam me-2"></i>Track Order
              </router-link>
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
          <h2 class="mb-2">Shop by Category</h2>
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
                <h5 class="card-title text-dark mb-2">{{ category.name }}</h5>
                <p class="card-text text-muted small mb-0">{{ category.count }}+ products</p>
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
            <h2 class="mb-2">Featured Products</h2>
            <div class="section-divider"></div>
          </div>
          <router-link to="/shop" class="btn btn-outline-primary">
            View All <i class="bi bi-arrow-right ms-2"></i>
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
import { ref, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import NewsTicker from '@/components/common/NewsTicker.vue'
import TestimonialsSection from '@/components/common/TestimonialsSection.vue'
import ProductCard from '@/components/product/ProductCard.vue'

const productsStore = useProductsStore()
const featuredProducts = ref([])
const categories = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    // Fetch categories with counts
    await productsStore.fetchCategoriesWithCounts()
    categories.value = productsStore.categories.map(cat => ({
      ...cat,
      count: cat.product_count || 0
    }))
    
    // Fetch featured products
    await productsStore.fetchFeaturedProducts(4)
    featuredProducts.value = productsStore.featuredProducts
  } catch (error) {
    console.error('Error loading homepage data:', error)
    // Set empty arrays on error so page still renders
    categories.value = []
    featuredProducts.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, rgba(231, 111, 26, 0.1) 0%, rgba(47, 157, 82, 0.1) 100%);
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
</style>
