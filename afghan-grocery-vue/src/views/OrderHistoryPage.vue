<template>
  <div class="orders-page bg-light min-vh-100">
    <AppHeader />
    
    <div class="container py-5">
      <h1 class="mb-4 fw-bold">{{ $t('profile.orderHistory') }}</h1>

      <div v-if="loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ $t('common.loading') }}</span>
        </div>
      </div>

      <div v-else-if="orders.length > 0" class="row g-4">
        <div v-for="order in orders" :key="order.id" class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h5 class="mb-1 fw-bold">{{ $t('admin.order') }} {{ order.order_number }}</h5>
                <p class="text-muted mb-0 small">{{ formatDate(order.created_at) }}</p>
              </div>
              <span class="badge rounded-pill" :class="getStatusBadgeClass(order.status)">
                {{ order.status }}
              </span>
            </div>
            
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-borderless mb-0">
                  <tbody>
                    <tr v-for="item in order.items" :key="item.id">
                      <td class="ps-0">
                        <span class="fw-medium">{{ item.product_name }}</span>
                        <span class="text-muted ms-2">× {{ item.quantity }}</span>
                      </td>
                      <td class="text-end pe-0 fw-medium">
                        {{ formatPrice(item.subtotal) }} {{ $t('common.afn') }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="card-footer bg-white py-3 d-flex justify-content-between align-items-center">
              <span class="fw-bold text-primary fs-5">
                {{ $t('cart.total') }}: {{ formatPrice(order.total) }} {{ $t('common.afn') }}
              </span>
              <router-link :to="`/confirmation/${order.id}`" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-eye me-2"></i>{{ $t('profile.viewDetails') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5">
        <div class="display-1 mb-3">📦</div>
        <h2 class="fw-bold">{{ $t('profile.noOrders') }}</h2>
        <p class="text-muted mb-4">{{ $t('profile.startShopping') }}</p>
        <router-link to="/shop" class="btn btn-primary btn-lg px-5 rounded-pill">
          {{ $t('cart.continueShopping') }}
        </router-link>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const ordersStore = useOrdersStore()
const orders = ref([])
const loading = ref(true)

onMounted(async () => {
  orders.value = await ordersStore.fetchMyOrders()
  loading.value = false
})

function formatPrice(price) {
  return price?.toLocaleString() || '0'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
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
