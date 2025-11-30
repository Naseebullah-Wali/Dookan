<template>
  <button 
    :class="['wishlist-btn', { active: isItemInWishlist }]"
    @click.stop="handleToggle"
    :disabled="loading"
    :title="isItemInWishlist ? $t('wishlist.removeFromWishlist') : $t('wishlist.addToWishlist')"
  >
    <i :class="['bi', isItemInWishlist ? 'bi-heart-fill' : 'bi-heart']"></i>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWishlistStore } from '@/stores/wishlist'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const wishlistStore = useWishlistStore()
const { items, loading } = storeToRefs(wishlistStore)

const isItemInWishlist = computed(() => {
  return items.value.some(item => item.productId == props.product.id || item.product_id == props.product.id)
})

async function handleToggle() {
  await wishlistStore.toggleWishlist(props.product)
}
</script>

<style scoped>
.wishlist-btn {
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  position: relative;
  color: #6c757d;
}

.wishlist-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.wishlist-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wishlist-btn.active {
  background-color: #ffe5e5 !important;
  color: #dc3545 !important;
}

.wishlist-btn i {
  font-size: 1.25rem;
  transition: transform 0.2s ease;
}

.wishlist-btn.active i {
  color: #dc3545 !important;
  animation: heartbeat 0.3s ease;
}

.wishlist-btn:active:not(:disabled) i {
  transform: scale(0.8);
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
</style>
