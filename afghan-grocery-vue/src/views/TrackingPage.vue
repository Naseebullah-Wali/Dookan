<template>
  <div class="tracking-page bg-light min-vh-100">
    <AppHeader />
    
    <div class="container py-5">
      <h1 class="text-center mb-5 fw-bold">{{ $t('tracking.title') }}</h1>

      <div class="row justify-content-center mb-5">
        <div class="col-md-8 col-lg-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h3 class="text-center mb-4">{{ $t('tracking.enterOrderId') }}</h3>
              <form @submit.prevent="handleSearch" class="d-flex gap-2">
                <input
                  v-model="orderId"
                  type="text"
                  class="form-control form-control-lg"
                  placeholder="Enter your order ID or number (e.g., ORD-20251220-000002)"
                  required
                />
                <button type="submit" class="btn btn-primary btn-lg px-4">
                  <i class="bi bi-search me-2"></i>{{ $t('tracking.track') }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ $t('common.loading') }}</span>
        </div>
      </div>

      <div v-else-if="order" class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h2 class="h4 mb-1 fw-bold">{{ $t('admin.order') }} #{{ order.id }}</h2>
                <p class="text-muted mb-0 small">{{ $t('tracking.placedOn') }} {{ formatDate(order.createdAt) }}</p>
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
                    <h4 class="h5 mb-1">{{ $t('tracking.orderPlaced') }}</h4>
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
                    <h4 class="h5 mb-1">{{ $t('tracking.processing') }}</h4>
                    <p class="text-muted mb-0">{{ order.status !== 'pending' ? $t('tracking.inProgress') : $t('tracking.pending') }}</p>
                  </div>
                </div>

                <div class="d-flex gap-4 mb-4 position-relative" :class="{ 'opacity-50': !['shipped', 'delivered'].includes(order.status) }">
                  <div class="timeline-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                       :class="['shipped', 'delivered'].includes(order.status) ? 'bg-primary text-white' : 'bg-light text-muted'"
                       style="width: 48px; height: 48px; z-index: 1;">
                    <i class="bi bi-truck fs-4"></i>
                  </div>
                  <div>
                    <h4 class="h5 mb-1">{{ $t('tracking.shipped') }}</h4>
                    <p class="text-muted mb-0">{{ ['shipped', 'delivered'].includes(order.status) ? $t('tracking.onTheWay') : $t('tracking.notYetShipped') }}</p>
                  </div>
                </div>

                <div class="d-flex gap-4 position-relative" :class="{ 'opacity-50': order.status !== 'delivered' }">
                  <div class="timeline-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                       :class="order.status === 'delivered' ? 'bg-success text-white' : 'bg-light text-muted'"
                       style="width: 48px; height: 48px; z-index: 1;">
                    <i class="bi bi-house-door fs-4"></i>
                  </div>
                  <div>
                    <h4 class="h5 mb-1">{{ $t('tracking.delivered') }}</h4>
                    <p class="text-muted mb-0">{{ order.status === 'delivered' ? $t('tracking.completed') : $t('tracking.notYetDelivered') }}</p>
                  </div>
                </div>
              </div>

              <!-- Delivery Details -->
              <div class="mb-5">
                <h3 class="h5 fw-bold mb-3">{{ $t('tracking.deliveryInfo') }}</h3>
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="p-3 bg-light rounded">
                      <span class="fw-bold d-block mb-1">{{ $t('checkout.recipient') }}</span>
                      <span>{{ order.delivery?.recipientName }}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 bg-light rounded">
                      <span class="fw-bold d-block mb-1">{{ $t('common.phone') }}</span>
                      <span>{{ order.delivery?.phone }}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 bg-light rounded">
                      <span class="fw-bold d-block mb-1">{{ $t('checkout.city') }}</span>
                      <span>{{ order.delivery?.city }}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 bg-light rounded">
                      <span class="fw-bold d-block mb-1">{{ $t('checkout.address') }}</span>
                      <span>{{ order.delivery?.address }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Items -->
              <div class="mb-4">
                <h3 class="h5 fw-bold mb-3">{{ $t('admin.items') }}</h3>
                <div v-for="item in order.items" :key="item.id" class="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded">
                  <img :src="item.image" :alt="item.name" class="rounded object-fit-cover" style="width: 60px; height: 60px;" />
                  <div class="flex-grow-1">
                    <h4 class="h6 mb-1 fw-bold">{{ item.name }}</h4>
                    <p class="text-muted mb-0 small">{{ item.size }} × {{ item.quantity }}</p>
                  </div>
                  <div class="fw-bold text-primary">
                    {{ formatPrice(item.price * item.quantity) }} {{ $t('common.afn') }}
                  </div>
                </div>
              </div>

              <!-- Order Total -->
              <div class="border-top pt-4">
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">{{ $t('cart.subtotal') }}</span>
                  <span class="fw-medium">{{ formatPrice(order.subtotal) }} {{ $t('common.afn') }}</span>
                </div>
                <div class="d-flex justify-content-between mb-3">
                  <span class="text-muted">{{ $t('checkout.deliveryFee') }}</span>
                  <span class="fw-medium">{{ formatPrice(order.deliveryFee) }} {{ $t('common.afn') }}</span>
                </div>
                <div class="d-flex justify-content-between pt-3 border-top">
                  <span class="fs-5 fw-bold">{{ $t('cart.total') }}</span>
                  <span class="fs-5 fw-bold text-primary">{{ formatPrice(order.total) }} {{ $t('common.afn') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="searched && !order" class="text-center py-5">
        <div class="display-1 mb-3">❌</div>
        <h3 class="fw-bold">{{ $t('tracking.notFound') }}</h3>
        <p class="text-muted">{{ $t('tracking.notFoundMessage') }} {{ orderId }}</p>
        <p class="text-muted">{{ $t('tracking.checkId') }}</p>
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
import { getImageUrl } from '@/services/imageService'

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
    const q = encodeURIComponent(orderId.value)
    const res = await api.get(`/orders/lookup?q=${q}`)
    const data = res.data || null
    if (data) {
      order.value = {
        id: data.id,
        order_number: data.order_number,
        status: data.status,
        createdAt: data.created_at || data.createdAt,
        subtotal: data.subtotal,
        deliveryFee: data.shipping_fee || 0,
        total: data.total,
        delivery: data.address ? {
          recipientName: data.address.full_name || data.address.recipient_name,
          phone: data.address.phone,
          city: data.address.city,
          address: `${data.address.street || ''}, ${data.address.city || ''}, ${data.address.state || ''}`
        } : null,
        items: (data.items || []).map(item => ({
          id: item.id,
          name: item.product_name,
          image: getImageUrl(item.product_image),
          size: item.sku || 'N/A',
          quantity: item.quantity,
          price: item.price
        }))
      }
    }
  } catch (err) {
    console.error('Order lookup failed:', err)
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
