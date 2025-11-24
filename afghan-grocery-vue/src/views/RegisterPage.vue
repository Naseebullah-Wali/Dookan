<template>
  <div class="register-page">
    <AppHeader />
    
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8 col-sm-10 col-12">
          <div class="card border-0 shadow-lg">
            <div class="card-body p-4 p-md-5">
              <h1 class="text-center mb-2">Create Account</h1>
              <p class="text-center text-muted mb-4">Join Dookan today</p>

              <form @submit.prevent="handleRegister">
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">First Name</label>
                    <input
                      v-model="formData.firstName"
                      type="text"
                      class="form-control form-control-lg"
                      required
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Last Name</label>
                    <input
                      v-model="formData.lastName"
                      type="text"
                      class="form-control form-control-lg"
                      required
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Email</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    class="form-control form-control-lg"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Phone</label>
                  <input
                    v-model="formData.phone"
                    type="tel"
                    class="form-control form-control-lg"
                    placeholder="+93 700 123 456"
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Password</label>
                  <input
                    v-model="formData.password"
                    type="password"
                    class="form-control form-control-lg"
                    required
                    minlength="6"
                  />
                  <div class="form-text">Password must be at least 6 characters</div>
                </div>

                <div v-if="error" class="alert alert-danger" role="alert">
                  <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-100 mb-3" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? 'Creating Account...' : 'Create Account' }}
                </button>
              </form>

              <div class="text-center mt-4">
                <span class="text-muted">Already have an account? </span>
                <router-link to="/login" class="text-decoration-none fw-semibold">Login here</router-link>
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
  
  const success = await authStore.register(formData.value)
  
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
/* Bootstrap handles all styling */
</style>
