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
          <small class="text-muted mt-2">Cart</small>
        </div>
        <div class="d-flex flex-column align-items-center">
          <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style="width: 48px; height: 48px;">2</div>
          <small class="text-muted mt-2">Delivery</small>
        </div>
        <div class="d-flex flex-column align-items-center">
          <div class="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center fw-bold" style="width: 48px; height: 48px;">3</div>
          <small class="text-muted mt-2">Payment</small>
        </div>
        <div class="d-flex flex-column align-items-center">
          <div class="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center fw-bold" style="width: 48px; height: 48px;">4</div>
          <small class="text-muted mt-2">Confirm</small>
        </div>
      </div>

      <div class="row g-4 mb-5">
        <div class="col-lg-8 col-12">
          <form @submit.prevent="handleCheckout">
            <!-- Delivery Information -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body p-4">
                <h2 class="mb-4">Delivery Information</h2>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Recipient Name</label>
                  <input v-model="formData.recipientName" type="text" class="form-control form-control-lg" required />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Phone Number</label>
                  <input v-model="formData.phone" type="tel" class="form-control form-control-lg" required placeholder="+93 700 123 456" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">City</label>
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
                  <label class="form-label fw-semibold">Complete Address</label>
                  <textarea v-model="formData.address" class="form-control" rows="3" required placeholder="Street, district, landmarks..."></textarea>
                </div>
                <div class="mb-0">
                  <label class="form-label fw-semibold">Delivery Notes (Optional)</label>
                  <textarea v-model="formData.notes" class="form-control" rows="2" placeholder="Any special instructions..."></textarea>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body p-4">
                <h2 class="mb-4">Payment Method</h2>
                <div class="d-grid gap-3">
                  <label class="payment-option">
                    <input v-model="formData.paymentMethod" type="radio" value="online" class="d-none" />
                    <div class="d-flex align-items-center gap-3 p-3 border rounded payment-card">
                      <div style="font-size: 2rem;">💳</div>
                      <div>
                        <div class="fw-semibold">Pay Online</div>
                        <small class="text-muted">For customers abroad</small>
                      </div>
                    </div>
                  </label>
                  <label class="payment-option">
                    <input v-model="formData.paymentMethod" type="radio" value="cod" class="d-none" />
                    <div class="d-flex align-items-center gap-3 p-3 border rounded payment-card">
                      <div style="font-size: 2rem;">💵</div>
                      <div>
                        <div class="fw-semibold">Cash on Delivery</div>
                        <small class="text-muted">Pay when delivered</small>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-100">
              <i class="bi bi-check-circle me-2"></i>Place Order - {{ formatPrice(total) }} AFN
            </button>
          </form>
        </div>

        <!-- Order Summary -->
        <div class="col-lg-4 col-12">
          <div class="card border-0 shadow-sm sticky-top" style="top: 88px;">
            <div class="card-body p-4">
              <h5 class="card-title mb-4">Order Summary</h5>
              <div class="mb-3">
                <div v-for="item in cartStore.items" :key="item.id" class="d-flex justify-content-between mb-2 small">
                  <span>{{ item.name }} × {{ item.quantity }}</span>
                  <span>{{ formatPrice(item.price * item.quantity) }} AFN</span>
                </div>
              </div>
              <hr>
              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{{ formatPrice(cartStore.subtotal) }} AFN</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span>Delivery Fee</span>
                <span>{{ formatPrice(deliveryFee) }} AFN</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between fs-5 fw-bold text-primary">
                <span>Total</span>
                <span>{{ formatPrice(total) }} AFN</span>
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
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { useOrdersStore } from '@/stores/orders'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()

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
    window.showToast('Please login to place an order', 'error')
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
    window.showToast('Order placed successfully!', 'success')
  } catch (error) {
    console.error('Checkout error:', error)
    window.showToast('Failed to place order. Please try again.', 'error')
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
