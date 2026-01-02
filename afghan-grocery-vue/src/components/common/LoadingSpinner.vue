<template>
  <!-- Full Screen Overlay Loader -->
  <div v-if="fullScreen && isLoading" class="loading-overlay">
    <div class="loading-container">
      <div class="spinner"></div>
      <p class="loading-message">{{ displayMessage }}</p>
    </div>
  </div>

  <!-- Inline Loader -->
  <div v-else-if="isLoading" :class="['loading-inline', sizeClass]">
    <div class="spinner-inline"></div>
    <p class="loading-message-inline">{{ displayMessage }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: true
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const sizeClass = {
  sm: 'loading-sm',
  md: 'loading-md',
  lg: 'loading-lg'
}

const displayMessage = computed(() => {
  // If custom message provided, use it
  if (props.message) return props.message
  // Otherwise use i18n translation with proper fallback
  const translatedMessage = t('common.loading')
  // If translation key not found, t() returns the key itself
  return translatedMessage && translatedMessage !== 'common.loading' ? translatedMessage : 'Loading...'
})
</script>

<style scoped>
/* Full Screen Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

/* Inline Loader */
.loading-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  justify-content: center;
}

.loading-inline.loading-sm {
  padding: 1rem;
}

.loading-inline.loading-lg {
  padding: 3rem;
}

/* Main Spinner (Full Screen) */
.spinner {
  width: 60px;
  height: 60px;
  border: 5px solid rgba(255, 71, 111, 0.1);
  border-top: 5px solid rgb(255, 71, 111);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  box-shadow: 0 0 25px rgba(255, 71, 111, 0.4);
}

/* Inline Spinner (smaller) */
.spinner-inline {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 71, 111, 0.1);
  border-top: 4px solid rgb(255, 71, 111);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-sm .spinner-inline {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 71, 111, 0.1);
  border-top: 3px solid rgb(255, 71, 111);
}

.loading-lg .spinner-inline {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 71, 111, 0.1);
  border-top: 5px solid rgb(255, 71, 111);
}

/* Spinning Animation */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Loading Message */
.loading-message {
  color: rgb(255, 71, 111);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.loading-message-inline {
  color: rgb(255, 71, 111);
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
}
</style>
