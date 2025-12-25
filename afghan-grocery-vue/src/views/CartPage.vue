<template>
  <div class="cart-page">
    <LoadingSpinner :isLoading="isRemoving" :fullScreen="false" size="sm" message="Updating cart..." />
    <AppHeader />
    
    <div class="container py-4 py-md-5">
      <h1 class="mb-4 mb-md-5">{{ $t('cart.title') }}</h1>

      <!-- Empty Cart State -->
      <div v-if="cartStore.items.length === 0" class="text-center py-5">
        <div style="font-size: 5rem;" class="mb-4">🛒</div>
        <h2 class="mb-3">{{ $t('cart.empty') }}</h2>
        <p class="text-muted mb-4">{{ $t('shop.noProducts') }}</p>
        <router-link to="/shop" class="btn btn-primary btn-lg">{{ $t('cart.continueShopping') }}</router-link>
      </div>

      <!-- Cart with Items -->
      <div v-else class="row g-4">
        <!-- Cart Items -->
        <div class="col-lg-8 col-12">
          <!-- Cart Header with Clear All -->
          <div class="alert alert-light d-flex justify-content-between align-items-center mb-3">
            <span class="fw-semibold">
              <i class="bi bi-cart3 me-2"></i>
              {{ $t('cart.itemsInCart', { count: cartStore.itemCount }) }}
            </span>
            <button @click="handleClearCart" class="btn btn-outline-danger btn-sm">
              <i class="bi bi-trash me-1"></i>{{ $t('cart.clearAll') }}
            </button>
          </div>

          <div class="d-flex flex-column gap-3">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="card border-0 shadow-sm"
            >
              <div class="card-body">
                <div class="row g-3 align-items-center">
                  <!-- Product Image -->
                  <div class="col-auto">
                    <img :src="getImageUrl(item.image)" :alt="item.name" class="rounded" style="width: 100px; height: 100px; object-fit: cover;" />
                  </div>
                  
                  <!-- Product Details -->
                  <div class="col">
                    <h5 class="card-title mb-2">{{ languageStore.getLocalizedName(item) }}</h5>
                    <p class="text-muted small mb-2">{{ item.size }}</p>
                    <p class="text-primary fw-bold mb-0">{{ currencyStore.formatPrice(item.price) }}</p>
                    <p v-if="item.stock" class="text-muted small mb-0">{{ $t('product.stock') }}: {{ item.stock }}</p>
                    <p v-else class="text-warning small mb-0">⚠️ {{ $t('messages.error') }}</p>
                  </div>
                  
                  <!-- Quantity & Actions (Desktop) -->
                  <div class="col-auto d-none d-md-flex flex-column align-items-center gap-2">
                    <div class="btn-group" role="group">
                      <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)" class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-dash"></i>
                      </button>
                      <input 
                        :value="item.quantity" 
                        @input="handleQuantityInput(item.id, $event.target.value, item.stock)"
                        type="number" 
                        min="1" 
                        :max="item.stock"
                        class="form-control form-control-sm text-center fw-semibold" 
                        style="width: 60px;" 
                      />
                      <button 
                        @click="cartStore.updateQuantity(item.id, item.quantity + 1)" 
                        class="btn btn-outline-secondary btn-sm"
                        :disabled="item.quantity >= item.stock"
                      >
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                    <button class="btn btn-link btn-sm text-danger p-0" @click="removeItem(item)">
                      <i class="bi bi-trash me-1"></i>{{ $t('cart.remove') }}
                    </button>
                  </div>
                  
                  <!-- Item Total (Desktop) -->
                  <div class="col-auto d-none d-md-block" style="min-width: 120px;">
                    <h5 class="text-primary mb-0 text-end">{{ currencyStore.formatPrice(item.price * item.quantity) }}</h5>
                  </div>
                  
                  <!-- Mobile Actions -->
                  <div class="col-12 d-md-none">
                    <div class="d-flex justify-content-between align-items-center">
                      <div class="btn-group" role="group">
                        <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)" class="btn btn-outline-secondary">
                          <i class="bi bi-dash"></i>
                        </button>
                        <input 
                          :value="item.quantity" 
                          @input="handleQuantityInput(item.id, $event.target.value, item.stock)"
                          type="number" 
                          min="1" 
                          :max="item.stock"
                          class="form-control text-center fw-semibold" 
                          style="width: 60px;" 
                        />
                        <button 
                          @click="cartStore.updateQuantity(item.id, item.quantity + 1)" 
                          class="btn btn-outline-secondary"
                          :disabled="item.quantity >= item.stock"
                        >
                          <i class="bi bi-plus"></i>
                        </button>
                      </div>
                      <button class="btn btn-link text-danger" @click="removeItem(item)">
                        <i class="bi bi-trash me-1"></i>{{ $t('cart.remove') }}
                      </button>
                    </div>
                    <div class="d-flex justify-content-end mt-2">
                      <h5 class="text-primary mb-0">{{ currencyStore.formatPrice(item.price * item.quantity) }}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="col-lg-4 col-12">
          <div class="card border-0 shadow-sm position-sticky" style="top: 100px; z-index: 10;">
            <div class="card-body">
              <h5 class="card-title mb-4 pb-3 border-bottom">{{ $t('checkout.orderSummary') }}</h5>
              
              <div class="d-flex justify-content-between mb-3">
                <span>{{ $t('cart.subtotal') }}</span>
                <span class="fw-semibold">{{ currencyStore.formatPrice(cartStore.subtotal) }}</span>
              </div>
              
              <div class="d-flex justify-content-between mb-3">
                <span>{{ $t('cart.shipping') }}</span>
                <span class="fw-semibold">{{ currencyStore.formatPrice(cartStore.deliveryFee) }}</span>
              </div>
              
              <hr class="my-3">
              
              <div class="d-flex justify-content-between mb-4">
                <span class="fs-5 fw-bold">{{ $t('cart.total') }}</span>
                <span class="fs-5 fw-bold text-primary">{{ currencyStore.formatPrice(cartStore.total) }}</span>
              </div>
              
              <div class="d-grid gap-2">
                <router-link to="/checkout" class="btn btn-primary">
                  <i class="bi bi-credit-card me-2"></i>{{ $t('cart.checkout') }}
                </router-link>
                <router-link to="/shop" class="btn btn-outline-secondary">
                  <i class="bi bi-arrow-left me-2"></i>{{ $t('cart.continueShopping') }}
                </router-link>
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
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useLanguageStore } from '@/stores/language'
import { useCurrencyStore } from '@/stores/currency'
import { useI18n } from 'vue-i18n'
import { getImageUrl } from '@/services/imageService'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const cartStore = useCartStore()
const languageStore = useLanguageStore()
const currencyStore = useCurrencyStore()
const { t } = useI18n()
const isRemoving = ref(false)

function removeItem(item) {
  cartStore.removeFromCart(item.id)
  window.showToast(`${item.name} removed from cart`, 'success')
}

function handleClearCart() {
  if (confirm(t('messages.confirmDelete'))) {
    cartStore.clearCart()
    window.showToast(t('messages.success'), 'success')
  }
}

function handleQuantityInput(itemId, value, stock) {
  const quantity = parseInt(value) || 1
  
  if (quantity > stock) {
    window.showToast(t('messages.exceedsStock'), 'warning')
    cartStore.updateQuantity(itemId, stock)
  } else if (quantity < 1) {
    cartStore.updateQuantity(itemId, 1)
  } else {
    cartStore.updateQuantity(itemId, quantity)
  }
}
</script>

<style scoped>
/* Bootstrap handles all responsive layout */
</style>
