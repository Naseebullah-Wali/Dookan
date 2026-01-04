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
                                <input type="text" class="form-control form-control-sm" value="TW5gj7ZPJhVGWVE4qpfR9MQvrkryQjArV1" readonly ref="trc20AddressInput">
                                <button class="btn btn-outline-secondary btn-sm" type="button" @click="copyAddress('TW5gj7ZPJhVGWVE4qpfR9MQvrkryQjArV1')">Copy</button>
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
                                <input type="text" class="form-control form-control-sm" value="0x084Ae494Ff43Ef2d5ef8aff8f02c757AaE4CC1Ab" readonly>
                                <button class="btn btn-outline-secondary btn-sm" type="button" @click="copyAddress('0x084Ae494Ff43Ef2d5ef8aff8f02c757AaE4CC1Ab')">Copy</button>
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
          <div class="card border-0 shadow-sm order-summary-sticky">
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

// Helper for crypto amount (approximate in USD/USDT)
const totalInUsd = computed(() => {
    // cartStore.total is in AFN
    // rates.USD = how many AFN per 1 USD (e.g., 70 means 1 USD = 70 AFN)
    const usdRate = currencyStore.rates.USD || 70
    // Convert AFN to USD: AFN / rate = USD
    return (cartStore.total / usdRate).toFixed(2)
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
      const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AY_cKFxdASRAmIdaPZDm30AEm25DwHkXrGv9mUwbIWG9MHweIiCpladI1_ebVY-75O3F23cQ9VaZgjPg'
      const paypal = await loadScript({ clientId: paypalClientId, currency: "USD" })
      if (paypal && paypal.Buttons) {
        await paypal.Buttons({
          createOrder: async () => {
            try {
              // Validate delivery info first
              if (!formData.value.recipientName || !formData.value.phone || !formData.value.address) {
                window.showToast('Please fill in delivery information first', 'error')
                throw new Error('Missing delivery information')
              }
              const response = await PaymentService.createPayPalOrder(parseFloat(totalInUsd.value), 'USD')
              // api.js returns extracted data, so response is already the data object
              return response?.data?.id || response?.id
            } catch (error) {
              console.error('PayPal create order error:', error)
              window.showToast('Failed to create PayPal order', 'error')
              throw error
            }
          },
          onApprove: async (data) => {
            try {
              await PaymentService.capturePayPalOrder(data.orderID)
              window.showToast('PayPal payment successful!', 'success')
              // Now complete the checkout
              await handlePayPalCheckout()
            } catch (error) {
              console.error('PayPal capture error:', error)
              window.showToast('Payment capture failed', 'error')
            }
          },
          onError: (error) => {
            console.error('PayPal error:', error)
            window.showToast('PayPal payment failed', 'error')
          },
          onCancel: () => {
            window.showToast('PayPal payment cancelled', 'info')
          }
        }).render('#paypal-button-container')
        paypalLoaded.value = true
      }
    } catch (error) {
      console.error("Failed to load PayPal", error)
      window.showToast('Failed to load PayPal', 'error')
    }
  }
})

// ========== PAYMENT HANDLERS ==========
function handleCityChange() {
  // Update cart store city so delivery fee is consistent across app
  cartStore.setDeliveryCity(formData.value.city)
}

function copyAddress(address) {
  navigator.clipboard.writeText(address).then(() => {
    window.showToast('Address copied to clipboard!', 'success')
  }).catch(() => {
    window.showToast('Failed to copy address', 'error')
  })
}

async function verifyCrypto(type) {
  if (!cryptoTxHash.value) {
    window.showToast('Please enter the transaction hash', 'error')
    return
  }
  isVerifyingCrypto.value = true
  try {
    const response = await PaymentService.verifyCryptoPayment(type, cryptoTxHash.value, totalInUsd.value)
    const result = response?.data || response
    if (result.verified) {
      cryptoVerified.value = true
      window.showToast(result.message || 'Payment Verified Successfully!', 'success')
    } else {
      window.showToast('Verification Failed: ' + (result.message || 'Unknown error'), 'error')
    }
  } catch (error) {
    console.error('Crypto verification error:', error)
    window.showToast(error?.response?.data?.message || 'Verification Error', 'error')
  } finally {
    isVerifyingCrypto.value = false
  }
}

