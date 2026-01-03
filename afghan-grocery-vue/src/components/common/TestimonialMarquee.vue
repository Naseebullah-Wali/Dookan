<template>
  <div class="testimonial-marquee-section py-5 overflow-hidden">
    <div class="container-fluid p-0">
      <div class="container mb-5">
        <h2 class="text-center mb-2">{{ $t('home.testimonials.title') }}</h2>
        <p class="text-center text-muted">{{ $t('home.testimonials.subtitle') }}</p>
      </div>

      <div v-if="!loading" class="marquee-container">
        <!-- Multi-Row Marquee Display -->
        <div v-if="!shouldShowMobileSlider" class="marquee-rows-wrapper">
          <!-- Row 1 - Left to Right (LTR) / Right to Left (RTL) -->
          <div class="marquee-row" :class="{ 'row-ltr': !languageStore.isRTL, 'row-rtl': languageStore.isRTL }">
            <div class="marquee-track" :class="{ 'ltr-track': !languageStore.isRTL, 'rtl-track': languageStore.isRTL }">
              <template v-for="iteration in 2" :key="`row1-${iteration}`">
                <div 
                  v-for="testimonial in row1"
                  :key="`${iteration}-${testimonial.id}`"
                  class="testimonial-marquee-card card">
                  <div class="card-body p-4">
                    <div class="d-flex align-items-center gap-3 mb-3">
                      <img 
                        :src="getTestimonialAvatar(testimonial)" 
                        :alt="testimonial.user_name"
                        class="testimonial-avatar"
                      />
                      <div class="flex-grow-1">
                        <h5 class="mb-0 fw-600">{{ testimonial.user_name }}</h5>
                        <p class="text-muted small mb-0">{{ testimonial.location }}</p>
                      </div>
                    </div>
                    <div class="mb-3 d-flex gap-1">
                      <i v-for="star in 5" :key="star" :class="['bi', star <= testimonial.rating ? 'bi-star-fill' : 'bi-star', 'text-warning']" style="font-size: 0.85rem;"></i>
                    </div>
                    <p class="testimonial-comment mb-0">"{{ testimonial.comment }}"</p>
                    <div class="testimonial-date mt-2">{{ formatDate(testimonial.created_at) }}</div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Row 2 - Right to Left (LTR) / Left to Right (RTL) -->
          <div class="marquee-row mt-4" :class="{ 'row-rtl': !languageStore.isRTL, 'row-ltr': languageStore.isRTL }">
            <div class="marquee-track" :class="{ 'rtl-track': !languageStore.isRTL, 'ltr-track': languageStore.isRTL }">
              <template v-for="iteration in 2" :key="`row2-${iteration}`">
                <div 
                  v-for="testimonial in row2"
                  :key="`${iteration}-${testimonial.id}`"
                  class="testimonial-marquee-card card">
                  <div class="card-body p-4">
                    <div class="d-flex align-items-center gap-3 mb-3">
                      <img 
                        :src="getTestimonialAvatar(testimonial)" 
                        :alt="testimonial.user_name"
                        class="testimonial-avatar"
                      />
                      <div class="flex-grow-1">
                        <h5 class="mb-0 fw-600">{{ testimonial.user_name }}</h5>
                        <p class="text-muted small mb-0">{{ testimonial.location }}</p>
                      </div>
                    </div>
                    <div class="mb-3 d-flex gap-1">
                      <i v-for="star in 5" :key="star" :class="['bi', star <= testimonial.rating ? 'bi-star-fill' : 'bi-star', 'text-warning']" style="font-size: 0.85rem;"></i>
                    </div>
                    <p class="testimonial-comment mb-0">"{{ testimonial.comment }}"</p>
                    <div class="testimonial-date mt-2">{{ formatDate(testimonial.created_at) }}</div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Row 3 - Left to Right (LTR) / Right to Left (RTL) (if enough testimonials) -->
          <div v-if="row3.length > 0" class="marquee-row mt-4" :class="{ 'row-ltr': !languageStore.isRTL, 'row-rtl': languageStore.isRTL }">
            <div class="marquee-track" :class="{ 'ltr-track': !languageStore.isRTL, 'rtl-track': languageStore.isRTL }">
              <template v-for="iteration in 2" :key="`row3-${iteration}`">
                <div 
                  v-for="testimonial in row3"
                  :key="`${iteration}-${testimonial.id}`"
                  class="testimonial-marquee-card card">
                  <div class="card-body p-4">
                    <div class="d-flex align-items-center gap-3 mb-3">
                      <img 
                        :src="getTestimonialAvatar(testimonial)" 
                        :alt="testimonial.user_name"
                        class="testimonial-avatar"
                      />
                      <div class="flex-grow-1">
                        <h5 class="mb-0 fw-600">{{ testimonial.user_name }}</h5>
                        <p class="text-muted small mb-0">{{ testimonial.location }}</p>
                      </div>
                    </div>
                    <div class="mb-3 d-flex gap-1">
                      <i v-for="star in 5" :key="star" :class="['bi', star <= testimonial.rating ? 'bi-star-fill' : 'bi-star', 'text-warning']" style="font-size: 0.85rem;"></i>
                    </div>
                    <p class="testimonial-comment mb-0">"{{ testimonial.comment }}"</p>
                    <div class="testimonial-date mt-2">{{ formatDate(testimonial.created_at) }}</div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Mobile Slider View -->
        <div v-else class="mobile-testimonials-container">
          <div class="testimonial-marquee-card card w-100">
            <div class="card-body p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <img 
                  :src="getTestimonialAvatar(testimonials[currentIndex])" 
                  :alt="testimonials[currentIndex].user_name"
                  class="testimonial-avatar"
                />
                <div class="flex-grow-1">
                  <h5 class="mb-0 fw-600">{{ testimonials[currentIndex].user_name }}</h5>
                  <p class="text-muted small mb-0">{{ testimonials[currentIndex].location }}</p>
                </div>
              </div>
              <div class="mb-3 d-flex gap-1">
                <i v-for="star in 5" :key="star" :class="['bi', star <= testimonials[currentIndex].rating ? 'bi-star-fill' : 'bi-star', 'text-warning']" style="font-size: 0.85rem;"></i>
              </div>
              <p class="testimonial-comment mb-0">"{{ testimonials[currentIndex].comment }}"</p>
              <div class="testimonial-date mt-2">{{ formatDate(testimonials[currentIndex].created_at) }}</div>
            </div>
          </div>
          
          <!-- Mobile Navigation -->
          <div class="d-flex justify-content-center align-items-center gap-3 mt-4">
            <button 
              @click="currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length"
              class="btn btn-sm btn-outline-primary rounded-circle"
              :aria-label="$t('common.previous') || 'Previous'"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="text-muted small">{{ currentIndex + 1 }} / {{ testimonials.length }}</span>
            <button 
              @click="currentIndex = (currentIndex + 1) % testimonials.length"
              class="btn btn-sm btn-outline-primary rounded-circle"
              :aria-label="$t('common.next') || 'Next'"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import api from '@/services/api'
