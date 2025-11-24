<template>
  <div class="login-page">
    <AppHeader />
    
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-5 col-md-7 col-sm-9 col-12">
          <div class="card border-0 shadow-lg">
            <div class="card-body p-4 p-md-5">
              <h1 class="text-center mb-2">Welcome Back</h1>
              <p class="text-center text-muted mb-4">Login to your Dookan account</p>

              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Email</label>
                  <input
                    v-model="email"
                    type="email"
                    class="form-control form-control-lg"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Password</label>
                  <input
                    v-model="password"
                    type="password"
                    class="form-control form-control-lg"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div v-if="error" class="alert alert-danger" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-100 mb-3" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>
              </form>

              <div class="position-relative my-4">
                <hr>
                <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">or</span>
              </div>

              <div class="alert alert-info">
                <p class="mb-2"><strong><i class="bi bi-info-circle me-2"></i>Demo Account:</strong></p>
                <p class="mb-1 small">Email: demo@afghangrocery.com</p>
                <p class="mb-3 small">Password: demo123</p>
                <button @click="useDemoAccount" class="btn btn-outline-primary w-100">
                  <i class="bi bi-person-check me-2"></i>Use Demo Account
                </button>
              </div>

              <div class="text-center mt-4">
                <span class="text-muted">Don't have an account? </span>
                <router-link to="/register" class="text-decoration-none fw-semibold">Register here</router-link>
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

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  
  const success = await authStore.login(email.value, password.value)
  
  if (success) {
    window.showToast('Login successful!', 'success')
    router.push('/')
  } else {
    error.value = authStore.error || 'Login failed. Please check your credentials.'
  }
  
  loading.value = false
}

function useDemoAccount() {
  email.value = 'demo@afghangrocery.com'
  password.value = 'demo123'
  handleLogin()
}
</script>

<style scoped>
/* Bootstrap handles all styling */
</style>
