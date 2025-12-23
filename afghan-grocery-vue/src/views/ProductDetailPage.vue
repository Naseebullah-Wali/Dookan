<template>
  <div class="product-detail-page">
    <AppHeader />
    
    <div class="container py-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ $t('common.loading') }}</span>
        </div>
      </div>

      <div v-else-if="product">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><router-link to="/">{{ $t('common.home') }}</router-link></li>
            <li class="breadcrumb-item"><router-link to="/shop">{{ $t('common.shop') }}</router-link></li>
            <li class="breadcrumb-item active">{{ languageStore.getLocalizedName(product) }}</li>
          </ol>
        </nav>

        <!-- Product Info -->
        <div class="row g-4 mb-5">
          <div class="col-lg-6 col-12">
            <div class="position-relative">
              <img :src="productImageUrl" :alt="product.name" class="img-fluid rounded shadow-lg" />
              <span v-if="product.verified" class="badge bg-success position-absolute top-0 start-0 m-3">
                <i class="bi bi-check-circle me-1"></i>{{ $t('product.verified') }}
              </span>
            </div>
          </div>

          <div class="col-lg-6 col-12">
            <h1 class="mb-3">{{ languageStore.getLocalizedName(product) }}</h1>
            
            <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
              <div v-if="product.rating && product.rating > 0" class="d-flex gap-2 align-items-center">
                <span class="text-warning fw-semibold"><i class="bi bi-star-fill"></i> {{ formattedRating }}</span>
                <span class="text-muted small">({{ product.review_count }} {{ $t('product.reviews') }})</span>
              </div>
              <div v-else></div>
              <span class="fw-semibold" :class="product.stock > 0 ? 'text-success' : 'text-danger'">
                {{ product.stock > 0 ? `${$t('product.inStock')} (${product.stock})` : $t('product.outOfStock') }}
              </span>
            </div>

            <div class="d-flex align-items-center gap-3 mb-4">
              <span class="display-5 fw-bold text-primary">{{ formatPrice(product.price) }} {{ $t('common.afn') }}</span>
              <span v-if="product.compareAtPrice" class="fs-5 text-muted text-decoration-line-through">
                {{ formatPrice(product.compareAtPrice) }} {{ $t('common.afn') }}
              </span>
              <span v-if="product.compareAtPrice" class="badge bg-danger">
                {{ $t('product.sale') }} {{ Math.round((1 - product.price / product.compareAtPrice) * 100) }}% {{ $t('product.off') }}
              </span>
            </div>

            <p class="lead mb-4">{{ languageStore.getLocalizedName(product, 'description') }}</p>

            <div class="bg-light p-4 rounded mb-4">
              <div class="d-flex justify-content-between py-2 border-bottom">
                <span class="fw-semibold">{{ $t('product.size') }}:</span>
                <span>{{ product.size || 'Standard' }}</span>
              </div>
              <div v-if="product.weight" class="d-flex justify-content-between py-2 border-bottom">
                <span class="fw-semibold">{{ $t('product.weight') }}:</span>
                <span>{{ product.weight }}</span>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom">
                <span class="fw-semibold">{{ $t('product.supplier') }}:</span>
                <span>{{ product.supplier || 'Afghan Grocery' }}</span>
              </div>
              <div class="d-flex justify-content-between py-2">
                <span class="fw-semibold">{{ $t('shop.category') }}:</span>
                <span>{{ getCategoryName(product.category_id) }}</span>
              </div>
            </div>

            <div class="d-flex gap-3 flex-wrap">
              <div class="btn-group" role="group">
                <button type="button" class="btn btn-outline-secondary" @click="decreaseQuantity">
                  <i class="bi bi-dash"></i>
                </button>
                <input v-model.number="quantity" type="number" min="1" :max="product.stock" 
                       class="form-control text-center fw-semibold" style="width: 80px;" @change="validateQuantity" />
                <button type="button" class="btn btn-outline-secondary" @click="increaseQuantity">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
              <button 
                class="btn btn-primary btn-lg flex-grow-1" 
                @click="handleAddToCart"
                :disabled="product.stock === 0"
              >
                <i class="bi bi-cart-plus me-2"></i>{{ $t('product.addToCart') }}
              </button>
              <WishlistButton :product="product" class="btn-lg" />
            </div>
          </div>
        </div>

        <!-- Section Divider -->
        <div class="section-separator my-5"></div>

        <!-- Reviews Section -->
        <section class="reviews-section py-5">
          <div class="mb-4">
            <h2 class="mb-2">{{ $t('product.reviews') }}</h2>
            <div class="section-divider"></div>
          </div>
          
          <ReviewForm :productId="product.id" @review-submitted="handleReviewSubmitted" />
          
          <div v-if="reviewsStore.reviews.length > 0" class="row g-3 mt-4">
            <div v-for="review in reviewsStore.reviews" :key="review.id" class="col-12">
              <div class="card shadow-sm review-card">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span class="fw-semibold d-block">{{ review.user_name }}</span>
                      <StarRating :modelValue="review.rating" :showValue="false" />
                    </div>
                    <span class="text-muted small">{{ formatDate(review.created_at) }}</span>
                  </div>
                  <p class="mb-0">{{ review.comment }}</p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-center text-muted py-5">{{ $t('shop.noReviews') }}</p>
        </section>

        <!-- Related Products -->
        <RelatedProducts 
          v-if="product"
          :currentProductId="product.id"
          :category="product.category_id"
          :maxItems="8"
        />
      </div>

      <div v-else class="text-center py-5">
        <h2 class="mb-4">{{ $t('shop.productNotFound') }}</h2>
        <router-link to="/shop" class="btn btn-primary">{{ $t('shop.backToShop') }}</router-link>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { useReviewsStore } from '@/stores/reviews'
