<template>
  <div class="confirmation-page bg-light min-vh-100">
    <AppHeader />
    
    <div class="container py-5">
      <div class="text-center">
        <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow-sm" style="width: 100px; height: 100px; animation: scaleIn 0.5s ease;">
          <i class="bi bi-check-lg display-3"></i>
        </div>
        <h1 class="fw-bold mb-3">{{ $t('checkout.orderConfirmed') }}</h1>
        <p class="text-muted mb-5">{{ $t('checkout.thankYou') }}</p>

        <div v-if="order" class="card border-0 shadow-sm p-4 mx-auto text-start" style="max-width: 600px;">
          <h3 class="h4 fw-bold mb-4 border-bottom pb-3">{{ $t('checkout.orderDetails') }}</h3>
          
          <div class="d-flex justify-content-between py-2 border-bottom">
            <span class="text-muted">{{ $t('admin.orderId') }}:</span>
            <span class="fw-bold">{{ order.order_number }}</span>
          </div>
          
          <div class="d-flex justify-content-between py-2 border-bottom align-items-center">
            <span class="text-muted">{{ $t('common.status') }}:</span>
            <span class="badge bg-primary rounded-pill">{{ order.status }}</span>
          </div>
          
          <div class="d-flex justify-content-between py-3">
            <span class="text-muted">{{ $t('cart.total') }}:</span>
            <span class="fw-bold text-primary fs-5">{{ currencyStore.formatPrice(order.total) }}</span>
          </div>

          <div v-if="order.items && order.items.length > 0" class="mt-3">
            <h5 class="fw-semibold mb-3">{{ $t('admin.items') }}:</h5>
            <div v-for="item in order.items" :key="item.id" class="d-flex justify-content-between py-2 border-bottom">
              <span>{{ item.product_name }} × {{ item.quantity }}</span>
              <span>{{ currencyStore.formatPrice(item.subtotal) }}</span>
            </div>
          </div>

          <div class="d-grid gap-3 mt-4">
            <router-link to="/orders" class="btn btn-primary btn-lg">
              <i class="bi bi-box-seam me-2"></i>{{ $t('profile.viewOrders') }}
            </router-link>
            <router-link to="/shop" class="btn btn-outline-secondary btn-lg">
              {{ $t('cart.continueShopping') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useCurrencyStore } from '@/stores/currency'
import { useCartStore } from '@/stores/cart'
import { useAnalytics } from '@/composables/useAnalytics'
import { getRecaptchaToken } from '@/utils/recaptcha'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const currencyStore = useCurrencyStore()
const cartStore = useCartStore()
const analytics = useAnalytics()
const order = ref(null)
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  
  try {
    // Check if this is a Stripe payment return
    const sessionId = route.query.session_id
    if (sessionId) {
      console.log('✅ Stripe payment completed, session_id:', sessionId)
      
      // Get pending order data from sessionStorage
      const pendingOrderDataStr = sessionStorage.getItem('pendingOrderData')
      if (pendingOrderDataStr) {
        try {
          const orderData = JSON.parse(pendingOrderDataStr)
          console.log('📦 Creating order from Stripe payment...')
          
          // Update payment intent ID from Stripe
          orderData.payment_intent_id = sessionId
          
          // Add recaptcha token if available
          const recaptchaToken = await getRecaptchaToken('create_order')
          if (recaptchaToken) {
            orderData.recaptchaToken = recaptchaToken
          }
          
          // Create the order
          const createdOrder = await ordersStore.createOrder(orderData)
          order.value = createdOrder
          
          // Clear cart and pending data
          cartStore.clearCart()
          sessionStorage.removeItem('pendingOrderData')
          
          console.log('✅ Order created:', createdOrder.id)
          
          // Track purchase
          if (order.value) {
            analytics.trackPurchase(order.value)
          }
        } catch (err) {
          console.error('❌ Error creating order from Stripe session:', err)
          // Still redirect to show the confirmation page with error info
        }
      }
    } else {
      // Normal confirmation page load with orderId
      const orderId = route.params.orderId
      if (orderId) {
        order.value = await ordersStore.fetchOrderById(orderId)
        
        if (order.value) {
          analytics.trackPurchase(order.value)
        }
      }
    }
  } catch (error) {
    console.error('❌ Confirmation page error:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
@keyframes scaleIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}
</style>
