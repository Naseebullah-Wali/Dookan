<template>
  <div class="login-page">
    <LoadingSpinner :isLoading="loading" :fullScreen="true" message="Signing in..." />
    <AppHeader />
    
    <div class="container py-3 py-md-5">
      <div class="row justify-content-center">
        <div class="col-lg-5 col-md-7 col-sm-9 col-11">
          <div class="card border-0 shadow-lg">
            <div class="card-body p-3 p-sm-4 p-md-5">
              <h1 class="text-center mb-2 fs-3 fs-md-1">{{ $t('login.welcomeBack') }}</h1>
              <p class="text-center text-muted mb-3 mb-md-4 small">{{ $t('login.subtitle') }}</p>

              <form @submit.prevent="handleLogin">
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

                <div class="mb-3">
                  <label class="form-label fw-semibold small">{{ $t('common.password') }}</label>
                  <input
                    v-model="password"
                    type="password"
                    class="form-control"
                    :placeholder="$t('login.passwordPlaceholder')"
                    required
                  />
                  <div class="text-end mt-2">
                    <router-link to="/forgot-password" class="small text-primary text-decoration-none">
                      {{ $t('login.forgotPassword') }}
                    </router-link>
                  </div>
                </div>

                <div v-if="error" class="alert alert-danger py-2 small" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-100 mb-3" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? $t('common.loggingIn') : $t('common.login') }}
                </button>
              </form>

              <div class="position-relative my-3 my-md-4">
                <hr>
                <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">{{ $t('common.or') }}</span>
              </div>

              <!-- Google Sign-In Button -->
              <button type="button" class="btn btn-light btn-lg w-100 mb-3 border d-flex align-items-center justify-content-center gap-2" @click="handleGoogleSignIn" :disabled="loading">
                <svg class="google-logo" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="none">
                  <image href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E" width="20" height="20"/>
                </svg>
                {{ $t('login.signInWithGoogle') }}
              </button>

              <div class="text-center mt-3 mt-md-4">
                <span class="text-muted small">{{ $t('login.noAccount') }} </span>
                <router-link to="/register" class="text-decoration-none fw-semibold small">{{ $t('login.registerHere') }}</router-link>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// Eagerly fetch CSRF token when component mounts
onMounted(async () => {
  try {
    await api.get('/csrf-token')
  } catch (err) {
    console.warn('Failed to pre-fetch CSRF token:', err)
  }
})

async function handleLogin() {
  loading.value = true
  error.value = ''
  const success = await authStore.login(email.value, password.value)
  if (success) {
    window.showToast(t('messages.loginSuccess'), 'success')
    router.push('/')
  } else {
    error.value = authStore.error || t('messages.loginFailed')
  }
  loading.value = false
}

async function handleGoogleSignIn() {
  loading.value = true
  error.value = ''
  
  const success = await authStore.signInWithGoogle()
  
  if (!success) {
    error.value = authStore.error || t('messages.loginFailed')
    loading.value = false
  }
  // Page will redirect to Google and handle auth, no need to manually navigate
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}

/* Google Button Styling */
.btn-light.border {
  border-color: #dadce0 !important;
  background-color: #ffffff !important;
  color: #3c4043 !important;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-light.border:hover:not(:disabled) {
  background-color: #f8f9fa !important;
  border-color: #4285f4 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn-light.border:active:not(:disabled) {
  background-color: #f1f3f4 !important;
}

.google-logo {
  display: inline-block;
}

/* Responsive form controls */
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
