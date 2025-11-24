<template>
  <div v-if="relatedProducts.length > 0" class="mt-5 pt-5 border-top">
    <h3 class="h4 fw-bold mb-4">You May Also Like</h3>
    <div class="position-relative">
      <button
        v-if="canScrollLeft"
        @click="scroll('left')"
        class="btn btn-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-md-n3 shadow-lg p-0 d-flex align-items-center justify-content-center"
        style="width: 48px; height: 48px; z-index: 10;"
      >
        <i class="bi bi-chevron-left fs-4"></i>
      </button>
      
      <div ref="carouselRef" class="d-flex gap-4 overflow-auto py-2 scrollbar-none" @scroll="handleScroll">
        <ProductCard
          v-for="product in relatedProducts"
          :key="product.id"
          :product="product"
          class="flex-shrink-0"
          style="width: 280px;"
        />
      </div>

      <button
        v-if="canScrollRight"
        @click="scroll('right')"
        class="btn btn-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-md-n3 shadow-lg p-0 d-flex align-items-center justify-content-center"
        style="width: 48px; height: 48px; z-index: 10;"
      >
        <i class="bi bi-chevron-right fs-4"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import ProductCard from '@/components/product/ProductCard.vue'

const props = defineProps({
  currentProductId: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  maxItems: {
    type: Number,
    default: 8
  }
})

const productsStore = useProductsStore()
const carouselRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const relatedProducts = computed(() => {
  const allProducts = productsStore.products
  
  // Filter products in same category, excluding current product
  let related = allProducts.filter(p => 
    p.category === props.category && p.id !== props.currentProductId
  )

  // Limit to maxItems
  return related.slice(0, props.maxItems)
})

onMounted(() => {
  checkScrollButtons()
})

function handleScroll() {
  checkScrollButtons()
}

function checkScrollButtons() {
  if (!carouselRef.value) return

  const { scrollLeft, scrollWidth, clientWidth } = carouselRef.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10
}

function scroll(direction) {
  if (!carouselRef.value) return

  const scrollAmount = 300
  const newScrollLeft = direction === 'left'
    ? carouselRef.value.scrollLeft - scrollAmount
    : carouselRef.value.scrollLeft + scrollAmount

  carouselRef.value.scrollTo({
    left: newScrollLeft,
    behavior: 'smooth'
  })
}
</script>

<style scoped>
.scrollbar-none {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}

@media (max-width: 640px) {
  .flex-shrink-0 {
    width: 220px !important;
  }
}
</style>
