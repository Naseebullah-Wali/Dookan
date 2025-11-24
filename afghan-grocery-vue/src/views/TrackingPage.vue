<template>
  <div class="tracking-page bg-light min-vh-100">
    <AppHeader />
    
    <div class="container py-5">
      <h1 class="text-center mb-5 fw-bold">Track Your Order</h1>

      <div class="row justify-content-center mb-5">
        <div class="col-md-8 col-lg-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h3 class="text-center mb-4">Enter Order ID</h3>
              <form @submit.prevent="handleSearch" class="d-flex gap-2">
                <input
                  v-model="orderId"
                  type="text"
                  class="form-control form-control-lg"
                  placeholder="Enter your order ID (e.g., 1)"
                  required
                />
                <button type="submit" class="btn btn-primary btn-lg px-4">
                  <i class="bi bi-search me-2"></i>Track
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="order" class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h2 class="h4 mb-1 fw-bold">Order #{{ order.id }}</h2>
                <p class="text-muted mb-0 small">Placed on {{ formatDate(order.createdAt) }}</p>
              </div>
              <span class="badge rounded-pill" :class="getStatusBadgeClass(order.status)">
                {{ order.status }}
              </span>
            </div>

            <div class="card-body p-4">
              <!-- Order Timeline -->
              <div class="position-relative py-4 mb-5">
                <div class="timeline-line bg-light position-absolute start-0 top-0 bottom-0 ms-4" style="width: 2px;"></div>
                
                <div class="d-flex gap-4 mb-4 position-relative" :class="{ 'opacity-50': false }">
                  <div class="timeline-icon bg-success text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; z-index: 1;">
                    <i class="bi bi-check-lg fs-4"></i>
                  </div>
                  <div>
                    <h4 class="h5 mb-1">Order Placed</h4>
                    <p class="text-muted mb-0">{{ formatDate(order.createdAt) }}</p>
                  </div>
                </div>

                <div class="d-flex gap-4 mb-4 position-relative" :class="{ 'opacity-50': order.status === 'pending' }">
                  <div class="timeline-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                       :class="order.status !== 'pending' ? 'bg-primary text-white' : 'bg-light text-muted'"
                       style="width: 48px; height: 48px; z-index: 1;">
                    <i class="bi bi-box-seam fs-4"></i>
                  </div>
                  <div>
                    <h4 class="h5 mb-1">Processing</h4>
                    <p class="text-muted mb-0">{{ order.status !== 'pending' ? 'In progress' : 'Pending' }}</p>
                  </div>
                </div>

                <div class="d-flex gap-4 mb-4 position-relative" :class="{ 'opacity-50': !['shipped', 'delivered'].includes(order.status) }">
                  <div class="timeline-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                       :class="['shipped', 'delivered'].includes(order.status) ? 'bg-primary text-white' : 'bg-light text-muted'"
                       style="width: 48px; height: 48px; z-index: 1;">
                    <i class="bi bi-truck fs-4"></i>
                  </div>
                  <div>
                    <h4 class="h5 mb-1">Shipped</h4>
                    <p class="text-muted mb-0">{{ ['shipped', 'delivered'].includes(order.status) ? 'On the way' : 'Not yet shipped' }}</p>
                  </div>
                </div>

                <div class="d-flex gap-4 position-relative" :class="{ 'opacity-50': order.status !== 'delivered' }">
                  <div class="timeline-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                       :class="order.status === 'delivered' ? 'bg-success text-white' : 'bg-light text-muted'"
                       style="width: 48px; height: 48px; z-index: 1;">
                    <i class="bi bi-house-door fs-4"></i>
                  </div>
                  <div>
                    <h4 class="h5 mb-1">Delivered</h4>
                    <p class="text-muted mb-0">{{ order.status === 'delivered' ? 'Completed' : 'Not yet delivered' }}</p>
                  </div>
                </div>
              </div>

              <!-- Delivery Details -->
              <div class="mb-5">
                <h3 class="h5 fw-bold mb-3">Delivery Information</h3>
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="p-3 bg-light rounded">
                      <span class="fw-bold d-block mb-1">Recipient</span>
                      <span>{{ order.delivery?.recipientName }}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 bg-light rounded">
                      <span class="fw-bold d-block mb-1">Phone</span>
                      <span>{{ order.delivery?.phone }}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 bg-light rounded">
                      <span class="fw-bold d-block mb-1">City</span>
                      <span>{{ order.delivery?.city }}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 bg-light rounded">
                      <span class="fw-bold d-block mb-1">Address</span>
                      <span>{{ order.delivery?.address }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Items -->
              <div class="mb-4">
                <h3 class="h5 fw-bold mb-3">Order Items</h3>
                <div v-for="item in order.items" :key="item.id" class="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded">
                  <img :src="item.image" :alt="item.name" class="rounded object-fit-cover" style="width: 60px; height: 60px;" />
                  <div class="flex-grow-1">
                    <h4 class="h6 mb-1 fw-bold">{{ item.name }}</h4>
                    <p class="text-muted mb-0 small">{{ item.size }} × {{ item.quantity }}</p>
                  </div>
                  <div class="fw-bold text-primary">
                    {{ formatPrice(item.price * item.quantity) }} AFN
                  </div>
                </div>
              </div>

              <!-- Order Total -->
              <div class="border-top pt-4">
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Subtotal</span>
                  <span class="fw-medium">{{ formatPrice(order.subtotal) }} AFN</span>
                </div>
                <div class="d-flex justify-content-between mb-3">
                  <span class="text-muted">Delivery Fee</span>
                  <span class="fw-medium">{{ formatPrice(order.deliveryFee) }} AFN</span>
                </div>
                <div class="d-flex justify-content-between pt-3 border-top">
                  <span class="fs-5 fw-bold">Total</span>
                  <span class="fs-5 fw-bold text-primary">{{ formatPrice(order.total) }} AFN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="searched && !order" class="text-center py-5">
        <div class="display-1 mb-3">❌</div>
        <h3 class="fw-bold">Order Not Found</h3>
        <p class="text-muted">We couldn't find an order with ID: {{ orderId }}</p>
        <p class="text-muted">Please check your order ID and try again.</p>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import api from '@/services/api'

const orderId = ref('')
const order = ref(null)
const loading = ref(false)
const searched = ref(false)

async function handleSearch() {
  if (!orderId.value) return
  
  loading.value = true
  searched.value = true
  order.value = null
  
  try {
    const response = await api.get(`/orders/${orderId.value}`)
    order.value = response.data
  } catch (error) {
    console.error('Order not found:', error)
  }
  
  loading.value = false
}

function formatPrice(price) {
  return price?.toLocaleString() || '0'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getStatusBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'bg-success'
    case 'processing': return 'bg-primary'
    case 'shipped': return 'bg-info text-dark'
    case 'cancelled': return 'bg-danger'
    default: return 'bg-secondary'
  }
}
</script>

<style scoped>
/* Custom styles removed in favor of Bootstrap classes */
</style>
