<template>
  <div class="contact-page">
    <AppHeader />
    
    <div class="container py-5">
      <h1 class="text-center mb-2">Contact Us</h1>
      <p class="text-center text-muted mb-5 lead">We're here to help! Get in touch with us.</p>

      <div class="row g-4 mb-5">
        <!-- Contact Form -->
        <div class="col-lg-8 col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <h2 class="mb-4">Send us a Message</h2>
              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Name</label>
                  <input v-model="formData.name" type="text" class="form-control form-control-lg" required />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Email</label>
                  <input v-model="formData.email" type="email" class="form-control form-control-lg" required />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Phone (Optional)</label>
                  <input v-model="formData.phone" type="tel" class="form-control form-control-lg" placeholder="+93 700 123 456" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Subject</label>
                  <select v-model="formData.subject" class="form-select form-select-lg" required>
                    <option value="">Select a subject</option>
                    <option value="order">Order Inquiry</option>
                    <option value="delivery">Delivery Question</option>
                    <option value="product">Product Information</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="mb-4">
                  <label class="form-label fw-semibold">Message</label>
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
                  {{ loading ? 'Sending...' : 'Send Message' }}
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
              <h5 class="card-title mb-4">Quick Contact</h5>
              <div class="d-flex gap-3 p-3 bg-light rounded mb-3">
                <div style="font-size: 2rem;">📧</div>
                <div>
                  <div class="small text-muted mb-1">Email</div>
                  <a href="mailto:info@dookan.af" class="text-decoration-none fw-semibold">info@dookan.af</a>
                </div>
              </div>
              <div class="d-flex gap-3 p-3 bg-light rounded mb-3">
                <div style="font-size: 2rem;">📱</div>
                <div>
                  <div class="small text-muted mb-1">Phone</div>
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
              <h5 class="card-title mb-4">Business Hours</h5>
              <div class="mb-3">
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span>Saturday - Thursday</span>
                  <span class="fw-semibold">9:00 AM - 6:00 PM</span>
                </div>
                <div class="d-flex justify-content-between py-2">
                  <span>Friday</span>
                  <span class="fw-semibold">Closed</span>
                </div>
              </div>
              <p class="text-center text-muted small mb-0">Afghanistan Time (AFT)</p>
            </div>
          </div>

          <!-- FAQ -->
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h5 class="card-title mb-4">Common Questions</h5>
              <div class="mb-4">
                <h6 class="text-primary mb-2">How long does delivery take?</h6>
                <p class="text-muted mb-0">Typically 2-3 business days within major cities.</p>
              </div>
              <div class="mb-4">
                <h6 class="text-primary mb-2">Do you deliver to all cities?</h6>
                <p class="text-muted mb-0">We deliver to Kabul, Herat, Mazar, Kandahar, Jalalabad, and more.</p>
              </div>
              <div>
                <h6 class="text-primary mb-2">What payment methods do you accept?</h6>
                <p class="text-muted mb-0">We accept online payments and cash on delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Social Media Section -->
      <section class="mb-5">
        <div class="card border-0 shadow-sm text-center">
          <div class="card-body p-5">
            <h2 class="mb-3">Follow Us</h2>
            <p class="text-muted mb-4">Stay connected with us on social media for updates and special offers!</p>
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
  
  window.showToast('Message sent successfully! We\'ll get back to you soon.', 'success')
  
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
/* Bootstrap handles all styling */
</style>
