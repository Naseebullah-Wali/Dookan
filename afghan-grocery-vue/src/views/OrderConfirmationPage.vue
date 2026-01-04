<template>
  <div class="confirmation-page bg-light min-vh-100">
    <AppHeader />
    
    <div class="container py-5">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Processing your order...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="text-center py-5">
        <div class="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style="width: 100px; height: 100px;">
          <i class="bi bi-exclamation-triangle display-3"></i>
        </div>
        <h1 class="fw-bold mb-3 text-danger">{{ $t('common.error') || 'Error' }}</h1>
        <p class="text-muted mb-4">{{ errorMessage }}</p>
        <router-link to="/checkout" class="btn btn-primary">
          <i class="bi bi-arrow-left me-2"></i>{{ $t('checkout.backToCheckout') || 'Back to Checkout' }}
        </router-link>
      </div>

      <!-- Success State -->
      <div v-else class="text-center">
        <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow-sm" style="width: 100px; height: 100px; animation: scaleIn 0.5s ease;">
          <i class="bi bi-check-lg display-3"></i>
        </div>
        <h1 class="fw-bold mb-3">{{ $t('checkout.orderConfirmed') }}</h1>
        <p class="text-muted mb-5">{{ $t('checkout.thankYou') }}</p>

        <div v-if="order" class="card border-0 shadow-sm p-4 mx-auto text-start" style="max-width: 600px;">
          <h3 class="h4 fw-bold mb-4 border-bottom pb-3">{{ $t('checkout.orderDetails') }}</h3>
          
          <!-- Order Number (most important for tracking) -->
          <div class="d-flex justify-content-between py-2 border-bottom">
            <span class="text-muted">{{ $t('admin.orderId') || 'Order Number' }}:</span>
            <span class="fw-bold text-primary fs-5">{{ order.order_number || order.id }}</span>
          </div>
          
          <div class="d-flex justify-content-between py-2 border-bottom align-items-center">
            <span class="text-muted">{{ $t('common.status') }}:</span>
            <span :class="statusBadgeClass">{{ order.status }}</span>
          </div>

          <div class="d-flex justify-content-between py-2 border-bottom">
            <span class="text-muted">{{ $t('checkout.paymentMethod') || 'Payment Method' }}:</span>
            <span class="fw-semibold">{{ formatPaymentMethod(order.payment_method) }}</span>
          </div>
          
          <div class="d-flex justify-content-between py-3">
            <span class="text-muted">{{ $t('cart.total') }}:</span>
            <span class="fw-bold text-primary fs-5">{{ currencyStore.formatPrice(order.total) }}</span>
          </div>

          <!-- Order Items -->
          <div v-if="order.items && order.items.length > 0" class="mt-3">
            <h5 class="fw-semibold mb-3">{{ $t('admin.items') || 'Items' }}:</h5>
            <div v-for="item in order.items" :key="item.id" class="d-flex justify-content-between py-2 border-bottom">
              <span>{{ item.product_name || item.name }} × {{ item.quantity }}</span>
              <span>{{ currencyStore.formatPrice(item.subtotal || item.price * item.quantity) }}</span>
            </div>
          </div>

          <!-- Delivery Address -->
          <div v-if="order.shipping_address || order.address" class="mt-4">
            <h5 class="fw-semibold mb-2">{{ $t('checkout.deliveryInfo') || 'Delivery Address' }}:</h5>
            <p class="text-muted mb-0">
              {{ order.shipping_address?.full_name || order.address?.full_name }}<br>
              {{ order.shipping_address?.street || order.address?.street }}<br>
              {{ order.shipping_address?.city || order.address?.city }}, {{ order.shipping_address?.country || order.address?.country }}<br>
              <i class="bi bi-telephone me-1"></i>{{ order.shipping_address?.phone || order.address?.phone }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="d-grid gap-3 mt-4">
            <router-link :to="`/tracking?order=${order.order_number || order.id}`" class="btn btn-success btn-lg">
              <i class="bi bi-geo-alt me-2"></i>{{ $t('orders.trackOrder') || 'Track Your Order' }}
            </router-link>
            <router-link to="/orders" class="btn btn-primary btn-lg">
              <i class="bi bi-box-seam me-2"></i>{{ $t('profile.viewOrders') }}
            </router-link>
            <router-link to="/shop" class="btn btn-outline-secondary btn-lg">
              {{ $t('cart.continueShopping') }}
            </router-link>
          </div>

          <!-- Copy Order Number -->
          <div class="text-center mt-4">
            <button @click="copyOrderNumber" class="btn btn-link text-muted">
              <i class="bi bi-clipboard me-1"></i>Copy Order Number
            </button>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useCurrencyStore } from '@/stores/currency'
