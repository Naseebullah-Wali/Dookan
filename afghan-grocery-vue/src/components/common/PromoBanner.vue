<template>
  <div v-if="activePromo" class="promo-banner bg-primary text-white py-3" :class="{ dismissed: isDismissed }">
    <div class="container">
      <div class="d-flex align-items-center gap-3 flex-wrap flex-md-nowrap position-relative pe-4">
        <div class="display-6">{{ activePromo.icon }}</div>
        <div class="flex-grow-1">
          <h3 class="h5 fw-bold mb-1">{{ activePromo.title }}</h3>
          <p class="mb-0 opacity-75 small">{{ activePromo.description }}</p>
        </div>
        <router-link v-if="activePromo.link" :to="activePromo.link" class="btn btn-light btn-sm fw-bold px-3 text-primary shadow-sm">
          {{ activePromo.buttonText || 'Shop Now' }}
        </router-link>
        <button @click="dismiss" class="btn-close btn-close-white position-absolute top-0 end-0" aria-label="Close"></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  promos: {
    type: Array,
    default: () => [
      {
        id: 1,
        title: '🎉 Grand Opening Sale!',
        description: 'Get 20% off on all products. Limited time offer!',
        icon: '🎁',
        link: '/shop',
        buttonText: 'Shop Now',
        active: true,
        priority: 1
      },
      {
        id: 2,
        title: 'Free Delivery on Orders Over 5000 AFN',
        description: 'Shop now and save on delivery fees!',
        icon: '🚚',
        link: '/shop',
        buttonText: 'Start Shopping',
        active: true,
        priority: 2
      }
    ]
  }
})

const isDismissed = ref(false)
const currentPromoIndex = ref(0)

const activePromo = computed(() => {
  const activePromos = props.promos.filter(p => p.active)
  if (activePromos.length === 0) return null
  
  // Check if dismissed in localStorage
  const dismissedPromos = JSON.parse(localStorage.getItem('dismissedPromos') || '[]')
  const availablePromos = activePromos.filter(p => !dismissedPromos.includes(p.id))
  
  if (availablePromos.length === 0) return null
  
  // Sort by priority
  availablePromos.sort((a, b) => (a.priority || 0) - (b.priority || 0))
  
  return availablePromos[currentPromoIndex.value % availablePromos.length]
})

function dismiss() {
  if (!activePromo.value) return
  
  isDismissed.value = true
  
  // Save to localStorage
  const dismissedPromos = JSON.parse(localStorage.getItem('dismissedPromos') || '[]')
  if (!dismissedPromos.includes(activePromo.value.id)) {
    dismissedPromos.push(activePromo.value.id)
    localStorage.setItem('dismissedPromos', JSON.stringify(dismissedPromos))
  }
  
  setTimeout(() => {
    currentPromoIndex.value++
  }, 300)
}

onMounted(() => {
  // Rotate promos every 10 seconds
  setInterval(() => {
    if (!isDismissed.value && props.promos.filter(p => p.active).length > 1) {
      currentPromoIndex.value++
    }
  }, 10000)
})
</script>

<style scoped>
.promo-banner {
  animation: slideDown 0.3s ease;
  background-color: var(--bs-primary); /* Fallback */
}

.promo-banner.dismissed {
  animation: slideUp 0.3s ease forwards;
}

@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 200px;
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    max-height: 200px;
    opacity: 1;
  }
  to {
    max-height: 0;
    opacity: 0;
  }
}
</style>
