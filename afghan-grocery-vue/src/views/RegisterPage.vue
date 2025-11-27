<template>
  <div class="register-page">
    <AppHeader />
    
    <div class="container py-3 py-md-5">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8 col-sm-10 col-11">
          <div class="card border-0 shadow-lg">
            <div class="card-body p-3 p-sm-4 p-md-5">
              <h1 class="text-center mb-2 fs-3 fs-md-1">Create Account</h1>
              <p class="text-center text-muted mb-3 mb-md-4 small">Join Dookan today</p>

              <form @submit.prevent="handleRegister">
                <div class="row g-2 g-md-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">First Name</label>
                    <input
                      v-model="formData.firstName"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Last Name</label>
                    <input
                      v-model="formData.lastName"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small">Email</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    class="form-control"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small">Phone</label>
                  <input
                    v-model="formData.phone"
                    type="tel"
                    class="form-control"
                    placeholder="+93 700 123 456"
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small">Password</label>
                  <input
                    v-model="formData.password"
                    type="password"
                    class="form-control"
                    required
                    minlength="6"
                  />
                  <div class="form-text small">Password must be at least 6 characters</div>
                </div>

                <div v-if="error" class="alert alert-danger py-2 small" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-100 mb-3" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? 'Creating Account...' : 'Create Account' }}
                </button>
              </form>

              <div class="text-center mt-3 mt-md-4">
                <span class="text-muted small">Already have an account? </span>
                <router-link to="/login" class="text-decoration-none fw-semibold small">Login here</router-link>
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
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const router = useRouter()
const authStore = useAuthStore()

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
  
  if (success) {
    window.showToast('Account created successfully!', 'success')
    router.push('/')
  } else {
    error.value = authStore.error || 'Registration failed. Please try again.'
  }
  
  loading.value = false
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
