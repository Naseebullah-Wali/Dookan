<template>
  <div class="register-page">
    <AppHeader />
    
    <div class="container py-3 py-md-5">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8 col-sm-10 col-11">
          <div class="card border-0 shadow-lg">
            <div class="card-body p-3 p-sm-4 p-md-5">
              <h1 class="text-center mb-2 fs-3 fs-md-1">{{ $t('login.createAccount') }}</h1>
              <p class="text-center text-muted mb-3 mb-md-4 small">{{ $t('login.joinDookan') }}</p>

              <form @submit.prevent="handleRegister">
                <div class="row g-2 g-md-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">{{ $t('profile.firstName') }}</label>
                    <input
                      v-model="formData.firstName"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">{{ $t('profile.lastName') }}</label>
                    <input
                      v-model="formData.lastName"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small">{{ $t('common.email') }}</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    class="form-control"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small">{{ $t('checkout.phoneNumber') }}</label>
                  <input
                    v-model="formData.phone"
                    type="tel"
                    class="form-control"
                    placeholder="+93 700 123 456"
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small">{{ $t('common.password') }}</label>
                  <input
                    v-model="formData.password"
                    type="password"
                    class="form-control"
                    required
                    minlength="6"
                  />
                  <div class="form-text small">{{ $t('login.passwordHint') }}</div>
                </div>

                <div v-if="error" class="alert alert-danger py-2 small" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-100 mb-3" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? $t('login.creatingAccount') : $t('login.createAccount') }}
                </button>
              </form>

              <div class="text-center mt-3 mt-md-4">
                <span class="text-muted small">{{ $t('login.alreadyHaveAccount') }} </span>
                <router-link to="/login" class="text-decoration-none fw-semibold small">{{ $t('login.loginHere') }}</router-link>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

async function handleRegister() {
  loading.value = true
  error.value = ''
  
  const userData = {
    name: `${formData.value.firstName} ${formData.value.lastName}`.trim(),
    email: formData.value.email,
    phone: formData.value.phone,
    password: formData.value.password
  }
  
  const success = await authStore.register(userData)
  
  loading.value = false
  
  if (success) {
    window.showToast(t('messages.accountCreated'), 'success')
    // Session is now persisted in auth store, safe to redirect
    router.push('/')
  } else {
    error.value = authStore.error || t('messages.registrationFailed')
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
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
