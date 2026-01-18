<template>
  <div class="dropdown currency-switcher">
    <button 
      class="btn btn-link text-decoration-none dropdown-toggle d-flex align-items-center gap-2 p-0" 
      type="button" 
      id="currencyDropdown" 
      data-bs-toggle="dropdown" 
      aria-expanded="false"
      style="color: var(--bs-primary);"
    >
      <span class="fw-bold">{{ currencyStore.selectedCurrency.code }}</span>
      <span class="currency-symbol small">{{ currencyStore.selectedCurrency.symbol }}</span>
    </button>
    <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2" aria-labelledby="currencyDropdown">
      <li v-for="currency in currencyStore.currencies" :key="currency.code">
        <button 
          class="dropdown-item d-flex align-items-center justify-content-between gap-3 py-2"
          :class="{ 'active': currencyStore.currentCurrency === currency.code }"
          @click="currencyStore.setCurrency(currency.code)"
        >
          <span>{{ currency.code }} - {{ currency.name }}</span>
          <span class="text-muted small">{{ currency.symbol }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useCurrencyStore } from '@/stores/currency'

const currencyStore = useCurrencyStore()
</script>

<style scoped>
.currency-switcher .dropdown-item.active {
  background-color: var(--bs-primary);
  color: white;
}

.currency-switcher .dropdown-item.active .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

.currency-symbol {
  opacity: 0.7;
}

/* @media (max-width: 991px) {
  .dropdown-menu {
    position: static !important;
    float: none;
    width: auto;
    margin-top: 0;
    background-color: transparent;
    border: none;
    box-shadow: none !important;
  }
  
  .dropdown-item {
    text-align: center;
    padding: 0.75rem;
  }
} */
</style>
