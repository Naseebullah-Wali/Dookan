<template>
  <div class="wishlist-page">
    <LoadingSpinner :isLoading="loading" :fullScreen="true" message="Loading wishlist..." />
    <AppHeader />
    
    <div class="container py-4 py-md-5">
      <h1 class="text-center mb-4 mb-md-5">{{ $t('common.wishlist') }}</h1>

      <!-- Auth Required State -->
      <div v-if="!authStore.isAuthenticated" class="row justify-content-center">
        <div class="col-lg-4 col-md-6 col-12">
          <div class="card border-0 shadow-sm text-center p-5">
            <div style="font-size: 4rem;" class="mb-4">🔒</div>
            <h2 class="mb-3">{{ $t('messages.loginRequired') }}</h2>
            <p class="text-muted mb-4">{{ $t('messages.loginToViewWishlist') }}</p>
            <router-link to="/login" class="btn btn-primary">{{ $t('common.login') }}</router-link>
          </div>
        </div>
      </div>

      <!-- Empty Wishlist State -->
      <div v-else-if="wishlistStore.items.length === 0" class="text-center py-5">
        <div style="font-size: 5rem; opacity: 0.3;" class="mb-4">❤️</div>
        <h2 class="mb-3">{{ $t('wishlist.empty') }}</h2>
        <p class="text-muted mb-4">{{ $t('wishlist.emptyDesc') }}</p>
        <router-link to="/shop" class="btn btn-primary btn-lg">{{ $t('cart.continueShopping') }}</router-link>
      </div>

      <!-- Wishlist Content -->
      <div v-else>
        <!-- Wishlist Header -->
        <div class="alert alert-light d-flex justify-content-between align-items-center mb-4">
          <span class="fw-semibold">
            <i class="bi bi-heart-fill text-danger me-2"></i>
            {{ $t('wishlist.itemsInWishlist', { count: wishlistStore.itemCount }) }}
          </span>
          <button @click="handleClearAll" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-trash me-1"></i>{{ $t('cart.clearAll') }}
          </button>
        </div>

        <!-- Wishlist Grid -->
        <div class="row g-4">
          <div v-for="item in wishlistStore.items" :key="item.id" class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12">
            <div v-if="item.product" class="card border-0 shadow-sm h-100 wishlist-item">
              <button class="btn btn-light btn-sm position-absolute top-0 end-0 m-2 rounded-circle remove-btn" @click="handleRemove(item.productId)" title="Remove from wishlist">
                <i class="bi bi-x-lg"></i>
              </button>
              <router-link :to="`/product/${item.productId}`" class="text-decoration-none">
                <img :src="getImageUrl(item.product.image)" :alt="item.product.name_en || item.product.name || 'Product'" class="card-img-top item-image" />
              </router-link>
              <!-- Dynamic Badges (Left Side) -->
              <div class="position-absolute top-0 start-0 m-2 d-flex flex-column gap-2">
                <span v-if="item.product.verified === 1 || item.product.verified === true" class="badge bg-success">
                  <i class="bi bi-check-circle me-1"></i>{{ $t('product.verified') }}
                </span>
                <span v-if="item.product.featured === true || item.product.is_featured === 1" class="badge bg-warning text-dark">
                  <i class="bi bi-star-fill me-1"></i>{{ $t('product.featured') }}
                </span>
                <span v-if="item.product.is_new === 1 || item.product.is_new === true" class="badge bg-info">
                  {{ $t('product.new') }}
                </span>
                <span v-if="item.product.on_sale === true || item.product.on_sale === 1" class="badge bg-danger">
                  {{ $t('product.onSale') }}
                </span>
              </div>
              <div class="card-body text-center d-flex flex-column">
                <router-link :to="`/product/${item.productId}`" class="text-decoration-none">
                  <h5 class="card-title text-dark mb-2">{{ languageStore.getLocalizedName(item.product) || 'Untitled' }}</h5>
                </router-link>
                <p class="card-text text-muted small mb-2">{{ item.product.weight ? `${item.product.weight}` : '' }}</p>
                <div class="mb-2">
                  <span class="text-warning"><i class="bi bi-star-fill"></i> {{ (item.product.rating || 0).toFixed(1) }}</span>
                </div>
                <div class="fs-5 fw-bold text-primary mb-3">{{ formatPrice(item.product.price) }} {{ $t('common.afn') }}</div>
                <button class="btn btn-primary w-100 mt-auto" @click="handleAddToCart(item)">
                  <i class="bi bi-cart-plus me-2"></i>{{ $t('product.addToCart') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useLanguageStore } from '@/stores/language'
import { useI18n } from 'vue-i18n'
import { getImageUrl } from '@/services/imageService'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const wishlistStore = useWishlistStore()
const authStore = useAuthStore()
const cartStore = useCartStore()
const languageStore = useLanguageStore()
const { t } = useI18n()

const loading = computed(() => wishlistStore.loading)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await wishlistStore.fetchWishlist()
  }
})

function formatPrice(price) {
  return price?.toLocaleString() || '0'
}

async function handleRemove(productId) {
  await wishlistStore.removeFromWishlist(productId)
}

async function handleClearAll() {
  if (confirm(t('messages.confirmDelete'))) {
    const success = await wishlistStore.clearWishlist()
    if (success) {
      window.showToast(t('messages.success'), 'success')
    } else {
      window.showToast(t('messages.error'), 'error')
    }
  }
}

function handleAddToCart(item) {
  cartStore.addToCart(item.product)
  window.showToast(t('messages.addedToCart'), 'success')
}
</script>

<style scoped>
.wishlist-item {
  transition: all 0.3s ease;
}

.wishlist-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
}

.remove-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background-color: var(--bs-danger) !important;
  color: white !important;
  transform: scale(1.1);
}

.item-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.wishlist-item:hover .item-image {
  transform: scale(1.05);
}
</style>
