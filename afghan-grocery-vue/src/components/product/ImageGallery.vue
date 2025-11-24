<template>
  <div class="mb-4">
    <!-- Main Image Display -->
    <div class="position-relative rounded overflow-hidden bg-light ratio ratio-1x1 cursor-zoom-in">
      <img 
        :src="currentImage" 
        :alt="product.name" 
        class="object-fit-cover w-100 h-100"
        @click="openLightbox(currentIndex)"
      />
      <button v-if="images.length > 1" @click.stop="previousImage" class="btn btn-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-3 shadow-sm p-0 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
        <i class="bi bi-chevron-left"></i>
      </button>
      <button v-if="images.length > 1" @click.stop="nextImage" class="btn btn-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-3 shadow-sm p-0 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>

    <!-- Thumbnail Gallery -->
    <div v-if="images.length > 1" class="d-flex gap-2 overflow-auto py-2">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="rounded overflow-hidden border cursor-pointer flex-shrink-0"
        :class="index === currentIndex ? 'border-primary border-2' : 'border-transparent'"
        style="width: 80px; height: 80px;"
        @click="currentIndex = index"
      >
        <img :src="image" :alt="`${product.name} - Image ${index + 1}`" class="w-100 h-100 object-fit-cover" />
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div v-if="lightboxOpen" class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-90 d-flex align-items-center justify-content-center" style="z-index: 2000;" @click="closeLightbox">
      <div class="position-relative w-100 h-100 d-flex align-items-center justify-content-center p-4" @click.stop>
        <button @click="closeLightbox" class="btn btn-link text-white position-absolute top-0 end-0 m-4 p-0 fs-2 text-decoration-none">
          <i class="bi bi-x-lg"></i>
        </button>
        
        <button @click="previousLightboxImage" class="btn btn-link text-white position-absolute top-50 start-0 translate-middle-y ms-4 p-0 fs-1 text-decoration-none d-none d-md-block">
          <i class="bi bi-chevron-left"></i>
        </button>
        
        <img :src="images[lightboxIndex]" :alt="product.name" class="img-fluid" style="max-height: 90vh; object-fit: contain;" />
        
        <button @click="nextLightboxImage" class="btn btn-link text-white position-absolute top-50 end-0 translate-middle-y me-4 p-0 fs-1 text-decoration-none d-none d-md-block">
          <i class="bi bi-chevron-right"></i>
        </button>
        
        <div class="position-absolute bottom-0 start-50 translate-middle-x text-white mb-4 fw-bold">
          {{ lightboxIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const currentIndex = ref(0)
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

const images = computed(() => {
  const productImages = props.product.images || []
  const mainImage = props.product.image
  
  // If no additional images, just show main image
  if (productImages.length === 0) {
    return [mainImage]
  }
  
  // Combine main image with additional images
  return [mainImage, ...productImages]
})

const currentImage = computed(() => images.value[currentIndex.value])

function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}

function previousImage() {
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}

function openLightbox(index) {
  lightboxIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

function nextLightboxImage() {
  lightboxIndex.value = (lightboxIndex.value + 1) % images.value.length
}

function previousLightboxImage() {
  lightboxIndex.value = (lightboxIndex.value - 1 + images.value.length) % images.value.length
}

function handleKeydown(e) {
  if (!lightboxOpen.value) return
  
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextLightboxImage()
  if (e.key === 'ArrowLeft') previousLightboxImage()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.cursor-zoom-in {
  cursor: zoom-in;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
