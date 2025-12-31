<template>
  <div id="app">
    <router-view v-slot="{ Component }" :key="$route.path">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </router-view>
    
    <!-- WhatsApp Support -->
    <WhatsAppSupport />

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup>
import ToastContainer from '@/components/common/ToastContainer.vue'
import WhatsAppSupport from '@/components/common/WhatsAppSupport.vue'

// Auth is now initialized in main.js via authStore.initialize()
</script>

<style>
/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
