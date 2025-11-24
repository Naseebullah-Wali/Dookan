<template>
  <div class="page d-flex flex-column min-vh-100">
    <AppHeader />
    <div class="container py-5 flex-grow-1 text-center d-flex flex-column justify-content-center align-items-center">
      <h1 class="display-4 fw-bold mb-4">{{ title }}</h1>
      <p class="lead text-muted mb-4">This page is under construction. Check back soon!</p>
      <router-link to="/" class="btn btn-primary btn-lg">Go Home</router-link>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

defineProps({
  title: {
    type: String,
    default: 'Page'
  }
})
</script>

<style scoped>
/* Bootstrap handles all styling */
</style>
