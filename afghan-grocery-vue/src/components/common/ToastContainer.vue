<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1050;">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast show align-items-center border-0 mb-2"
        :class="getToastClass(toast.type)"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i :class="getIconClass(toast.type)" class="fs-5"></i>
            <div>
              <strong class="d-block">{{ toast.title }}</strong>
              <span v-if="toast.message" class="small opacity-90">{{ toast.message }}</span>
            </div>
          </div>
          <button 
            type="button" 
            class="btn-close me-2 m-auto" 
            :class="{ 'btn-close-white': isColored(toast.type) }"
            @click="removeToast(toast.id)" 
            aria-label="Close"
          ></button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let nextId = 1

function addToast(type, title, message = '', duration = 5000) {
  const id = nextId++
  toasts.value.push({ id, type, title, message })
  
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
}

function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

function getToastClass(type) {
  switch (type) {
    case 'success': return 'text-bg-success'
    case 'error': return 'text-bg-danger'
    case 'info': return 'text-bg-info'
    default: return 'bg-white'
  }
}

function getIconClass(type) {
  switch (type) {
    case 'success': return 'bi bi-check-circle-fill'
    case 'error': return 'bi bi-exclamation-circle-fill'
    case 'info': return 'bi bi-info-circle-fill'
    default: return 'bi bi-bell-fill'
  }
}

function isColored(type) {
  return ['success', 'error', 'info'].includes(type)
}

// Expose methods globally
window.showToast = (message, type = 'success', title = '') => {
  const titles = {
    success: title || 'Success',
    error: title || 'Error',
    info: title || 'Info'
  }
  addToast(type, titles[type], message)
}

defineExpose({ addToast, removeToast })
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
