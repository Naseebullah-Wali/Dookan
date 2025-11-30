<template>
  <div class="language-switcher">
    <div class="dropdown">
      <button 
        class="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2" 
        type="button" 
        id="languageDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        <span class="flag">{{ languageStore.currentLanguage.flag }}</span>
        <span class="d-none d-md-inline">{{ languageStore.currentLanguage.name }}</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
        <li v-for="lang in languageStore.languages" :key="lang.code">
          <button 
            class="dropdown-item d-flex align-items-center gap-2" 
            :class="{ active: lang.code === languageStore.currentLocale }"
            @click="changeLanguage(lang.code)"
          >
            <span class="flag">{{ lang.flag }}</span>
            <span>{{ lang.name }}</span>
            <i v-if="lang.code === languageStore.currentLocale" class="bi bi-check2 ms-auto text-primary"></i>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

function changeLanguage(langCode) {
  languageStore.setLanguage(langCode)
  // Reload page to apply RTL changes properly
  if (languageStore.isRTL !== (document.documentElement.getAttribute('dir') === 'rtl')) {
    window.location.reload()
  }
}
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.flag {
  font-size: 1.2em;
  line-height: 1;
}

.dropdown-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: var(--bs-light);
}

.dropdown-item.active {
  background-color: var(--bs-primary-bg-subtle);
  color: var(--bs-primary);
  font-weight: 500;
}

.btn-outline-secondary {
  border-color: #dee2e6;
}

.btn-outline-secondary:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #212529;
}
</style>
