<template>
  <div class="reset-password-page">
    <AppHeader />
    
    <div class="container py-3 py-md-5">
      <div class="row justify-content-center">
        <div class="col-lg-5 col-md-7 col-sm-9 col-11">
          <div class="card border-0 shadow-lg">
            <div class="card-body p-3 p-sm-4 p-md-5">
              <!-- Loading State -->
              <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">{{ $t('common.loading') }}</span>
                </div>
                <p class="text-muted">{{ $t('resetPassword.validating') }}</p>
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="text-center">
                <h1 class="text-center mb-3 fs-4 text-danger">{{ $t('common.error') }}</h1>
                <div class="alert alert-danger" role="alert">
                  {{ error }}
                </div>
                <router-link to="/login" class="btn btn-primary">
                  {{ $t('resetPassword.backToLogin') }}
                </router-link>
              </div>

              <!-- Token Expired -->
              <div v-else-if="tokenExpired" class="text-center">
                <h1 class="text-center mb-3 fs-4 text-warning">{{ $t('resetPassword.linkExpired') }}</h1>
                <div class="alert alert-warning" role="alert">
                  {{ $t('resetPassword.linkExpiredMessage') }}
                </div>
                <router-link to="/forgot-password" class="btn btn-primary">
                  {{ $t('resetPassword.requestNewLink') }}
                </router-link>
              </div>

              <!-- Success State -->
              <div v-else-if="resetSuccess" class="text-center py-4">
                <div class="success-icon mb-3">✓</div>
                <h2 class="mb-2 fs-4">{{ $t('resetPassword.success') }}</h2>
                <p class="text-muted mb-4">{{ $t('resetPassword.successMessage') }}</p>
                <router-link to="/login" class="btn btn-primary btn-lg">
                  {{ $t('resetPassword.goToLogin') }}
                </router-link>
              </div>

              <!-- Reset Form -->
              <form v-else @submit.prevent="handleSubmit">
                <h1 class="text-center mb-2 fs-3 fs-md-1">{{ $t('resetPassword.title') }}</h1>
                <p class="text-center text-muted mb-3 mb-md-4 small">{{ $t('resetPassword.subtitle') || 'Create a new password for your account' }}</p>

                <!-- New Password -->
                <div class="mb-3">
                  <label for="newPassword" class="form-label fw-semibold small">{{ $t('resetPassword.newPassword') }}</label>
                  <input
                    id="newPassword"
                    v-model="form.password"
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': passwordError }"
                    :placeholder="$t('resetPassword.enterNewPassword')"
                    required
                  />
                  <div v-if="passwordError" class="invalid-feedback d-block">
                    {{ passwordError }}
                  </div>
                </div>

                <!-- Confirm Password -->
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label fw-semibold small">{{ $t('resetPassword.confirmPassword') }}</label>
                  <input
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': confirmPasswordError }"
                    :placeholder="$t('resetPassword.confirmNewPassword')"
                    required
                  />
                  <div v-if="confirmPasswordError" class="invalid-feedback d-block">
                    {{ confirmPasswordError }}
                  </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ submitting ? $t('common.loading') : $t('resetPassword.resetPassword') }}
                </button>
              </form>

              <!-- Back to Login Link -->
              <div v-if="!resetSuccess && !error && !loading && !tokenExpired" class="text-center mt-3 mt-md-4">
                <router-link to="/login" class="text-decoration-none fw-semibold small text-primary">
                  {{ $t('resetPassword.backToLogin') }}
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
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const tokenExpired = ref(false)
const resetSuccess = ref(false)
const submitting = ref(false)
const passwordError = ref('')
const confirmPasswordError = ref('')

const form = ref({
  password: '',
  confirmPassword: '',
  token: '',
  email: ''
})

// Validate passwords
const validatePasswords = () => {
  passwordError.value = ''
  confirmPasswordError.value = ''

  if (!form.value.password) {
    passwordError.value = 'Password is required'
    return false
  }

  if (form.value.password.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return false
  }

  if (!form.value.confirmPassword) {
    confirmPasswordError.value = 'Please confirm your password'
    return false
  }

  if (form.value.password !== form.value.confirmPassword) {
    confirmPasswordError.value = 'Passwords do not match'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validatePasswords()) return

  submitting.value = true
  try {
    const response = await api.post('/auth/reset-password', {
      token: form.value.token,
      email: form.value.email,
      newPassword: form.value.password
    })

    if (response.data.success || response.status === 200) {
      resetSuccess.value = true
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  } catch (err) {
    console.error('Password reset error:', err)
    if (err.response?.status === 400) {
      error.value = err.response.data?.message || 'Invalid or expired reset link'
    } else if (err.response?.status === 404) {
      error.value = 'User account not found'
    } else {
      error.value = 'Failed to reset password. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    // Pre-fetch CSRF token for form submission
    await api.get('/csrf-token')

    // Get token and email from URL query parameters
    const token = route.query.token
    const email = route.query.email

    if (!token || !email) {
      error.value = 'Invalid reset link. Missing token or email.'
      loading.value = false
      return
    }

    form.value.token = token
    form.value.email = decodeURIComponent(email)

    // Validate token on backend (optional - can skip for immediate form display)
    // For now, we'll just show the form and validate on submission
    loading.value = false
  } catch (err) {
    console.error('Error loading reset page:', err)
    error.value = 'An error occurred. Please try again.'
    loading.value = false
  }
})
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.card {
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.card-body {
  background: #fff;
}

.form-label {
  color: #333;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 6px;
  border: 1px solid #ddd;
  padding: 0.75rem;
  font-size: 0.95rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.15);
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0b5ed7;
  border-color: #0b5ed7;
}

.btn-primary:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.success-icon {
  font-size: 60px;
  color: #28a745;
  font-weight: bold;
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}

.alert {
  border-radius: 6px;
  border: none;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
}

.text-center h1,
.text-center h2 {
  color: #333;
}

a {
  color: #0d6efd;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .card-body {
    padding: 1.5rem !important;
  }

  h1 {
    font-size: 1.5rem !important;
  }

  .btn-lg {
    padding: 0.6rem 1.2rem;
    font-size: 0.95rem;
  }
}
</style>
