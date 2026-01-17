<template>
  <div class="forgot-password-page" :dir="$i18n && $i18n.locale && ['ps','fa'].includes($i18n.locale) ? 'rtl' : 'ltr'">
    <LoadingSpinner :isLoading="loading" :fullScreen="true" message="Processing..." />
    <AppHeader />
    
    <div class="container py-3 py-md-5">
      <div class="row justify-content-center">
        <div class="col-lg-5 col-md-7 col-sm-9 col-11">
          <div class="card border-0 shadow-lg">
            <div class="card-body p-3 p-sm-4 p-md-5">
              <h1 class="text-center mb-2 fs-3 fs-md-1">{{ $t('forgotPassword.title') }}</h1>
              <p class="text-center text-muted mb-3 mb-md-4 small">
                {{ $t('forgotPassword.subtitle') }}
              </p>

              <!-- Step 1: Enter Email -->
              <form v-if="!submitted" @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label class="form-label fw-semibold small">{{ $t('common.email') }}</label>
                  <input
                    v-model="email"
                    type="email"
                    class="form-control"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div v-if="error" class="alert alert-danger py-2 small" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-100 mb-3" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? $t('common.sending') : $t('forgotPassword.sendLink') }}
                </button>
              </form>

              <!-- Step 2: Confirmation Message -->
              <div v-else class="text-center">
                <div class="mb-4">
                  <i class="bi bi-check-circle text-success" style="font-size: 4rem;"></i>
                </div>
                <h5 class="mb-3">{{ $t('forgotPassword.emailSent') }}</h5>
                <p class="text-muted small mb-4">
                  {{ $t('forgotPassword.checkEmail') }}
                </p>
                <p class="text-muted small mb-4">
                  <strong>{{ email }}</strong>
                </p>
                <button @click="resetForm" class="btn btn-primary btn-lg w-100 mb-2">
                  {{ $t('forgotPassword.tryAgain') }}
                </button>
              </div>

              <div class="text-center mt-3 mt-md-4">
                <router-link to="/login" class="text-decoration-none text-primary small">
                  <i class="bi bi-arrow-left me-1"></i>{{ $t('forgotPassword.backToLogin') }}
                </router-link>
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
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import api from '@/services/api'

const { t } = useI18n()

const email = ref('')
const loading = ref(false)
const error = ref('')
const submitted = ref(false)

// Eagerly fetch CSRF token when component mounts
onMounted(async () => {
  try {
    await api.get('/csrf-token')
  } catch (err) {
    console.warn('Failed to pre-fetch CSRF token:', err)
  }
})

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await api.post('/auth/forgot-password', { email: email.value })
    submitted.value = true
  } catch (err) {
    error.value = err.message || t('messages.error')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  email.value = ''
  error.value = ''
  submitted.value = false
}
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}

@media (max-width: 576px) {
  .form-control {
    font-size: 0.95rem;
    padding: 0.5rem 0.75rem;
  }
  
  .btn-lg {
    font-size: 1rem;
    padding: 0.6rem 1rem;
  }
  
  .card {
    margin: 0 0.5rem;
  }
}
</style>
