<template>
  <button 
    :class="['wishlist-btn', { active: isInWishlist }]"
    @click.stop="handleToggle"
    :disabled="loading"
    :title="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
  >
    <span class="heart-icon">{{ isInWishlist ? '❤️' : '🤍' }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useWishlistStore } from '@/stores/wishlist'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const wishlistStore = useWishlistStore()

const isInWishlist = computed(() => wishlistStore.isInWishlist(props.product.id))
const loading = computed(() => wishlistStore.loading)

async function handleToggle() {
  await wishlistStore.toggleWishlist(props.product)
}
</script>

<style scoped>
.wishlist-btn {
  background: var(--color-white);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  position: relative;
}

.wishlist-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: var(--shadow-lg);
}

.wishlist-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wishlist-btn.active {
  background-color: var(--color-primary-pale);
}

.heart-icon {
  font-size: 1.25rem;
  transition: transform var(--transition-base);
}

.wishlist-btn:active:not(:disabled) .heart-icon {
  transform: scale(0.8);
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.wishlist-btn.active .heart-icon {
  animation: heartbeat 0.3s ease;
}
</style>
