<template>
  <div class="product-detail-page">
    <AppHeader />
    
    <div class="container py-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="product">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><router-link to="/">Home</router-link></li>
            <li class="breadcrumb-item"><router-link to="/shop">Shop</router-link></li>
            <li class="breadcrumb-item active">{{ product.name }}</li>
          </ol>
        </nav>

        <!-- Product Info -->
        <div class="row g-4 mb-5">
          <div class="col-lg-6 col-12">
            <div class="position-relative">
              <img :src="productImageUrl" :alt="product.name" class="img-fluid rounded shadow-lg" />
              <span v-if="product.verified" class="badge bg-success position-absolute top-0 start-0 m-3">
                <i class="bi bi-check-circle me-1"></i>Verified Supplier
              </span>
            </div>
          </div>

          <div class="col-lg-6 col-12">
            <h1 class="mb-3">{{ product.name }}</h1>
            
            <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
              <div class="d-flex gap-2 align-items-center">
                <span class="text-warning fw-semibold"><i class="bi bi-star-fill"></i> {{ formattedRating }}</span>
                <span class="text-muted small">({{ product.review_count }} reviews)</span>
              </div>
              <span class="fw-semibold" :class="product.stock > 0 ? 'text-success' : 'text-danger'">
                {{ product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock' }}
              </span>
            </div>

            <div class="d-flex align-items-center gap-3 mb-4">
              <span class="display-5 fw-bold text-primary">{{ formatPrice(product.price) }} AFN</span>
              <span v-if="product.compareAtPrice" class="fs-5 text-muted text-decoration-line-through">
                {{ formatPrice(product.compareAtPrice) }} AFN
              </span>
              <span v-if="product.compareAtPrice" class="badge bg-danger">
                Save {{ Math.round((1 - product.price / product.compareAtPrice) * 100) }}%
              </span>
            </div>

            <p class="lead mb-4">{{ product.description }}</p>

            <div class="bg-light p-4 rounded mb-4">
              <div class="d-flex justify-content-between py-2 border-bottom">
                <span class="fw-semibold">Size:</span>
                <span>{{ product.size || 'Standard' }}</span>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom">
                <span class="fw-semibold">Supplier:</span>
                <span>{{ product.supplier || 'Afghan Grocery' }}</span>
              </div>
              <div class="d-flex justify-content-between py-2">
                <span class="fw-semibold">Category:</span>
                <span>{{ getCategoryName(product.category_id) }}</span>
              </div>
            </div>

            <div class="d-flex gap-3 flex-wrap">
              <div class="btn-group" role="group">
                <button class="btn btn-outline-secondary" @click="quantity > 1 && quantity--">
                  <i class="bi bi-dash"></i>
                </button>
                <input v-model.number="quantity" type="number" min="1" :max="product.stock" 
                       class="form-control text-center fw-semibold" style="width: 80px;" />
                <button class="btn btn-outline-secondary" @click="quantity < product.stock && quantity++">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
              <button 
                class="btn btn-primary btn-lg flex-grow-1" 
                @click="handleAddToCart"
                :disabled="product.stock === 0"
              >
                <i class="bi bi-cart-plus me-2"></i>Add to Cart
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
            <h2 class="mb-2">Customer Reviews</h2>
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
          <p v-else class="text-center text-muted py-5">No reviews yet. Be the first to review!</p>
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
        <h2 class="mb-4">Product not found</h2>
        <router-link to="/shop" class="btn btn-primary">Back to Shop</router-link>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { useReviewsStore } from '@/stores/reviews'
import { getImageUrl } from '@/services/imageService'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import WishlistButton from '@/components/common/WishlistButton.vue'
import StarRating from '@/components/common/StarRating.vue'
import ReviewForm from '@/components/product/ReviewForm.vue'
import RelatedProducts from '@/components/product/RelatedProducts.vue'

const route = useRoute()
const cartStore = useCartStore()
const productsStore = useProductsStore()
const reviewsStore = useReviewsStore()

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

onMounted(async () => {
  const productId = route.params.id
  
  // Ensure categories are loaded for getCategoryName
  if (productsStore.categories.length === 0) {
    await productsStore.fetchCategories()
  }

  product.value = await productsStore.fetchProductById(productId)
  
  if (product.value) {
    await reviewsStore.fetchProductReviews(productId)
  }
  
  loading.value = false
})

function formatPrice(price) {
  return price?.toLocaleString() || '0'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

function getCategoryName(categoryId) {
  const category = productsStore.categories.find(c => c.id === categoryId)
  return category ? category.name : categoryId
}

function handleAddToCart() {
  cartStore.addToCart(product.value, quantity.value)
  window.showToast(`${quantity.value}x ${product.value.name} added to cart!`, 'success')
  quantity.value = 1
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
