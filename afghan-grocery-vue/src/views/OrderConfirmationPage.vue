<template>
  <div class="confirmation-page bg-light min-vh-100">
    <AppHeader />
    
    <div class="container py-5">
      <div class="text-center">
        <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow-sm" style="width: 100px; height: 100px; animation: scaleIn 0.5s ease;">
          <i class="bi bi-check-lg display-3"></i>
        </div>
        <h1 class="fw-bold mb-3">Order Confirmed!</h1>
        <p class="text-muted mb-5">Thank you for your order. We'll deliver it soon.</p>

        <div v-if="order" class="card border-0 shadow-sm p-4 mx-auto text-start" style="max-width: 600px;">
          <h3 class="h4 fw-bold mb-4 border-bottom pb-3">Order Details</h3>
          
          <div class="d-flex justify-content-between py-2 border-bottom">
            <span class="text-muted">Order Number:</span>
            <span class="fw-bold">{{ order.order_number }}</span>
          </div>
          
          <div class="d-flex justify-content-between py-2 border-bottom align-items-center">
            <span class="text-muted">Status:</span>
            <span class="badge bg-primary rounded-pill">{{ order.status }}</span>
          </div>
          
          <div class="d-flex justify-content-between py-3">
            <span class="text-muted">Total Amount:</span>
            <span class="fw-bold text-primary fs-5">{{ formatPrice(order.total) }} AFN</span>
          </div>

          <div v-if="order.items && order.items.length > 0" class="mt-3">
            <h5 class="fw-semibold mb-3">Order Items:</h5>
            <div v-for="item in order.items" :key="item.id" class="d-flex justify-content-between py-2 border-bottom">
              <span>{{ item.product_name }} × {{ item.quantity }}</span>
              <span>{{ formatPrice(item.subtotal) }} AFN</span>
            </div>
          </div>

          <div class="d-grid gap-3 mt-4">
            <router-link to="/orders" class="btn btn-primary btn-lg">
              <i class="bi bi-box-seam me-2"></i>View All Orders
            </router-link>
            <router-link to="/shop" class="btn btn-outline-secondary btn-lg">
              Continue Shopping
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
import { useRoute } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const route = useRoute()
const ordersStore = useOrdersStore()
const order = ref(null)

onMounted(async () => {
  const orderId = route.params.orderId
  order.value = await ordersStore.fetchOrderById(orderId)
})

function formatPrice(price) {
  return price?.toLocaleString() || '0'
}
</script>

<style scoped>
@keyframes scaleIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}
</style>
