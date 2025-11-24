<template>
  <div class="news-ticker py-5 bg-light border-bottom overflow-hidden">
    <div class="container-fluid p-0">
      <div class="ticker-track d-flex gap-4" :style="{ transform: `translateX(-${offset}px)` }">
        <!-- Original Items -->
        <div
          v-for="(item, index) in items"
          :key="`original-${index}`"
          class="card border-0 shadow-sm flex-shrink-0 ticker-card cursor-pointer"
          :class="item.bgClass"
          @click="openModal(item)"
        >
          <div class="card-body p-0 d-flex h-100">
            <div class="card-image-wrapper">
              <img :src="item.image" :alt="item.title" class="card-image">
            </div>
            <div class="card-content p-4 d-flex flex-column justify-content-center">
              <div class="badge bg-white text-dark mb-2 align-self-start">{{ item.tag }}</div>
              <h4 class="mb-2 fw-bold text-white">{{ item.title }}</h4>
              <p class="mb-0 text-white-90">{{ item.subtitle }}</p>
            </div>
          </div>
        </div>

        <!-- Duplicated Items for seamless loop -->
        <div
          v-for="(item, index) in items"
          :key="`duplicate-${index}`"
          class="card border-0 shadow-sm flex-shrink-0 ticker-card cursor-pointer"
          :class="item.bgClass"
          @click="openModal(item)"
        >
          <div class="card-body p-0 d-flex h-100">
            <div class="card-image-wrapper">
              <img :src="item.image" :alt="item.title" class="card-image">
            </div>
            <div class="card-content p-4 d-flex flex-column justify-content-center">
              <div class="badge bg-white text-dark mb-2 align-self-start">{{ item.tag }}</div>
              <h4 class="mb-2 fw-bold text-white">{{ item.title }}</h4>
              <p class="mb-0 text-white-90">{{ item.subtitle }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content-custom card border-0 shadow-lg">
        <button class="btn-close position-absolute top-0 end-0 m-3 z-3" @click="closeModal"></button>
        <div class="row g-0">
          <div class="col-md-6">
            <img :src="selectedItem.image" :alt="selectedItem.title" class="img-fluid h-100 object-fit-cover rounded-start">
          </div>
          <div class="col-md-6">
            <div class="card-body p-5 d-flex flex-column h-100 justify-content-center">
              <span class="badge bg-primary w-auto align-self-start mb-3">{{ selectedItem.tag }}</span>
              <h2 class="fw-bold mb-3">{{ selectedItem.title }}</h2>
              <h5 class="text-muted mb-4">{{ selectedItem.subtitle }}</h5>
              <p class="lead mb-4">{{ selectedItem.description }}</p>
              <div class="d-flex gap-3 mt-auto">
                <button class="btn btn-primary btn-lg flex-grow-1" @click="handleShopNow">
                  Shop Now
                </button>
                <button class="btn btn-outline-secondary btn-lg" @click="closeModal">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Using placeholder images that match the theme
const items = ref([
  {
    title: '50% OFF Rice',
    subtitle: 'Premium Basmati Special',
    description: 'Experience the authentic taste of Afghanistan with our premium aged Basmati rice. Perfect for Pulao and Biryani. Limited time offer!',
    tag: 'Special Offer',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
    bgClass: 'bg-gradient-success' // Verdant Green
  },
  {
    title: 'Free Delivery',
    subtitle: 'On orders over 5000 AFN',
    description: 'Shop to your heart\'s content! We are offering free delivery on all orders exceeding 5000 AFN. Send love to your family without extra costs.',
    tag: 'Limited Time',
    image: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=400',
    bgClass: 'bg-gradient-primary' // Deep Blue/Teal
  },
  {
    title: 'New Arrival',
    subtitle: 'Fresh Saffron from Herat',
    description: 'Directly from the fields of Herat, our new stock of premium Saffron is here. Known for its vibrant color and unmatched aroma.',
    tag: 'New In',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400',
    bgClass: 'bg-gradient-danger' // Ruby Red
  },
  {
    title: 'Bulk Discount',
    subtitle: 'Save 20% on Oil & Flour',
    description: 'Stock up on essentials! Get a flat 20% discount when you buy cooking oil and wheat flour in bulk. Ideal for large families.',
    tag: 'Bulk Save',
    image: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=400',
    bgClass: 'bg-gradient-warning' // Saffron Orange
  }
])

const offset = ref(0)
const cardWidth = 450 // Increased width
const gap = 24
const totalItemWidth = cardWidth + gap
const totalWidth = items.value.length * totalItemWidth
let intervalId = null

const showModal = ref(false)
const selectedItem = ref({})

onMounted(() => {
  startTicker()
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

function startTicker() {
  intervalId = setInterval(() => {
    if (showModal.value) return // Pause when modal is open

    offset.value += totalItemWidth
    
    if (offset.value >= totalWidth) {
       offset.value = 0
    }
  }, 3000) // Slower interval (3s)
}

function openModal(item) {
  selectedItem.value = item
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function handleShopNow() {
  closeModal()
  router.push('/shop')
}
</script>

<style scoped>
.ticker-track {
  width: max-content;
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1); /* Smoother, slower transition */
  padding-left: 1rem;
}

.ticker-card {
  width: 450px;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.ticker-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0,0,0,0.15) !important;
  z-index: 10;
}

.card-image-wrapper {
  width: 40%;
  height: 100%;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.ticker-card:hover .card-image {
  transform: scale(1.1);
}

.card-content {
  width: 60%;
}

.cursor-pointer {
  cursor: pointer;
}

.text-white-90 {
  color: rgba(255, 255, 255, 0.9);
}

/* Custom Solid Colors based on palette */
.bg-gradient-success {
  background-color: var(--color-success);
}

.bg-gradient-primary {
  background-color: var(--color-info); /* Using info/teal for variety, or primary if preferred */
}

.bg-gradient-danger {
  background-color: var(--color-primary); /* The new pinkish red */
}

.bg-gradient-warning {
  background-color: var(--color-accent);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

.modal-content-custom {
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 20px;
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
