<template>
  <div class="checkout-page">
    <LoadingSpinner :isLoading="isProcessing" :fullScreen="true" message="Processing your order..." />
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
                  <select v-model="formData.city" class="form-select form-select-lg" required @change="handleCityChange">
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
                            <p class="mb-1 small">Send <strong>{{ currencyStore.formatPrice(cartStore.total) }}</strong> (approx {{ totalInUsd }} USDT) to:</p>
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
                             <p class="mb-1 small">Send <strong>{{ currencyStore.formatPrice(cartStore.total) }}</strong> (approx {{ totalInUsd }} USDT) to:</p>
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

                  <!-- Stripe Payment Element -->
                  <label class="payment-option">
                    <input v-model="formData.paymentMethod" type="radio" value="stripe" class="d-none" />
                    <div class="d-flex align-items-center gap-3 p-3 border rounded payment-card">
                      <div style="font-size: 2rem;">💳</div>
                      <div class="flex-grow-1">
                        <div class="fw-semibold">Credit/Debit Card (Stripe)</div>
                        <small class="text-muted">Secure payment with Stripe - {{ currencyStore.formatPrice(cartStore.total) }}</small>
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

            <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="isProcessing">
              <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-check-circle me-2"></i>
              {{ isProcessing ? $t('checkout.processing') || 'Processing...' : ($t('checkout.placeOrder') || 'Place Order') }} - {{ currencyStore.formatPrice(cartStore.total) }}
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
                <span>{{ currencyStore.formatPrice(cartStore.deliveryFee) }}</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between fs-5 fw-bold text-primary">
                <span>{{ $t('cart.total') }}</span>
                <span>{{ currencyStore.formatPrice(cartStore.total) }}</span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { useCurrencyStore } from '@/stores/currency'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useOrdersStore } from '@/stores/orders'
import { loadScript } from "@paypal/paypal-js";
import { PaymentService } from '@/services/PaymentService';
import { getRecaptchaToken } from '@/utils/recaptcha'

// ========== STRIPE PAYMENT LINK (HOSTED CHECKOUT) ==========
// No complex initialization needed - just create a link and redirect!

// ========== STORE & STATE ==========
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const languageStore = useLanguageStore()
const currencyStore = useCurrencyStore()
const { t } = useI18n()

// Payment State
const cryptoTxHash = ref('')
const isVerifyingCrypto = ref(false)
const cryptoVerified = ref(false)
const paypalLoaded = ref(false)
const isProcessing = ref(false)

const formData = ref({
  recipientName: '',
  phone: '',
  city: 'kandahar',
  address: '',
  notes: '',
  paymentMethod: 'whatsapp'
})

// Delivery fee is centralized in cartStore
// Convert subtotal to current currency and add delivery fee (also converted)
const subtotalConverted = computed(() => {
    // cartStore.subtotal is in AFN (base currency)
    return currencyStore.convert(cartStore.subtotal)
})

const deliveryFeeConverted = computed(() => {
    // cartStore.deliveryFee is in AFN, convert it for display
    return currencyStore.convert(cartStore.deliveryFee)
})

const total = computed(() => subtotalConverted.value + deliveryFeeConverted.value)

// Helper for crypto amount (approximate in USD)
const totalInUsd = computed(() => {
    const usdRate = currencyStore.rates.USD || 70
    // cartStore.total is in AFN base units; convert to USD amount
    return (cartStore.total / usdRate / 100).toFixed(2)
})

// ========== LIFECYCLE ==========
onMounted(() => {
  if (cartStore.items.length === 0) {
    router.push('/cart')
    return
  }
  
  // Pre-fill with user data if available
  if (authStore.user) {
    formData.value.recipientName = authStore.user.name || `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`.trim()
    formData.value.phone = authStore.user.phone || ''
  }
})

// Watch payment method changes
watch(() => formData.value.paymentMethod, async (newMethod) => {
  if (newMethod === 'paypal' && !paypalLoaded.value) {
    try {
      const paypal = await loadScript({ "clientId": "test", currency: "USD" })
      if (paypal && paypal.Buttons) {
        await paypal.Buttons({
          createOrder: async (data, actions) => {
            return PaymentService.createPayPalOrder(totalInUsd.value, 'USD').then(order => order.id)
          },
          onApprove: async (data, actions) => {
            await PaymentService.capturePayPalOrder(data.orderID)
            handleCheckout()
          }
        }).render('#paypal-button-container')
        paypalLoaded.value = true
      }
    } catch (error) {
      console.error("Failed to load PayPal", error)
    }
  }
})

// ========== PAYMENT HANDLERS ==========
function handleCityChange() {
  // Update cart store city so delivery fee is consistent across app
  cartStore.setDeliveryCity(formData.value.city)
}

async function verifyCrypto(type) {
  if (!cryptoTxHash.value) return
  isVerifyingCrypto.value = true
  try {
    const result = await PaymentService.verifyCryptoPayment(type, cryptoTxHash.value, totalInUsd.value)
    if (result.verified) {
      cryptoVerified.value = true
      window.showToast('Payment Verified Successfully!', 'success')
    } else {
      window.showToast('Verification Failed: ' + (result.message || 'Unknown error'), 'error')
    }
  } catch (error) {
    window.showToast('Verification Error', 'error')
  } finally {
    isVerifyingCrypto.value = false
  }
}

