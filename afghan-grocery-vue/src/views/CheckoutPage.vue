<template>
  <div class="checkout-page">
    <AppHeader />
    
    <div class="container py-5">
      <!-- Progress Steps -->
      <div class="d-flex justify-content-center gap-3 mb-5 flex-wrap">
        <div class="d-flex flex-column align-items-center">
          <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold" style="width: 48px; height: 48px;">
            <i class="bi bi-check"></i>
          </div>
          <small class="text-muted mt-2">{{ $t('cart.title') }}</small>
        </div>
        <div class="d-flex flex-column align-items-center">
          <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style="width: 48px; height: 48px;">2</div>
          <small class="text-muted mt-2">{{ $t('checkout.delivery') }}</small>
        </div>
        <div class="d-flex flex-column align-items-center">
          <div class="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center fw-bold" style="width: 48px; height: 48px;">3</div>
          <small class="text-muted mt-2">{{ $t('checkout.payment') }}</small>
        </div>
        <div class="d-flex flex-column align-items-center">
          <div class="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center fw-bold" style="width: 48px; height: 48px;">4</div>
          <small class="text-muted mt-2">{{ $t('checkout.confirm') }}</small>
        </div>
      </div>

      <div class="row g-4 mb-5">
        <div class="col-lg-8 col-12">
          <form @submit.prevent="handleCheckout">
            <!-- Delivery Information -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body p-4">
                <h2 class="mb-4">{{ $t('checkout.deliveryInfo') }}</h2>
                <div class="mb-3">
                  <label class="form-label fw-semibold">{{ $t('checkout.recipientName') }}</label>
                  <input v-model="formData.recipientName" type="text" class="form-control form-control-lg" required />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">{{ $t('checkout.phoneNumber') }}</label>
                  <input v-model="formData.phone" type="tel" class="form-control form-control-lg" required placeholder="+93 700 123 456" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">{{ $t('checkout.city') }}</label>
                  <select v-model="formData.city" class="form-select form-select-lg" required @change="updateDeliveryFee">
                    <option value="kabul">Kabul</option>
                    <option value="herat">Herat</option>
                    <option value="mazar">Mazar-i-Sharif</option>
                    <option value="kandahar">Kandahar</option>
                    <option value="jalalabad">Jalalabad</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">{{ $t('checkout.address') }}</label>
                  <textarea v-model="formData.address" class="form-control" rows="3" required :placeholder="$t('checkout.addressPlaceholder')"></textarea>
                </div>
                <div class="mb-0">
                  <label class="form-label fw-semibold">{{ $t('checkout.deliveryNotes') }}</label>
                  <textarea v-model="formData.notes" class="form-control" rows="2" :placeholder="$t('checkout.notesPlaceholder')"></textarea>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body p-4">
                <h2 class="mb-4">{{ $t('checkout.paymentMethod') }}</h2>
                <div class="d-grid gap-3">
                  <label class="payment-option">
                    <input v-model="formData.paymentMethod" type="radio" value="online" class="d-none" />
                    <div class="d-flex align-items-center gap-3 p-3 border rounded payment-card">
                      <div style="font-size: 2rem;">💳</div>
                      <div>
                        <div class="fw-semibold">{{ $t('checkout.payOnline') }}</div>
                        <small class="text-muted">{{ $t('checkout.payOnlineDesc') }}</small>
                      </div>
                    </div>
                  </label>
                  <label class="payment-option">
                    <input v-model="formData.paymentMethod" type="radio" value="cod" class="d-none" />
                    <div class="d-flex align-items-center gap-3 p-3 border rounded payment-card">
                      <div style="font-size: 2rem;">💵</div>
                      <div>
                        <div class="fw-semibold">{{ $t('checkout.cod') }}</div>
                        <small class="text-muted">{{ $t('checkout.codDesc') }}</small>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-100">
              <i class="bi bi-check-circle me-2"></i>{{ $t('checkout.placeOrder') }} - {{ formatPrice(total) }} {{ $t('common.afn') }}
            </button>
          </form>
        </div>

        <!-- Order Summary -->
        <div class="col-lg-4 col-12">
          <div class="card border-0 shadow-sm sticky-top" style="top: 88px;">
            <div class="card-body p-4">
              <h5 class="card-title mb-4">{{ $t('checkout.orderSummary') }}</h5>
              <div class="mb-3">
                <div v-for="item in cartStore.items" :key="item.id" class="d-flex justify-content-between mb-2 small">
                  <span>{{ languageStore.getLocalizedName(item) }} × {{ item.quantity }}</span>
                  <span>{{ formatPrice(item.price * item.quantity) }} {{ $t('common.afn') }}</span>
                </div>
              </div>
              <hr>
              <div class="d-flex justify-content-between mb-2">
                <span>{{ $t('cart.subtotal') }}</span>
                <span>{{ formatPrice(cartStore.subtotal) }} {{ $t('common.afn') }}</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span>{{ $t('cart.shipping') }}</span>
                <span>{{ formatPrice(deliveryFee) }} {{ $t('common.afn') }}</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between fs-5 fw-bold text-primary">
                <span>{{ $t('cart.total') }}</span>
                <span>{{ formatPrice(total) }} {{ $t('common.afn') }}</span>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { useOrdersStore } from '@/stores/orders'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const languageStore = useLanguageStore()
const { t } = useI18n()

const formData = ref({
  recipientName: '',
  phone: '',
  city: 'kabul',
  address: '',
  notes: '',
  paymentMethod: 'online'
})

const deliveryFees = {
  kabul: 200,
  herat: 300,
  mazar: 350,
  kandahar: 400,
  jalalabad: 350,
  other: 500
}

const deliveryFee = ref(200)

const total = computed(() => cartStore.subtotal + deliveryFee.value)

onMounted(() => {
  if (cartStore.items.length === 0) {
    router.push('/cart')
  }
  
  // Pre-fill with user data if available
  if (authStore.user) {
    formData.value.recipientName = authStore.user.name || `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`.trim()
    formData.value.phone = authStore.user.phone || ''
  }
})

function updateDeliveryFee() {
  deliveryFee.value = deliveryFees[formData.value.city] || 500
}

function formatPrice(price) {
  return price.toLocaleString()
}

async function handleCheckout() {
  if (!authStore.user) {
    window.showToast(t('messages.loginRequired'), 'error')
    router.push('/login?redirect=/checkout')
    return
  }

  const orderData = {
    user_id: authStore.user.id,
    items: cartStore.items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        price: item.price
    })),
    address: {
        recipient_name: formData.value.recipientName,
        phone: formData.value.phone,
        province: formData.value.city, // Using city as province for simplicity
        city: formData.value.city,
        street: formData.value.address,
        is_default: true
    },
    subtotal: cartStore.subtotal,
    shipping_fee: deliveryFee.value,
    tax: 0,
    discount: 0,
    payment_method: formData.value.paymentMethod,
    notes: formData.value.notes
  }

  try {
    const order = await ordersStore.createOrder(orderData)
    cartStore.clearCart()
    router.push(`/confirmation/${order.id}`)
    window.showToast(t('messages.orderSuccess'), 'success')
  } catch (error) {
    console.error('Checkout error:', error)
    window.showToast(t('messages.orderError'), 'error')
  }
}
</script>

<style scoped>
.payment-option input:checked + .payment-card {
  border-color: var(--bs-primary) !important;
  background-color: rgba(231, 111, 26, 0.1);
}

.payment-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-card:hover {
  border-color: var(--bs-primary) !important;
}
</style>
