<template>
  <div class="language-switcher">
    <div class="dropdown">
      <button 
        class="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1 language-btn" 
        type="button" 
        id="languageDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        <span class="flag">{{ languageStore.currentLanguage.flag }}</span>
        <span class="lang-code d-md-none">{{ languageStore.currentLanguage.code.toUpperCase() }}</span>
        <span class="lang-name d-none d-md-inline">{{ languageStore.currentLanguage.name }}</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="languageDropdown">
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

.language-btn {
  min-width: auto;
  padding: 0.375rem 0.5rem;
  white-space: nowrap;
}

.flag {
  font-size: 1.1em;
  line-height: 1;
}

.lang-code {
  font-size: 0.75rem;
  font-weight: 600;
}

.dropdown-menu {
  min-width: 160px;
}

.dropdown-item {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
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
  background: white;
}

.btn-outline-secondary:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #212529;
}

/* Mobile styles */
@media (max-width: 767.98px) {
  .language-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .flag {
    font-size: 1rem;
  }
}
</style>