import { getAvatarUrl } from '@/services/imageService'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/language'

const { t } = useI18n()
const languageStore = useLanguageStore()

const testimonials = ref([])
const loading = ref(true)
const isMobile = ref(false)
const currentIndex = ref(0)

const shouldShowMobileSlider = computed(() => isMobile.value && testimonials.value.length > 0)

// Distribute testimonials across rows
const row1 = computed(() => {
  return testimonials.value.slice(0, Math.ceil(testimonials.value.length / 3))
})

const row2 = computed(() => {
  const start = Math.ceil(testimonials.value.length / 3)
  const end = Math.ceil((testimonials.value.length * 2) / 3)
  return testimonials.value.slice(start, end)
})

const row3 = computed(() => {
  const start = Math.ceil((testimonials.value.length * 2) / 3)
  return testimonials.value.slice(start)
})

onMounted(async () => {
  try {
    const response = await api.get('/testimonials')
    testimonials.value = response.data || []
  } catch (error) {
    console.error('Failed to load testimonials:', error)
    testimonials.value = []
  } finally {
    loading.value = false
  }

  // After DOM update, adjust animation durations based on content width
  await nextTick()
  adjustAnimationDurations()

  // Detect mobile
  isMobile.value = window.innerWidth <= 768
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768
    adjustAnimationDurations()
  })
})

