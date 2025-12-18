<template>
  <div class="card h-100 border-0 shadow-sm product-card">
    <div class="position-relative product-image-wrapper">
      <img :src="productImageUrl" :alt="product.name" class="card-img-top product-image" />
      
      <!-- Dynamic Badges -->
      <div class="position-absolute top-0 end-0 m-2 d-flex flex-column gap-2 align-items-end">
        <span v-if="product.verified" class="badge bg-success">
          <i class="bi bi-check-circle me-1"></i>{{ $t('product.verified') }}
        </span>
        <span v-if="product.sale_percentage > 0" class="badge bg-danger">
          {{ product.sale_percentage }}% {{ $t('product.off') }}
        </span>
        <span v-if="product.is_new" class="badge bg-info">
          {{ $t('product.new') }}
        </span>
      </div>
      
      <WishlistButton :product="product" class="position-absolute top-0 start-0 m-3" />
    </div>
    <div class="card-body d-flex flex-column">
      <router-link :to="`/product/${product.id}`" class="text-decoration-none">
        <h5 class="card-title text-dark fw-semibold mb-2 product-title">{{ languageStore.getLocalizedName(product) }}</h5>
      </router-link>
      <p v-if="product.size || product.weight || product.supplier" class="card-text text-muted small mb-2">
        <span v-if="product.weight">{{ product.weight }}</span>
        <span v-if="product.weight && (product.size || product.supplier)"> • </span>
        <span v-if="product.size">{{ product.size }}</span>
        <span v-if="product.size && product.supplier"> • </span>
        <span v-if="product.supplier">{{ product.supplier }}</span>
      </p>
      <div v-if="product.rating && product.rating > 0" class="d-flex align-items-center gap-2 mb-2">
        <span class="text-warning"><i class="bi bi-star-fill"></i> {{ formattedRating }}</span>
        <!-- <span class="text-muted small">({{ product.reviewCount }})</span> -->
      </div>
      <div class="d-flex align-items-center gap-2 mb-3">
        <span class="fs-5 fw-bold text-primary">{{ formatPrice(product.price) }} {{ $t('common.afn') }}</span>
        <span v-if="product.compareAtPrice" class="text-muted text-decoration-line-through small">
          {{ formatPrice(product.compareAtPrice) }} {{ $t('common.afn') }}
        </span>
      </div>
      <button class="btn btn-primary w-100 mt-auto" @click="handleAddToCart">
        <i class="bi bi-cart-plus me-2"></i>{{ $t('product.addToCart') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useLanguageStore } from '@/stores/language'
import WishlistButton from '@/components/common/WishlistButton.vue'
import { getImageUrl } from '@/services/imageService'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()
const languageStore = useLanguageStore()
const { t } = useI18n()

// Computed property for product image URL
const productImageUrl = computed(() => getImageUrl(props.product.image))

// Computed property for formatted rating (1 decimal place)
const formattedRating = computed(() => {
  const rating = props.product.rating || 0
  return rating.toFixed(1)
})

function formatPrice(price) {
  return price.toLocaleString()
}

function handleAddToCart() {
  cartStore.addToCart(props.product)
  window.showToast(t('messages.addedToCart'), 'success')
}

</script>

<style scoped>
.product-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
}

.product-image-wrapper {
  width: 100%;
  padding-top: 100%;
  background-color: #f8f9fa;
  overflow: hidden;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-title:hover {
  color: var(--bs-primary) !important;
}

/* Mobile Optimizations */
@media (max-width: 767px) {
  .product-card:hover {
    transform: none;
  }
  
  .product-title {
    font-size: 0.9375rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