async function handleStripePayment() {
  if (!authStore.user) {
    window.showToast(t('messages.loginRequired'), 'error')
    router.push('/login?redirect=/checkout')
    return
  }

  if (!formData.value.recipientName || !formData.value.phone || !formData.value.address) {
    window.showToast('Please fill in delivery information first', 'error')
    return
  }

  isProcessing.value = true

  try {
    // Get CSRF token
    const csrfResponse = await fetch('/api/v1/csrf-token', { credentials: 'include' })
    const csrfData = await csrfResponse.json()
    const csrfToken = csrfData.csrfToken

    console.log('🔗 Creating Stripe Payment Link...')
    
    // Prepare order data that will be created after payment
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
        province: formData.value.city,
        city: formData.value.city,
        street: formData.value.address,
        is_default: true
      },
      subtotal: cartStore.subtotal,
      shipping_fee: cartStore.deliveryFee,
      tax: 0,
      discount: 0,
      payment_method: 'card', // Stripe uses 'card' payment method
      payment_currency: currencyStore.selectedCurrency.code.toLowerCase(), // Use current selected currency
      notes: formData.value.notes,
      is_stripe_payment: true // Mark that this is a Stripe payment
    }

    // Store order data in sessionStorage so we can retrieve it after Stripe redirect
    sessionStorage.setItem('pendingOrderData', JSON.stringify(orderData))
    
    // Create Payment Link
    // Send to Stripe in the user's selected currency
    // All prices are stored in AFN base units, convert to selected currency in cents for Stripe
    const selectedCurrencyCode = currencyStore.selectedCurrency.code
    const selectedCurrencyRate = currencyStore.rates[selectedCurrencyCode] || 1
    
    const requestBody = {
      items: [
        ...cartStore.items.map(item => ({
          name: languageStore.getLocalizedName(item),
          // Convert AFN to selected currency, then to cents for Stripe
          // Formula: (price_afn / exchange_rate) * 100 = cents in selected currency
          amount: Math.round((item.price / selectedCurrencyRate) * 100),
          quantity: item.quantity,
          image: item.image
        })),
        // Include shipping fee - also converted to selected currency cents
        {
          name: 'Shipping Fee',
          amount: Math.round((cartStore.deliveryFee / selectedCurrencyRate) * 100),
          quantity: 1
        }
      ],
      currency: selectedCurrencyCode.toLowerCase(), // Use selected currency that user chose
      description: `Order - ${cartStore.items.length} items`,
      user_id: authStore.user.id, // Include user_id in body as fallback
      metadata: {
        recipientName: formData.value.recipientName,
        phone: formData.value.phone,
        address: formData.value.address,
        city: formData.value.city,
        notes: formData.value.notes
      }
    }



    const paymentLinkResponse = await fetch('/api/v1/payments/stripe/payment-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    })

    if (!paymentLinkResponse.ok) {
      const errorData = await paymentLinkResponse.json()
      throw new Error(errorData.message || 'Failed to create payment link')
    }

    const paymentLinkData = await paymentLinkResponse.json()
    console.log('✅ Payment Link created:', paymentLinkData.data.paymentLinkId)

    // Redirect to Stripe hosted checkout
    console.log('🔄 Redirecting to Stripe...')
    window.location.href = paymentLinkData.data.paymentLinkUrl
  } catch (error) {
    console.error('❌ Payment error:', error)
    window.showToast('Error: ' + error.message, 'error')
    isProcessing.value = false
  }
}

async function handleCheckout() {
  if (!authStore.user) {
    window.showToast(t('messages.loginRequired'), 'error')
    router.push('/login?redirect=/checkout')
    return
  }

  // Stripe Payment Links - redirect to payment page
  if (formData.value.paymentMethod === 'stripe') {
    await handleStripePayment()
    return
  }

  // Validate Payment for crypto
  if (['trc20', 'arbitrum'].includes(formData.value.paymentMethod) && !cryptoVerified.value) {
    window.showToast('Please verify your crypto payment first', 'error')
    return
  }

  isProcessing.value = true

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
      province: formData.value.city,
      city: formData.value.city,
      street: formData.value.address,
      is_default: true
    },
    subtotal: cartStore.subtotal,
    shipping_fee: cartStore.deliveryFee,
    tax: 0,
    discount: 0,
    payment_method: formData.value.paymentMethod,
    notes: formData.value.notes
  }

  try {
    const recaptchaToken = await getRecaptchaToken('create_order')
    if (recaptchaToken) {
      orderData.recaptchaToken = recaptchaToken
    }

    if (formData.value.paymentMethod === 'whatsapp') {
      const order = await ordersStore.createOrder(orderData)
      cartStore.clearCart()
      
      const waOptions = {
        header: t('support.whatsappOrder.header'),
        totalLabel: t('support.whatsappOrder.total'),
        currency: currencyStore.selectedCurrency.symbol,
        footer: t('support.whatsappOrder.footer')
      }
      const convertedTotal = currencyStore.convert(total.value)
      try {
        const waData = await PaymentService.getWhatsAppLink(order.id, convertedTotal, orderData.items, waOptions)
        if (waData && waData.link) {
          window.location.href = waData.link
          return
        } else {
          const msg = waData?.message || t('checkout.whatsappUnavailable') || 'WhatsApp ordering not available'
          window.showToast(msg, 'error')
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || t('checkout.whatsappError') || 'Failed to create WhatsApp link'
        window.showToast(msg, 'error')
      }
    } else {
      // Other payment methods
      const order = await ordersStore.createOrder(orderData)
      cartStore.clearCart()
      router.push(`/confirmation/${order.id}`)
      window.showToast(t('messages.orderSuccess'), 'success')
    }
  } catch (error) {
    console.error('Checkout error:', error)
    window.showToast(t('messages.orderError') || error.message, 'error')
  } finally {
    isProcessing.value = false
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