// Adjust animation duration based on track width
const adjustAnimationDurations = () => {
  const tracks = document.querySelectorAll('.marquee-track')
  tracks.forEach((track) => {
    const trackWidth = track.scrollWidth
    // Calculate duration based on distance - slower for smoother feel
    // Duration = (trackWidth / 2) / pixelsPerSecond
    // Using 80px per second for smooth scrolling
    const duration = Math.max(40, (trackWidth / 2) / 80)
    track.style.animationDuration = `${duration}s`
  })
}

// Get avatar URL for each testimonial
const getTestimonialAvatar = (testimonial) => {
  if (testimonial.avatar) {
    return testimonial.avatar
  }
  return getAvatarUrl(testimonial.gender || 'male', 1)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.testimonial-marquee-section {
  background: linear-gradient(135deg, #fafbfc 0%, rgba(231, 111, 26, 0.04) 50%, #f8f9fa 100%);
  position: relative;
  overflow: hidden;
}

/* Decorative background shapes */
.testimonial-marquee-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(231, 111, 26, 0.3) 50%, transparent 100%);
}

.testimonial-marquee-section::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(231, 111, 26, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.marquee-container::before {
  content: '';
  position: absolute;
  bottom: -20%;
  left: -5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(47, 157, 82, 0.06) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.marquee-rows-wrapper {
  position: relative;
  z-index: 1;
}

.marquee-row {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.marquee-row::before,
.marquee-row::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100px;
  z-index: 10;
  pointer-events: none;
}

.marquee-row::before {
  left: 0;
  background: linear-gradient(90deg, #f8f9fa 0%, rgba(248, 249, 250, 0) 100%);
}

.marquee-row::after {
  right: 0;
  background: linear-gradient(90deg, rgba(248, 249, 250, 0) 0%, #f8f9fa 100%);
}

.marquee-track {
  display: flex;
  gap: 1.5rem;
  width: max-content;
  will-change: transform;
}

/* Left to Right Animation */
.ltr-track {
  animation: scroll-ltr linear infinite;
  animation-duration: 60s;
}

/* Right to Left Animation */
.rtl-track {
  animation: scroll-rtl linear infinite;
  animation-duration: 60s;
}

.marquee-row:hover .marquee-track {
  animation-play-state: paused;
}

.testimonial-marquee-card {
  flex-shrink: 0;
  width: 320px;
  min-width: 320px;
  border: 1px solid rgba(231, 111, 26, 0.15) !important;
  border-left: 4px solid var(--bs-primary) !important;
  background: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  border-radius: 0.5rem;
}

.testimonial-marquee-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 28px rgba(231, 111, 26, 0.15) !important;
  border-left-color: var(--bs-secondary) !important;
}

.testimonial-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(231, 111, 26, 0.2);
}

.testimonial-comment {
  color: #4a4a4a;
  line-height: 1.5;
  font-size: 0.95rem;
  font-style: italic;
}

.testimonial-date {
  font-size: 0.8rem;
  color: var(--bs-tertiary-color);
  font-weight: 500;
}

.fw-600 {
  font-weight: 600;
}

/* Animations - translate by 50% for seamless loop with 2 duplicates */
@keyframes scroll-ltr {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes scroll-rtl {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(50%);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .marquee-rows-wrapper {
    display: none;
  }

  .mobile-testimonials-container {
    padding: 0 1rem;
    max-width: 100%;
  }

  .testimonial-marquee-card {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .testimonial-marquee-card {
    width: 100% !important;
    min-width: 100% !important;
  }

  .testimonial-comment {
    font-size: 0.9rem;
  }
}

@media (min-width: 769px) {
  .mobile-testimonials-container {
    display: none;
  }
}

/* Smooth gradient fade effect on edges */
@supports (mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)) {
  .marquee-row {
    mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%);
  }
}
</style>
