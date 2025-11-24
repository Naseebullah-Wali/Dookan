<template>
  <div class="wishlist-page">
    <AppHeader />
    
    <div class="container py-4 py-md-5">
      <h1 class="text-center mb-4 mb-md-5">My Wishlist</h1>

      <!-- Auth Required State -->
      <div v-if="!authStore.isAuthenticated" class="row justify-content-center">
        <div class="col-lg-4 col-md-6 col-12">
          <div class="card border-0 shadow-sm text-center p-5">
            <div style="font-size: 4rem;" class="mb-4">🔒</div>
            <h2 class="mb-3">Login Required</h2>
            <p class="text-muted mb-4">Please login to view your wishlist</p>
            <router-link to="/login" class="btn btn-primary">Login</router-link>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Empty Wishlist State -->
      <div v-else-if="wishlistStore.items.length === 0" class="text-center py-5">
        <div style="font-size: 5rem; opacity: 0.3;" class="mb-4">❤️</div>
        <h2 class="mb-3">Your wishlist is empty</h2>
        <p class="text-muted mb-4">Save your favorite products to buy them later!</p>
        <router-link to="/shop" class="btn btn-primary btn-lg">Browse Products</router-link>
      </div>

      <!-- Wishlist Content -->
      <div v-else>
        <!-- Wishlist Header -->
        <div class="alert alert-light d-flex justify-content-between align-items-center mb-4">
          <span class="fw-semibold">
            <i class="bi bi-heart-fill text-danger me-2"></i>
            {{ wishlistStore.itemCount }} {{ wishlistStore.itemCount === 1 ? 'item' : 'items' }} in your wishlist
          </span>
          <button @click="handleClearAll" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-trash me-1"></i>Clear All
          </button>
        </div>

        <!-- Wishlist Grid -->
        <div class="row g-4">
          <div v-for="item in wishlistStore.items" :key="item.id" class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12">
            <div class="card border-0 shadow-sm h-100 wishlist-item">
              <button class="btn btn-light btn-sm position-absolute top-0 end-0 m-2 rounded-circle remove-btn" @click="handleRemove(item.productId)" title="Remove from wishlist">
                <i class="bi bi-x-lg"></i>
              </button>
              <router-link :to="`/product/${item.productId}`" class="text-decoration-none">
                <img :src="item.product.image" :alt="item.product.name" class="card-img-top item-image" />
              </router-link>
              <div class="card-body text-center d-flex flex-column">
                <router-link :to="`/product/${item.productId}`" class="text-decoration-none">
                  <h5 class="card-title text-dark mb-2">{{ item.product.name }}</h5>
                </router-link>
                <p class="card-text text-muted small mb-2">{{ item.product.size }}</p>
                <div class="mb-2">
                  <span class="text-warning"><i class="bi bi-star-fill"></i> {{ item.product.rating }}</span>
                </div>
                <div class="fs-5 fw-bold text-primary mb-3">{{ formatPrice(item.product.price) }} AFN</div>
                <button class="btn btn-primary w-100 mt-auto" @click="handleAddToCart(item)">
                  <i class="bi bi-cart-plus me-2"></i>Add to Cart
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
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const wishlistStore = useWishlistStore()
const authStore = useAuthStore()
const cartStore = useCartStore()

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
  if (confirm('Are you sure you want to clear your entire wishlist?')) {
    try {
      // Create a copy of items to avoid mutation during iteration
      const itemsToRemove = [...wishlistStore.items]
      
      // Delete all items from backend
      for (const item of itemsToRemove) {
        await wishlistStore.removeFromWishlist(item.productId)
      }
      
      window.showToast('Wishlist cleared successfully', 'success')
    } catch (error) {
      window.showToast('Failed to clear wishlist', 'error')
    }
  }
}

function handleAddToCart(item) {
  cartStore.addToCart(item.product)
  window.showToast(`${item.product.name} added to cart!`, 'success')
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