import { useCartStore } from '@/stores/cart'
import { useAnalytics } from '@/composables/useAnalytics'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const currencyStore = useCurrencyStore()
const cartStore = useCartStore()
const analytics = useAnalytics()

const order = ref(null)
const isLoading = ref(true)
const errorMessage = ref(null)

// Status badge styling
const statusBadgeClass = computed(() => {
  const status = order.value?.status?.toLowerCase()
  const classes = {
    'pending': 'badge bg-warning text-dark rounded-pill',
    'confirmed': 'badge bg-info rounded-pill',
    'processing': 'badge bg-primary rounded-pill',
    'shipped': 'badge bg-success rounded-pill',
    'delivered': 'badge bg-success rounded-pill',
    'cancelled': 'badge bg-danger rounded-pill',
  }
  return classes[status] || 'badge bg-secondary rounded-pill'
})

// Format payment method for display
function formatPaymentMethod(method) {
  const methods = {
    'paypal': 'PayPal',
    'stripe': 'Credit/Debit Card',
    'card': 'Credit/Debit Card',
    'trc20': 'Crypto (TRC20)',
    'arbitrum': 'Crypto (Arbitrum)',
    'whatsapp': 'WhatsApp Order',
    'cod': 'Cash on Delivery'
  }
  return methods[method?.toLowerCase()] || method || 'N/A'
}

// Copy order number to clipboard
function copyOrderNumber() {
  const orderNum = order.value?.order_number || order.value?.id
  if (orderNum) {
    navigator.clipboard.writeText(orderNum).then(() => {
      window.showToast?.('Order number copied!', 'success')
    }).catch(() => {
      window.showToast?.('Failed to copy', 'error')
    })
  }
}

onMounted(async () => {
  isLoading.value = true
  errorMessage.value = null
  
  try {
    // Check if this is a Stripe payment return
    const sessionId = route.query.session_id
    const orderId = route.params.orderId
    
    if (sessionId) {
      console.log('✅ Stripe payment completed, session_id:', sessionId)
      
      // Get pending order data from sessionStorage
      const pendingOrderDataStr = sessionStorage.getItem('pendingOrderData')
      if (pendingOrderDataStr) {
        try {
          const orderData = JSON.parse(pendingOrderDataStr)
          console.log('📦 Creating order from Stripe payment...')
          
          // Update payment session ID and status
          orderData.payment_intent_id = sessionId
          orderData.payment_status = 'paid'
          
          // Create the order
          const createdOrder = await ordersStore.createOrder(orderData)
          order.value = createdOrder
          
          // Clear cart and pending data
          cartStore.clearCart()
          sessionStorage.removeItem('pendingOrderData')
          
          console.log('✅ Order created:', createdOrder.id, 'Order Number:', createdOrder.order_number)
          
          // Track purchase
          if (order.value) {
            analytics.trackPurchase(order.value)
          }
        } catch (err) {
          console.error('❌ Error creating order from Stripe session:', err)
          errorMessage.value = 'Failed to create order. Please contact support.'
        }
      } else {
        errorMessage.value = 'Order data not found. Your payment was processed, please contact support.'
      }
    } else if (orderId) {
      // Normal confirmation page load with orderId in URL
      console.log('📦 Fetching order:', orderId)
      order.value = await ordersStore.fetchOrderById(orderId)
      
      if (!order.value) {
        errorMessage.value = 'Order not found.'
      } else {
        // Track purchase (only if not already tracked)
        analytics.trackPurchase(order.value)
      }
    } else {
      // No order ID or session ID provided
      errorMessage.value = 'No order information provided.'
    }
  } catch (error) {
    console.error('❌ Confirmation page error:', error)
    errorMessage.value = error.message || 'An error occurred while loading order details.'
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