import { useLanguageStore } from '@/stores/language'
import { useI18n } from 'vue-i18n'
import { getImageUrl } from '@/services/imageService'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import WishlistButton from '@/components/common/WishlistButton.vue'
import StarRating from '@/components/common/StarRating.vue'
import ReviewForm from '@/components/product/ReviewForm.vue'
import RelatedProducts from '@/components/product/RelatedProducts.vue'
import { useAnalytics } from '@/composables/useAnalytics'

const route = useRoute()
const cartStore = useCartStore()
const productsStore = useProductsStore()
const reviewsStore = useReviewsStore()
const languageStore = useLanguageStore()
const analytics = useAnalytics()
const { t } = useI18n()

const product = ref(null)
const quantity = ref(1)
const loading = ref(true)

const productImageUrl = computed(() => {
  if (!product.value) return ''
  return getImageUrl(product.value.image)
})

const formattedRating = computed(() => {
  if (!product.value || !product.value.rating) return '0.0'
  return Number(product.value.rating).toFixed(1)
})

async function loadProduct(productId) {
  loading.value = true
  
  // Ensure categories are loaded for getCategoryName
  if (productsStore.categories.length === 0) {
    await productsStore.fetchCategories()
  }

  product.value = await productsStore.fetchProductById(productId)
  
  if (product.value) {
    await reviewsStore.fetchProductReviews(productId)
    analytics.trackPageView(`Product: ${product.value.name_en}`, route.fullPath)
    analytics.trackProductView(product.value)
  }
  
  loading.value = false
  
  // Scroll to top when product changes
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  const productId = route.params.id
  await loadProduct(productId)
})

// Watch for route changes to reload product when clicking related products
watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await loadProduct(newId)
  }
})

function formatPrice(price) {
  return price?.toLocaleString() || '0'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

function getCategoryName(categoryId) {
  const category = productsStore.categories.find(c => c.id === categoryId)
  return category ? languageStore.getLocalizedName(category) : categoryId
}

function handleAddToCart() {
  cartStore.addToCart(product.value, quantity.value)
  analytics.trackAddToCart(product.value, quantity.value)
  window.showToast(t('messages.addedToCart'), 'success')
  quantity.value = 1
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function increaseQuantity() {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

function validateQuantity() {
  // Ensure quantity is within valid range
  if (quantity.value < 1) quantity.value = 1
  if (quantity.value > product.value.stock) quantity.value = product.value.stock
}

function handleReviewSubmitted(newReview) {
  // Review is already added to store by createReview action
  // Just update local product stats
  const totalRating = reviewsStore.reviews.reduce((sum, r) => sum + r.rating, 0)
  product.value.rating = (totalRating / reviewsStore.reviews.length)
  product.value.review_count = reviewsStore.reviews.length
}

</script>

<style scoped>
.section-separator {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(231, 111, 26, 0.2) 20%, rgba(47, 157, 82, 0.2) 80%, transparent 100%);
  margin: 0;
}

.section-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--bs-primary), var(--bs-secondary));
  border-radius: 2px;
  margin-top: 0.5rem;
}

.reviews-section {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 0.5rem;
  padding: 2rem;
}

.review-card {
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-left: 3px solid var(--bs-primary) !important;
  background: #ffffff;
  transition: all 0.3s ease;
}

.review-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border-left-color: var(--bs-secondary) !important;
}
</style>
