<template>
  <a
    :href="whatsappUrl"
    target="_blank"
    class="whatsapp-support shadow-lg transition-all"
    :title="$t('support.whatsapp')"
    aria-label="WhatsApp Support"
  >
    <i class="bi bi-whatsapp"></i>
  </a>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Use environment variable if available, fallback to placeholder
const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '4915217735657'
const message = encodeURIComponent(t('support.whatsappMessage'))

const whatsappUrl = computed(() => {
  return `https://wa.me/${phoneNumber}?text=${message}`
})
</script>

<style scoped>
.whatsapp-support {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 1000;
  background-color: #25d366;
  color: white;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4) !important;
}

.whatsapp-support:hover {
  background-color: #128c7e;
  transform: scale(1.15) rotate(5deg);
  color: white;
  box-shadow: 0 8px 25px rgba(18, 140, 126, 0.5) !important;
}

@media (max-width: 768px) {
  .whatsapp-support {
    bottom: 30px;
    right: 30px;
    width: 55px;
    height: 55px;
    font-size: 1.75rem;
  }
}
</style>
