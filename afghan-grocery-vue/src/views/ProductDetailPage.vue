<template>
  <div class="product-detail-page">
    <LoadingSpinner :isLoading="loading" :fullScreen="true" message="Loading product details..." />
    <AppHeader />
    
    <div class="container py-4">
      <div v-if="product">
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
            <!-- Main Image with Navigation Arrows -->
            <div class="product-image-container position-relative mb-3">
              <img :src="mainImageUrl" :alt="product.name" class="product-main-image" />
              
              <!-- Navigation Arrows (only show if multiple images) -->
              <button 
                v-if="productImages.length > 1"
                class="nav-arrow"
                :class="{ 'nav-arrow-left': !isRTL, 'nav-arrow-right': isRTL }"
                @click="handlePreviousImage"
                :title="$t('common.previous')"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              <button 
                v-if="productImages.length > 1"
                class="nav-arrow"
                :class="{ 'nav-arrow-right': !isRTL, 'nav-arrow-left': isRTL }"
                @click="handleNextImage"
                :title="$t('common.next')"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
              
              <!-- Dynamic Badges -->
              <div class="position-absolute top-0 start-0 m-3 d-flex flex-column gap-2">
                <span v-if="product.verified === 1 || product.verified === true" class="badge bg-success">
                  <i class="bi bi-check-circle me-1"></i>{{ $t('product.verified') }}
                </span>
                <span v-if="product.featured === true || product.is_featured === 1" class="badge bg-warning text-dark">
                  <i class="bi bi-star-fill me-1"></i>{{ $t('product.featured') }}
                </span>
                <span v-if="product.is_new === 1 || product.is_new === true" class="badge bg-info">
                  {{ $t('product.new') }}
                </span>
                <span v-if="product.on_sale === true || product.on_sale === 1" class="badge bg-danger">
                  {{ $t('product.onSale') }}
                </span>
              </div>
            </div>
            
            <!-- Image Thumbnails Gallery (only show if multiple images) -->
            <div v-if="productImages.length > 1" class="image-gallery">
              <div class="gallery-thumbnails">
                <button
                  v-for="(image, index) in productImages"
                  :key="index"
                  class="thumbnail-btn"
                  :class="{ active: currentImageIndex === index }"
                  @click="currentImageIndex = index"
                  :title="`${$t('common.image')} ${index + 1}`"
                >
                  <img :src="getImageUrl(image)" :alt="`Product image ${index + 1}`" class="thumbnail-image" />
                </button>
              </div>
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
              <span class="display-5 fw-bold text-primary">{{ currencyStore.formatPrice(product.price) }}</span>
              <span v-if="product.compareAtPrice" class="fs-5 text-muted text-decoration-line-through">
                {{ currencyStore.formatPrice(product.compareAtPrice) }}
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

            <div class="d-flex gap-3 flex-wrap align-items-center">
              <div class="quantity-control" :dir="isRTL ? 'rtl' : 'ltr'">
                <button type="button" class="btn-qty" @click="decreaseQuantity" :style="{ order: isRTL ? 2 : 0 }">
                  <i class="bi bi-dash"></i>
                </button>
                <input v-model.number="quantity" type="number" min="1" :max="product.stock" 
                       class="input-qty" style="order: 1;" @change="validateQuantity" />
                <button type="button" class="btn-qty" @click="increaseQuantity" :style="{ order: isRTL ? 0 : 2 }">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
              <button 
                class="btn btn-primary btn-lg flex-grow-1" 
                @click="handleAddToCart"
                :disabled="product.stock === 0"
              >
                <i :class="['bi', isRTL ? 'bi-cart-plus ms-2' : 'bi-cart-plus me-2']"></i>{{ $t('product.addToCart') }}
              </button>
              <WishlistButton :product="product" class="btn-lg" />
            </div>
          </div>
        </div>

        <!-- Section Divider -->
        <div class="section-separator my-5"></div>

        <!-- Reviews Section -->
        <section class="reviews-section py-5">
          <div class="reviews-header mb-5">
            <h2 class="mb-2"><i class="bi bi-chat-left-quote me-2 text-primary"></i>{{ $t('product.reviews') }}</h2>
            <div class="section-divider"></div>
          </div>
          
          <ReviewForm :productId="product.id" @review-submitted="handleReviewSubmitted" />
          
          <div v-if="reviewsStore.reviews.length > 0" class="reviews-list">
            <h4 class="mb-4 text-dark">
              <i class="bi bi-chat-left-check me-2 text-success"></i>
              Customer Reviews ({{ reviewsStore.reviews.length }})
            </h4>
            <div class="row g-4">
              <div v-for="review in reviewsStore.reviews" :key="review.id" class="col-12">
                <div class="review-card-container">
                  <div class="review-header">
                    <div class="review-user-info">
                      <div class="user-avatar">{{ review.user_name?.charAt(0)?.toUpperCase() || 'U' }}</div>
                      <div class="user-details">
                        <h5 class="user-name mb-1">{{ review.user_name }}</h5>
                        <div class="d-flex align-items-center gap-3">
                          <StarRating :modelValue="review.rating" :showValue="true" />
                          <span class="review-date">{{ formatDate(review.created_at) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p class="review-comment mb-0">{{ review.comment }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-reviews-container">
            <div class="no-reviews-icon">📝</div>
            <p class="text-center text-muted mb-0">{{ $t('shop.noReviews') }}</p>
            <p class="text-center text-muted small">Be the first to review this product!</p>
          </div>
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
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import WishlistButton from '@/components/common/WishlistButton.vue'
import StarRating from '@/components/common/StarRating.vue'
import ReviewForm from '@/components/product/ReviewForm.vue'
import RelatedProducts from '@/components/product/RelatedProducts.vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { useCurrencyStore } from '@/stores/currency'

const route = useRoute()
const cartStore = useCartStore()
const productsStore = useProductsStore()
const reviewsStore = useReviewsStore()
const languageStore = useLanguageStore()
const analytics = useAnalytics()
const currencyStore = useCurrencyStore()
const { t } = useI18n()

const product = ref(null)
const quantity = ref(1)
const loading = ref(true)
const currentImageIndex = ref(0)

const productImages = computed(() => {
  if (!product.value) return []
  // Check if product has images array (JSON field)
  if (product.value.images && Array.isArray(product.value.images)) {
    return product.value.images
  }
  // Fallback to single image
  if (product.value.image) {
    return [product.value.image]
  }
  return []
})

const mainImageUrl = computed(() => {
  const images = productImages.value
  if (images.length === 0) return ''
  return getImageUrl(images[currentImageIndex.value])
})

const productImageUrl = computed(() => {
  if (!product.value) return ''
  return getImageUrl(product.value.image)
})

const formattedRating = computed(() => {
  if (!product.value || !product.value.rating) return '0.0'
  return Number(product.value.rating).toFixed(1)
})

const isRTL = computed(() => {
  return languageStore.currentLocale === 'ps' || languageStore.currentLocale === 'fa'
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

function nextImage() {
  if (currentImageIndex.value < productImages.value.length - 1) {
    currentImageIndex.value++
  }
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

function handleNextImage() {
  if (isRTL.value) {
    previousImage()
  } else {
    nextImage()
  }
}

function handlePreviousImage() {
  if (isRTL.value) {
    nextImage()
  } else {
    previousImage()
  }
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
  border-radius: 0.75rem;
  padding: 2rem;
}

.reviews-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--bs-dark);
}

.reviews-list h4 {
  font-size: 1.15rem;
  font-weight: 600;
}

.review-card-container {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.review-card-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.review-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.review-user-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--bs-primary), var(--bs-secondary));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.025rem;
  font-weight: 600;
  color: var(--bs-dark);
}

.review-date {
  font-size: 0.875rem;
  color: var(--bs-secondary);
  font-weight: 500;
}

.review-comment {
  color: var(--bs-body-color);
  line-height: 1.6;
  font-size: 0.975rem;
}

.no-reviews-container {
  text-align: center;
  padding: 3rem 2rem;
  background: #fff;
  border-radius: 0.5rem;
  border: 2px dashed rgba(0, 0, 0, 0.1);
}

.no-reviews-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
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

.quantity-control {
  display: flex;
  border: 2px solid var(--bs-border-color);
  border-radius: 0.5rem;
  overflow: hidden;
  align-items: center;
  background: #fff;
}

.btn-qty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: none;
  padding: 0.75rem 1rem;
  color: var(--bs-dark);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  min-width: 50px;
  height: 100%;
}

.btn-qty:hover {
  background: #e9ecef;
  color: var(--bs-primary);
}

.btn-qty:active {
  background: #dee2e6;
}

.input-qty {
  flex: 0 0 80px;
  border: none;
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
  background: #fff;
  border-left: 1px solid var(--bs-border-color);
  border-right: 1px solid var(--bs-border-color);
}

.input-qty:focus {
  outline: none;
  background: #f8f9fa;
}

.quantity-control[dir="rtl"] .input-qty {
  border-left: 1px solid var(--bs-border-color);
  border-right: 1px solid var(--bs-border-color);
}

/* Product Image Gallery Styles */
.product-image-container {
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.product-image-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1.5rem;
  object-position: center;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid var(--bs-border-color);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  color: var(--bs-dark);
  font-size: 1.3rem;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-arrow:hover {
  background: rgba(255, 255, 255, 1);
  border-color: var(--bs-primary);
  color: var(--bs-primary);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.nav-arrow:active {
  transform: translateY(-50%) scale(0.95);
}

.nav-arrow-left {
  left: 15px;
}

.nav-arrow-right {
  right: 15px;
}

/* Image Gallery Styles */
.image-gallery {
  margin-top: 1rem;
  background: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.gallery-thumbnails {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.25rem 0;
  scroll-behavior: smooth;
}

.gallery-thumbnails::-webkit-scrollbar {
  height: 6px;
}

.gallery-thumbnails::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.gallery-thumbnails::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.gallery-thumbnails::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.thumbnail-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  width: 80px;
  aspect-ratio: 1 / 1;
  padding: 3px;
  border: 2px solid var(--bs-border-color);
  background: #fff;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.thumbnail-btn:hover {
  border-color: var(--bs-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
}

.thumbnail-btn.active {
  border-color: var(--bs-primary);
  border-width: 3px;
  box-shadow: 0 6px 16px rgba(13, 110, 253, 0.35);
  background: linear-gradient(135deg, #e7f1ff 0%, #f0f8ff 100%);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2px;
}
</style>
