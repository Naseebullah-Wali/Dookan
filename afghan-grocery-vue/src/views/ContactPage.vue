<template>
  <div class="contact-page">
    <AppHeader />
    
    <!-- Hero Section -->
    <section class="hero-section py-5 text-center border-bottom">
      <div class="container">
        <h1 class="mb-2">{{ $t('contact.title') }}</h1>
        <div class="section-divider mx-auto mb-3"></div>
        <p class="text-muted lead">{{ $t('contact.subtitle') }}</p>
      </div>
    </section>

    <div class="container py-5">

      <div class="row g-4 mb-5">
        <!-- Contact Form -->
        <div class="col-lg-8 col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <h2 class="mb-4">{{ $t('contact.formTitle') }}</h2>
              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label class="form-label fw-semibold">{{ $t('common.name') }}</label>
                  <input v-model="formData.name" type="text" class="form-control form-control-lg" required />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">{{ $t('common.email') }}</label>
                  <input v-model="formData.email" type="email" class="form-control form-control-lg" required />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">{{ $t('common.phone') }} ({{ $t('common.optional') }})</label>
                  <input v-model="formData.phone" type="tel" class="form-control form-control-lg" placeholder="+93 700 123 456" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">{{ $t('contact.subject') }}</label>
                  <select v-model="formData.subject" class="form-select form-select-lg" required>
                    <option value="">{{ $t('contact.selectSubject') }}</option>
                    <option value="order">{{ $t('contact.orderInquiry') }}</option>
                    <option value="delivery">{{ $t('contact.deliveryQuestion') }}</option>
                    <option value="product">{{ $t('contact.productInfo') }}</option>
                    <option value="feedback">{{ $t('contact.feedback') }}</option>
                    <option value="other">{{ $t('contact.other') }}</option>
                  </select>
                </div>
                <div class="mb-4">
                  <label class="form-label fw-semibold">{{ $t('contact.message') }}</label>
                  <textarea 
                    v-model="formData.message" 
                    class="form-control" 
                    rows="6" 
                    required
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="bi bi-envelope me-2"></i>
                  {{ loading ? $t('contact.sending') : $t('contact.sendMessage') }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="col-lg-4 col-12">
          <!-- Quick Contact -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-4">
              <h5 class="card-title mb-4">{{ $t('contact.quickContact') }}</h5>
              <div class="d-flex gap-3 p-3 bg-light rounded mb-3">
                <div style="font-size: 2rem;">📧</div>
                <div>
                  <div class="small text-muted mb-1">{{ $t('common.email') }}</div>
                  <a href="mailto:info@dookan.af" class="text-decoration-none fw-semibold">info@dookan.af</a>
                </div>
              </div>
              <div class="d-flex gap-3 p-3 bg-light rounded mb-3">
                <div style="font-size: 2rem;">📱</div>
                <div>
                  <div class="small text-muted mb-1">{{ $t('common.phone') }}</div>
                  <a href="tel:+93700123456" class="text-decoration-none fw-semibold">+93 700 123 456</a>
                </div>
              </div>
              <div class="d-flex gap-3 p-3 bg-light rounded">
                <div style="font-size: 2rem;">💬</div>
                <div>
                  <div class="small text-muted mb-1">WhatsApp</div>
                  <a href="https://wa.me/93700123456" class="text-decoration-none fw-semibold" target="_blank">+93 700 123 456</a>
                </div>
              </div>
            </div>
          </div>

          <!-- Business Hours -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-4">
              <h5 class="card-title mb-4">{{ $t('contact.businessHours') }}</h5>
              <div class="mb-3">
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span>{{ $t('contact.weekdays') }}</span>
                  <span class="fw-semibold">9:00 AM - 6:00 PM</span>
                </div>
                <div class="d-flex justify-content-between py-2">
                  <span>{{ $t('contact.friday') }}</span>
                  <span class="fw-semibold">{{ $t('contact.closed') }}</span>
                </div>
              </div>
              <p class="text-center text-muted small mb-0">Afghanistan Time (AFT)</p>
            </div>
          </div>

          <!-- FAQ -->
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h5 class="card-title mb-4">{{ $t('contact.faq') }}</h5>
              <div class="mb-4">
                <h6 class="text-primary mb-2">{{ $t('contact.faq1Q') }}</h6>
                <p class="text-muted mb-0">{{ $t('contact.faq1A') }}</p>
              </div>
              <div class="mb-4">
                <h6 class="text-primary mb-2">{{ $t('contact.faq2Q') }}</h6>
                <p class="text-muted mb-0">{{ $t('contact.faq2A') }}</p>
              </div>
              <div>
                <h6 class="text-primary mb-2">{{ $t('contact.faq3Q') }}</h6>
                <p class="text-muted mb-0">{{ $t('contact.faq3A') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Divider -->
      <div class="section-separator my-5"></div>

      <!-- Social Media Section -->
      <section class="mb-5">
        <div class="card border-0 shadow-sm text-center">
          <div class="card-body p-5">
            <h2 class="mb-3">{{ $t('contact.followUs') }}</h2>
            <p class="text-muted mb-4">{{ $t('contact.followUsText') }}</p>
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <a href="#" class="btn btn-outline-primary"><i class="bi bi-facebook me-2"></i>Facebook</a>
              <a href="#" class="btn btn-outline-primary"><i class="bi bi-instagram me-2"></i>Instagram</a>
              <a href="#" class="btn btn-outline-primary"><i class="bi bi-twitter me-2"></i>Twitter</a>
              <a href="#" class="btn btn-outline-primary"><i class="bi bi-linkedin me-2"></i>LinkedIn</a>
            </div>
          </div>
        </div>
      </section>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const formData = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  
  // Simulate sending message
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  window.showToast(t('contact.messageSent'), 'success')
  
  // Reset form
  formData.value = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  }
  
  loading.value = false
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

.section-separator {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(231, 111, 26, 0.2) 20%, rgba(47, 157, 82, 0.2) 80%, transparent 100%);
  margin: 0;
}
</style>
