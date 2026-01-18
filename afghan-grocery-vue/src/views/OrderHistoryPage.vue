<template>
  <div class="orders-page bg-light min-vh-100">
   <LoadingSpinner :isLoading="loading" :fullScreen="true" :message="$t('common.loadingOrders')" />
    <AppHeader />
    
    <div class="container py-5">
      <div class="text-center mb-5">
        <h1 class="fw-bold mb-2">📦 {{ $t('profile.orderHistory') }}</h1>
        <p class="text-muted">{{ $t('profile.viewOrders') }}</p>
      </div>

      <div v-if="orders.length > 0" class="row g-4">
        <div v-for="order in orders" :key="order.id" class="col-12">
          <div class="order-card card border-0 shadow-sm overflow-hidden">
            <!-- Order Header -->
            <div class="card-header bg-gradient-primary text-white py-3">
              <div class="row align-items-center">
                <div class="col-md-6">
                  <h5 class="mb-1 fw-bold">
                    <i class="bi bi-receipt me-2"></i>{{ $t('admin.order') }} #{{ order.order_number || order.id }}
                  </h5>
                  <small class="opacity-90">
                    <i class="bi bi-calendar3 me-1"></i>{{ formatDate(order.created_at) }}
                  </small>
                </div>
                <div class="col-md-6 text-md-end mt-2 mt-md-0">
                  <span class="badge rounded-pill px-3 py-2" :class="getStatusBadgeClass(order.status)">
                    <i :class="getStatusIcon(order.status)" class="me-1"></i>
                    {{ formatStatus(order.status) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Order Items -->
            <div class="card-body p-4">
              <h6 class="text-muted text-uppercase small fw-bold mb-3">
                <i class="bi bi-box-seam me-2"></i>Order Items
              </h6>
              <div class="order-items">
                <div v-for="item in order.order_items" :key="item.id" class="order-item d-flex align-items-center justify-content-between py-3 border-bottom">
                  <div class="d-flex align-items-center gap-3 flex-grow-1">
                    <div class="item-image-placeholder bg-light rounded d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; min-width: 60px;">
                      <i class="bi bi-box text-muted fs-4"></i>
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="mb-1 fw-semibold">{{ item.product_name }}</h6>
                      <small class="text-muted">
                        <i class="bi bi-tag me-1"></i>{{ currencyStore.formatPrice(item.price) }} × {{ item.quantity }}
                      </small>
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold text-primary fs-5">{{ currencyStore.formatPrice(item.subtotal) }} <small class="text-muted">{{ $t('common.afn') }}</small></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Footer -->
            <div class="card-footer bg-light py-3">
              <div class="row align-items-center">
                <div class="col-md-6">
                  <div class="d-flex align-items-center gap-2">
                    <span class="text-muted">{{ $t('cart.total') }}:</span>
                    <span class="fw-bold text-primary fs-4">{{ currencyStore.formatPrice(order.total) }} {{ $t('common.afn') }}</span>
                  </div>
                </div>
                <div class="col-md-6 text-md-end mt-2 mt-md-0">
                  <router-link :to="`/confirmation/${order.id}`" class="btn btn-outline-primary">
                    <i class="bi bi-eye me-2"></i>{{ $t('profile.viewDetails') }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5">
        <div class="empty-state">
          <div class="display-1 mb-4">📦</div>
          <h2 class="fw-bold mb-3">{{ $t('profile.noOrders') }}</h2>
          <p class="text-muted mb-4 fs-5">{{ $t('profile.startShopping') }}</p>
          <router-link to="/shop" class="btn btn-primary btn-lg px-5 rounded-pill shadow">
            <i class="bi bi-shop me-2"></i>{{ $t('cart.continueShopping') }}
          </router-link>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useCurrencyStore } from '@/stores/currency'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const ordersStore = useOrdersStore()
const currencyStore = useCurrencyStore()
const orders = ref([])
const loading = ref(true)

onMounted(async () => {
  orders.value = await ordersStore.fetchMyOrders()
  loading.value = false
})


function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

function formatStatus(status) {
  if (!status) return 'Pending'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getStatusIcon(status) {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'bi bi-check-circle-fill'
    case 'processing': return 'bi bi-arrow-repeat'
    case 'shipped': return 'bi bi-truck'
    case 'cancelled': return 'bi bi-x-circle-fill'
    default: return 'bi bi-clock-fill'
  }
}

function getStatusBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'bg-success'
    case 'processing': return 'bg-primary'
    case 'shipped': return 'bg-info text-dark'
    case 'cancelled': return 'bg-danger'
    default: return 'bg-warning text-dark'
  }
}
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #d34360 0%, #d4608e 100%);
}

.order-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.order-item:last-child {
  border-bottom: none !important;
}

.item-image-placeholder {
  transition: background-color 0.2s ease;
}

.order-item:hover .item-image-placeholder {
  background-color: #e9ecef !important;
}

.empty-state {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