// Handle PayPal checkout after successful payment
async function handlePayPalCheckout() {
  if (!authStore.user) {
    window.showToast(t('messages.loginRequired'), 'error')
    router.push('/login?redirect=/checkout')
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
      full_name: formData.value.recipientName,
      phone: formData.value.phone,
      city: formData.value.city,
      street: formData.value.address,
      country: 'Afghanistan',
      is_default: true
    },
    subtotal: cartStore.subtotal,
    shipping_fee: cartStore.deliveryFee,
    tax: 0,
    discount: 0,
    payment_method: 'paypal',
    payment_status: 'paid',
    notes: formData.value.notes
  }

  try {
    const order = await ordersStore.createOrder(orderData)
    cartStore.clearCart()
    router.push(`/confirmation/${order.id}`)
    window.showToast(t('messages.orderSuccess'), 'success')
  } catch (error) {
    console.error('Order creation error:', error)
    window.showToast(t('messages.orderError') || error.message, 'error')
  } finally {
    isProcessing.value = false
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
        full_name: formData.value.recipientName,
        phone: formData.value.phone,
        city: formData.value.city,
        street: formData.value.address,
        country: 'Afghanistan',
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


    // Redirect to Stripe hosted checkout

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

  // PayPal - don't process via form, use PayPal button instead
  if (formData.value.paymentMethod === 'paypal') {
    window.showToast('Please use the PayPal button to complete your payment', 'info')
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
      full_name: formData.value.recipientName,
      phone: formData.value.phone,
      city: formData.value.city,
      street: formData.value.address,
      country: 'Afghanistan',
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
    if (formData.value.paymentMethod === 'whatsapp') {
      // Capture the total, subtotal, shipping and items BEFORE clearing the cart
      const orderSubtotal = cartStore.subtotal  // AFN
      const orderShipping = cartStore.deliveryFee  // AFN
      const orderTotal = cartStore.total  // AFN
      const orderItems = [...orderData.items]  // Clone the items array
      
      const order = await ordersStore.createOrder(orderData)
      cartStore.clearCart()
      
      const waOptions = {
        header: t('support.whatsappOrder.header'),
        totalLabel: t('support.whatsappOrder.total'),
        currency: currencyStore.selectedCurrency.symbol,
        footer: t('support.whatsappOrder.footer'),
        recipientName: formData.value.recipientName,
        phone: formData.value.phone,
        address: formData.value.address,
        city: formData.value.city,
        notes: formData.value.notes,
        // Add subtotal and shipping for clear breakdown
        subtotal: currencyStore.formatPrice(orderSubtotal),
        shipping: currencyStore.formatPrice(orderShipping)
      }
      // Use the captured orderTotal (in AFN) and format with current currency
      const formattedTotal = currencyStore.formatPrice(orderTotal)
      try {
        const waResponse = await PaymentService.getWhatsAppLink(order.id, formattedTotal, orderItems, waOptions)
        const waUrl = waResponse?.data?.url || waResponse?.url || waResponse?.data?.link || waResponse?.link
        if (waUrl) {
          // Open WhatsApp in new tab and navigate to confirmation page
          window.open(waUrl, '_blank')
          router.push(`/confirmation/${order.id}`)
          window.showToast(t('messages.orderSuccess'), 'success')
          return
        } else {
          const msg = waResponse?.message || t('checkout.whatsappUnavailable') || 'WhatsApp ordering not available'
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
.order-summary-sticky {
  position: sticky;
  top: 88px;
  z-index: 10; /* Lower than navbar (1020) to prevent overlap */
}

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
