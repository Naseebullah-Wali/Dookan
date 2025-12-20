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
                    <option value="kandahar">Kandahar</option>
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
                  <!-- PayPal -->
                  <label class="payment-option">
                    <input v-model="formData.paymentMethod" type="radio" value="paypal" class="d-none" />
                    <div class="d-flex align-items-center gap-3 p-3 border rounded payment-card">
                      <div style="font-size: 2rem;">🅿️</div>
                      <div class="flex-grow-1">
                        <div class="fw-semibold">PayPal</div>
                        <small class="text-muted">Pay securely with PayPal</small>
                        <div v-if="formData.paymentMethod === 'paypal'" id="paypal-button-container" class="mt-3"></div>
                      </div>
                    </div>
                  </label>

                  <!-- Crypto TRC20 -->
                  <label class="payment-option">
                    <input v-model="formData.paymentMethod" type="radio" value="trc20" class="d-none" />
                    <div class="d-flex align-items-center gap-3 p-3 border rounded payment-card">
                      <div style="font-size: 2rem;">💎</div>
                      <div class="w-100">
                        <div class="fw-semibold">Crypto (USDT TRC20)</div>
                        <small class="text-muted">Tron Network</small>
                        <div v-if="formData.paymentMethod === 'trc20'" class="mt-3 p-3 bg-light rounded" @click.stop>
                            <p class="mb-1 small">Send <strong>{{ currencyStore.formatPrice(total) }}</strong> (approx {{ totalInUsd }} USDT) to:</p>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control form-control-sm" value="T..." readonly>
                                <button class="btn btn-outline-secondary btn-sm" type="button">Copy</button>
                            </div>
                            <label class="form-label small">Transaction Hash (TXID)</label>
                            <div class="input-group">
                                <input v-model="cryptoTxHash" type="text" class="form-control form-control-sm" placeholder="Paste hash here">
                                <button @click="verifyCrypto('TRC20')" class="btn btn-primary btn-sm" type="button" :disabled="isVerifyingCrypto || cryptoVerified">
                                    {{ cryptoVerified ? 'Verified' : (isVerifyingCrypto ? 'Verifying...' : 'Verify') }}
                                </button>
                            </div>
                            <small v-if="cryptoVerified" class="text-success d-block mt-1">Payment Verified!</small>
                        </div>
                      </div>
                    </div>
                  </label>

                  <!-- Crypto Arbitrum -->
                  <label class="payment-option">
                    <input v-model="formData.paymentMethod" type="radio" value="arbitrum" class="d-none" />
                    <div class="d-flex align-items-center gap-3 p-3 border rounded payment-card">
                      <div style="font-size: 2rem;">🔷</div>
                      <div class="w-100">
                        <div class="fw-semibold">Crypto (Arbitrum USDT)</div>
                        <small class="text-muted">Arbitrum One Network</small>
                        <div v-if="formData.paymentMethod === 'arbitrum'" class="mt-3 p-3 bg-light rounded" @click.stop>
                             <p class="mb-1 small">Send <strong>{{ currencyStore.formatPrice(total) }}</strong> (approx {{ totalInUsd }} USDT) to:</p>
                             <div class="input-group mb-2">
                                <input type="text" class="form-control form-control-sm" value="0x..." readonly>
                                <button class="btn btn-outline-secondary btn-sm" type="button">Copy</button>
                            </div>
                            <label class="form-label small">Transaction Hash (TXID)</label>
                            <div class="input-group">
                                <input v-model="cryptoTxHash" type="text" class="form-control form-control-sm" placeholder="Paste hash here">
                                <button @click="verifyCrypto('ARBITRUM')" class="btn btn-primary btn-sm" type="button" :disabled="isVerifyingCrypto || cryptoVerified">
                                    {{ cryptoVerified ? 'Verified' : (isVerifyingCrypto ? 'Verifying...' : 'Verify') }}
                                </button>
                            </div>
                             <small v-if="cryptoVerified" class="text-success d-block mt-1">Payment Verified!</small>
                        </div>
                      </div>
                    </div>
                  </label>

                  <!-- WhatsApp -->
                  <label class="payment-option">
                    <input v-model="formData.paymentMethod" type="radio" value="whatsapp" class="d-none" />
                    <div class="d-flex align-items-center gap-3 p-3 border rounded payment-card">
                      <div style="font-size: 2rem;">📱</div>
                      <div>
                        <div class="fw-semibold">WhatsApp Order</div>
                        <small class="text-muted">Complete order via Chat</small>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-100">
              <i class="bi bi-check-circle me-2"></i>{{ $t('checkout.placeOrder') }} - {{ currencyStore.formatPrice(total) }}
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
                  <span>{{ currencyStore.formatPrice(item.price * item.quantity) }}</span>
                </div>
              </div>
              <hr>
              <div class="d-flex justify-content-between mb-2">
                <span>{{ $t('cart.subtotal') }}</span>
                <span>{{ currencyStore.formatPrice(cartStore.subtotal) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span>{{ $t('cart.shipping') }}</span>
                <span>{{ currencyStore.formatPrice(deliveryFee) }}</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between fs-5 fw-bold text-primary">
                <span>{{ $t('cart.total') }}</span>
                <span>{{ currencyStore.formatPrice(total) }}</span>
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
import { useCurrencyStore } from '@/stores/currency'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { useOrdersStore } from '@/stores/orders'
import { loadScript } from "@paypal/paypal-js";
import { PaymentService } from '@/services/PaymentService';

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const languageStore = useLanguageStore()
const currencyStore = useCurrencyStore()
const { t } = useI18n()

// Payment State
const cryptoTxHash = ref('');
const isVerifyingCrypto = ref(false);
const cryptoVerified = ref(false);
const paypalLoaded = ref(false);

const paymentOptions = {
    trc20: {
        name: 'Crypto (TRC20 USDT)',
        address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        network: 'Tron (TRC20)'
    },
    arbitrum: {
        name: 'Crypto (Arbitrum USDT)',
        address: '0x...', 
        network: 'Arbitrum One'
    }
};

const formData = ref({
  recipientName: '',
  phone: '',
  city: 'kandahar',
  address: '',
  notes: '',
  paymentMethod: 'whatsapp'
})

const deliveryFees = {
  kandahar: 400
}

const deliveryFee = ref(400)

const total = computed(() => cartStore.subtotal + deliveryFee.value)

// Helper for crypto amount (approximate in USD)
const totalInUsd = computed(() => {
    const rate = currencyStore.rates.USD || 70
    return (total.value / rate).toFixed(2)
})

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

// Watch for payment method change to load PayPal
import { watch } from 'vue';

watch(() => formData.value.paymentMethod, async (newMethod) => {
    if (newMethod === 'paypal' && !paypalLoaded.value) {
        try {
            const paypal = await loadScript({ "clientId": "test", currency: "USD" }); // client-id from config? For now use 'test' or get from backend config endpoint if strictly needed, but public key is usually safe.
            if (paypal && paypal.Buttons) {
                await paypal.Buttons({
                     createOrder: async (data, actions) => {
                         // Call backend to create order
                         return PaymentService.createPayPalOrder(totalInUsd.value, 'USD').then(order => order.id);
                     },
                    onApprove: async (data, actions) => {
                        // Capture order
                        await PaymentService.capturePayPalOrder(data.orderID);
                        // Complete checkout
                        handleCheckout();
                    }
                }).render('#paypal-button-container');
                paypalLoaded.value = true;
            }
        } catch (error) {
            console.error("failed to load the PayPal JS SDK script", error);
        }
    }
});

async function verifyCrypto(type) {
    if (!cryptoTxHash.value) return;
    isVerifyingCrypto.value = true;
    try {
        const result = await PaymentService.verifyCryptoPayment(type, cryptoTxHash.value, totalInUsd.value);
        if (result.verified) {
            cryptoVerified.value = true;
            window.showToast('Payment Verified Successfully!', 'success');
        } else {
             window.showToast('Verification Failed: ' + (result.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        window.showToast('Verification Error', 'error');
    } finally {
        isVerifyingCrypto.value = false;
    }
}

async function handleCheckout() {
  if (!authStore.user) {
    window.showToast(t('messages.loginRequired'), 'error')
    router.push('/login?redirect=/checkout')
    return
  }

  // Validate Payment
  if (['trc20', 'arbitrum'].includes(formData.value.paymentMethod) && !cryptoVerified.value) {
      window.showToast('Please verify your crypto payment first', 'error');
      return;
  }

  const orderData = {
    user_id: authStore.user.id,
    items: cartStore.items.map(item => ({
        product_id: item.id,
        name: languageStore.getLocalizedName(item),
        product_image: item.image,
        quantity: item.quantity,
        price: item.price,
        weight: item.weight,
        size: item.size
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
      // If WhatsApp, just redirect
    if (formData.value.paymentMethod === 'whatsapp') {
         // const waData = await PaymentService.getWhatsAppLink('PENDING', total.value, cartStore.items); 
         // For now, let's create a pending order in DB first, then redirect.
    }

    const order = await ordersStore.createOrder(orderData)
    cartStore.clearCart()
    
    if (formData.value.paymentMethod === 'whatsapp') {
        const waOptions = {
            header: t('support.whatsappOrder.header'),
            totalLabel: t('support.whatsappOrder.total'),
            currency: currencyStore.selectedCurrency.symbol,
            footer: t('support.whatsappOrder.footer')
        }
        const convertedTotal = currencyStore.convert(total.value)
        const waData = await PaymentService.getWhatsAppLink(order.id, convertedTotal, orderData.items, waOptions);
        if (waData && waData.link) {
            window.location.href = waData.link;
            return;
        }
    }

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
