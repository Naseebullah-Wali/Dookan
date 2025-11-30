<template>
  <div class="testimonials-section py-5 overflow-hidden">
    <div class="container-fluid p-0">
      <div class="container mb-5">
        <h2 class="text-center mb-2">{{ $t('home.testimonials.title') }}</h2>
        <p class="text-center text-muted">{{ $t('home.testimonials.subtitle') }}</p>
      </div>

      <div v-if="!loading" class="marquee-wrapper">
        <div class="marquee-track d-flex gap-4" :style="{ animationDuration: '40s' }">
          <!-- Original Testimonials -->
          <div 
            v-for="(testimonial, index) in testimonials"
            :key="`orig-${testimonial.id}`"
            class="card shadow-sm flex-shrink-0 testimonial-card"
            style="width: 350px;">
            <div class="card-body p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <img 
                  :src="getTestimonialAvatar(testimonial, index)" 
                  :alt="testimonial.user_name"
                  class="rounded-circle"
                  style="width: 50px; height: 50px; object-fit: cover;"
                />
                <div>
                  <h5 class="mb-0">{{ testimonial.user_name }}</h5>
                  <p class="text-muted small mb-0">{{ testimonial.location }}</p>
                </div>
              </div>
              <div class="mb-3">
                <i v-for="star in 5" :key="star" :class="['bi', star <= testimonial.rating ? 'bi-star-fill' : 'bi-star', 'text-warning']"></i>
              </div>
              <p class="fst-italic text-secondary mb-3">"{{ testimonial.comment }}"</p>
              <div class="text-muted small">{{ formatDate(testimonial.created_at) }}</div>
            </div>
          </div>

          <!-- Duplicated Testimonials for Loop -->
          <div 
            v-for="(testimonial, index) in testimonials"
            :key="`dup-${testimonial.id}`"
            class="card shadow-sm flex-shrink-0 testimonial-card"
            style="width: 350px;">
            <div class="card-body p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <img 
                  :src="getTestimonialAvatar(testimonial, index)" 
                  :alt="testimonial.user_name"
                  class="rounded-circle"
                  style="width: 50px; height: 50px; object-fit: cover;"
                />
                <div>
                  <h5 class="mb-0">{{ testimonial.user_name }}</h5>
                  <p class="text-muted small mb-0">{{ testimonial.location }}</p>
                </div>
              </div>
              <div class="mb-3">
                <i v-for="star in 5" :key="star" :class="['bi', star <= testimonial.rating ? 'bi-star-fill' : 'bi-star', 'text-warning']"></i>
              </div>
              <p class="fst-italic text-secondary mb-3">"{{ testimonial.comment }}"</p>
              <div class="text-muted small">{{ formatDate(testimonial.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { getAvatarUrl } from '@/services/imageService'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const testimonials = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get('/testimonials')
    testimonials.value = response.data || []
  } catch (error) {
    console.error('Failed to load testimonials:', error)
    // Fallback to default testimonials if API fails
    testimonials.value = [
      {
        id: 1,
        user_name: t('testimonials.customer1.name'),
        location: t('testimonials.customer1.location'),
        rating: 5,
        comment: t('testimonials.customer1.comment'),
        gender: 'male',
        created_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        user_name: t('testimonials.customer2.name'),
        location: t('testimonials.customer2.location'),
        rating: 5,
        comment: t('testimonials.customer2.comment'),
        gender: 'female',
        created_at: '2025-01-10T14:30:00Z'
      },
      {
        id: 3,
        user_name: t('testimonials.customer3.name'),
        location: t('testimonials.customer3.location'),
        rating: 5,
        comment: t('testimonials.customer3.comment'),
        gender: 'male',
        created_at: '2025-01-08T09:15:00Z'
      },
      {
        id: 4,
        user_name: t('testimonials.customer4.name'),
        location: t('testimonials.customer4.location'),
        rating: 5,
        comment: t('testimonials.customer4.comment'),
        gender: 'female',
        created_at: '2025-01-05T16:45:00Z'
      },
      {
        id: 5,
        user_name: t('testimonials.customer5.name'),
        location: t('testimonials.customer5.location'),
        rating: 5,
        comment: t('testimonials.customer5.comment'),
        gender: 'male',
        created_at: '2025-01-03T11:20:00Z'
      }
    ]
  } finally {
    loading.value = false
  }
})

// Get avatar URL for each testimonial
const getTestimonialAvatar = (testimonial, index) => {
  if (testimonial.avatar) {
    return testimonial.avatar
  }
  return getAvatarUrl(testimonial.gender || 'male', index + 1)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.testimonials-section {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  position: relative;
}

.testimonials-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(231, 111, 26, 0.3) 50%, transparent 100%);
}

.marquee-wrapper {
  width: 100%;
  overflow: hidden;
}

.marquee-track {
  width: max-content;
  animation: scroll linear infinite;
}

.marquee-track:hover {
  animation-play-state: paused;
}

.testimonial-card {
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-top: 3px solid var(--bs-primary) !important;
  background: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
  border-top-color: var(--bs-secondary) !important;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@media (max-width: 640px) {
  .testimonial-card {
    width: 280px !important;
  }
}
</style>
