<template>
  <div class="inquiry-page">
    <AppHeader />

    <section class="hero-section py-5 text-center border-bottom">
      <div class="container">
        <h1 class="mb-2">Inquiry</h1>
        <div class="section-divider mx-auto mb-3"></div>
        <p class="text-muted lead">If you have a question or an order request, send us the details and we'll contact you soon.</p>
      </div>
    </section>

    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <h2 class="mb-4">Send an Inquiry</h2>

              <div v-if="successMessage" class="alert alert-success" role="alert">
                {{ successMessage }}
              </div>

              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Name</label>
                  <input v-model="form.name" type="text" class="form-control form-control-lg" required />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Contact Email</label>
                  <input v-model="form.email" type="email" class="form-control form-control-lg" required />
                </div>

                <!-- Phone field removed -->

                <div class="mb-4">
                  <label class="form-label fw-semibold">Message</label>
                  <textarea v-model="form.message" class="form-control" rows="6" required placeholder="Tell us how we can help you..."></textarea>
                </div>

                <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="bi bi-envelope me-2"></i>
                  {{ loading ? 'Sending...' : 'Send Inquiry' }}
                </button>
              </form>

            </div>
          </div>
          <p class="text-muted small mt-3">We will review your inquiry and contact you soon. For urgent requests, call our support phone.</p>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import api from '@/services/api'

const form = ref({ name: '', email: '', message: '' })
const loading = ref(false)
const successMessage = ref('')

async function handleSubmit() {
  loading.value = true
  successMessage.value = ''

  try {
    // Get reCAPTCHA token if configured
    const { getRecaptchaToken } = await import('@/utils/recaptcha')
    const token = await getRecaptchaToken('contact')

    const payload = { name: form.value.name, email: form.value.email, message: form.value.message, recaptchaToken: token }
    await api.post('/support/contact', payload)

    successMessage.value = 'Thank you. We received your inquiry and will contact you soon.'
    window.showToast && window.showToast(successMessage.value, 'success')

    // reset form
    form.value = { name: '', email: '', message: '' }
  } catch (err) {
    console.error('Inquiry submit failed:', err)
    window.showToast && window.showToast(err?.message || 'Failed to send inquiry', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

.section-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--bs-primary), var(--bs-secondary));
  border-radius: 2px;
  margin-top: 0.5rem;
}
</style>
