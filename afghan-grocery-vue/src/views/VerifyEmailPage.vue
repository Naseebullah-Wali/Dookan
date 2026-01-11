<template>
  <div class="verify-page">
    <AppHeader />
    
    <div class="container py-4 py-md-5">
      <div class="row justify-content-center">
        <div class="col-lg-5 col-md-7 col-sm-10 col-11">
          <div class="card border-0 shadow-lg">
            <div class="card-body p-4 p-md-5">
              <!-- Success State -->
              <div v-if="verified" class="text-center">
                <div class="success-icon mb-4">
                  <i class="bi bi-check-circle-fill" style="font-size: 4rem; color: var(--bs-primary);"></i>
                </div>
                <h2 class="mb-3">{{ $t('verification.success') }}</h2>
                <p class="text-muted mb-4">{{ $t('verification.successMessage') }}</p>
                <router-link to="/" class="btn btn-primary btn-lg w-100">
                  {{ $t('verification.startShopping') }}
                </router-link>
              </div>

              <!-- Verification Form -->
              <div v-else>
                <div class="text-center mb-4">
                  <div class="icon-circle mx-auto mb-3">
                    <i class="bi bi-envelope-check" style="font-size: 2.5rem; color: var(--bs-primary);"></i>
                  </div>
                  <h2 class="mb-2">{{ $t('verification.title') }}</h2>
                  <p class="text-muted">
                    {{ $t('verification.subtitle') }}
                    <br>
                    <strong>{{ email }}</strong>
                  </p>
                  <!-- Spam folder warning -->
                  <div class="alert alert-warning py-2 small mt-3 mb-0" role="alert">
                    <i class="bi bi-exclamation-circle me-1"></i>
                    {{ $t('verification.checkSpam') }}
                  </div>
                </div>

                <!-- OTP Input -->
                <div class="otp-container mb-4">
                  <div class="otp-inputs d-flex justify-content-center gap-2">
                    <input
                      v-for="(digit, index) in otpDigits"
                      :key="index"
                      :ref="el => otpRefs[index] = el"
                      v-model="otpDigits[index]"
                      type="text"
                      inputmode="numeric"
                      maxlength="1"
                      class="otp-input form-control text-center"
                      @input="handleOtpInput(index, $event)"
                      @keydown="handleOtpKeydown(index, $event)"
                      @paste="handlePaste($event)"
                      :disabled="loading"
                    />
                  </div>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="alert alert-danger py-2 small mb-3" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                </div>

                <!-- Verify Button -->
                <button 
                  type="button" 
                  class="btn btn-primary btn-lg w-100 mb-3" 
                  :disabled="loading || !isOtpComplete"
                  @click="verifyCode"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? $t('verification.verifying') : $t('verification.verify') }}
                </button>

                <!-- Resend Section -->
                <div class="text-center">
                  <p class="text-muted small mb-2">{{ $t('verification.didntReceive') }}</p>
                  <button 
                    type="button" 
                    class="btn btn-link p-0 text-decoration-none"
                    :disabled="resendCooldown > 0 || loading"
                    @click="resendCode"
                  >
                    <span v-if="resendCooldown > 0">
                      {{ $t('verification.resendIn', { seconds: resendCooldown }) }}
                    </span>
                    <span v-else>
                      <i class="bi bi-arrow-clockwise me-1"></i>
                      {{ $t('verification.resend') }}
                    </span>
                  </button>
                </div>

                <!-- Back to Register -->
                <div class="text-center mt-4 pt-3 border-top">
                  <router-link to="/register" class="text-muted text-decoration-none small">
                    <i class="bi bi-arrow-left me-1"></i>
                    {{ $t('verification.backToRegister') }}
                  </router-link>
                </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t, locale } = useI18n()

// State
const email = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const otpRefs = ref([])
const loading = ref(false)
const error = ref('')
const verified = ref(false)
const resendCooldown = ref(0)
let cooldownInterval = null

// Computed
const isOtpComplete = computed(() => {
  return otpDigits.value.every(d => d !== '')
})

const otpCode = computed(() => {
  return otpDigits.value.join('')
})

// Methods
function handleOtpInput(index, event) {
  const value = event.target.value
  
  // Only allow numbers
  if (!/^\d*$/.test(value)) {
    otpDigits.value[index] = ''
    return
  }

  // Move to next input
  if (value && index < 5) {
    otpRefs.value[index + 1]?.focus()
  }

  // Auto-submit when complete
  if (isOtpComplete.value) {
    verifyCode()
  }
}

function handleOtpKeydown(index, event) {
  // Handle backspace
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpRefs.value[index - 1]?.focus()
  }
  
  // Handle arrow keys
  if (event.key === 'ArrowLeft' && index > 0) {
    otpRefs.value[index - 1]?.focus()
  }
  if (event.key === 'ArrowRight' && index < 5) {
    otpRefs.value[index + 1]?.focus()
  }
}

function handlePaste(event) {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').trim()
  
  // Only accept 6-digit codes
  if (/^\d{6}$/.test(pastedData)) {
    for (let i = 0; i < 6; i++) {
      otpDigits.value[i] = pastedData[i]
    }
    otpRefs.value[5]?.focus()
    
    // Auto-submit
    setTimeout(() => verifyCode(), 100)
  }
}

async function verifyCode() {
  if (!isOtpComplete.value || loading.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const result = await authStore.verifyOTP(email.value, otpCode.value, locale.value)
    
    if (result.success) {
      verified.value = true
      window.showToast?.(t('verification.success'), 'success')
      
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      error.value = result.error || t('verification.invalidCode')
      // Clear inputs on error
      otpDigits.value = ['', '', '', '', '', '']
      otpRefs.value[0]?.focus()
    }
  } catch (err) {
    error.value = err.message || t('verification.error')
  } finally {
    loading.value = false
  }
}

async function resendCode() {
  if (resendCooldown.value > 0 || loading.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const result = await authStore.resendOTP(email.value, locale.value)
    
    if (result.success) {
      window.showToast?.(t('verification.codeSent'), 'success')
      startCooldown(result.cooldownSeconds || 60)
    } else {
      error.value = result.error || t('verification.resendError')
    }
  } catch (err) {
    error.value = err.message || t('verification.resendError')
  } finally {
    loading.value = false
  }
}

function startCooldown(seconds) {
  resendCooldown.value = seconds
  
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
  
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

// Lifecycle
onMounted(() => {
  // Get email from route query or auth store
  email.value = route.query.email || authStore.pendingVerificationEmail || ''
  
  if (!email.value) {
    // No email to verify, redirect to register
    router.push('/register')
    return
  }
  
  // Start initial cooldown (assume they just registered)
  startCooldown(60)
  
  // Focus first input
  setTimeout(() => {
    otpRefs.value[0]?.focus()
  }, 100)
})

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}

.container {
  flex: 1;
}

.icon-circle {
  width: 80px;
  height: 80px;
  background: rgba(45, 122, 79, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.otp-input {
  width: 48px;
  height: 56px;
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.otp-input:focus {
  border-color: #2d7a4f;
  box-shadow: 0 0 0 0.2rem rgba(45, 122, 79, 0.25);
}

.otp-input:disabled {
  background-color: #f8f9fa;
}

.success-icon {
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 576px) {
  .otp-input {
    width: 42px;
    height: 50px;
    font-size: 1.3rem;
  }
  
  .otp-inputs {
    gap: 0.35rem !important;
  }
}
</style>
