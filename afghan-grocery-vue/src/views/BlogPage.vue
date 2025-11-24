<template>
  <div class="blog-page bg-light min-vh-100">
    <AppHeader />
    
    <div class="container py-5">
      <div class="text-center mb-5">
        <h1 class="fw-bold mb-2">News & Recipes</h1>
        <p class="text-muted lead">Discover recipes, tips, and news from Afghan Grocery</p>
      </div>

      <div v-if="loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else class="row g-4">
        <div v-for="post in posts" :key="post.id" class="col-md-6 col-lg-4">
          <article class="card h-100 border-0 shadow-sm overflow-hidden blog-card">
            <div class="position-relative" style="height: 200px;">
              <img :src="post.image" :alt="post.title" class="w-100 h-100 object-fit-cover" />
              <span class="position-absolute top-0 end-0 m-3 badge bg-primary rounded-pill">
                {{ post.category }}
              </span>
            </div>
            <div class="card-body p-4 d-flex flex-column">
              <h2 class="h5 fw-bold mb-3">{{ post.title }}</h2>
              <p class="card-text text-muted mb-4 flex-grow-1">{{ post.excerpt }}</p>
              
              <div class="d-flex gap-3 mb-3 text-muted small">
                <span><i class="bi bi-person me-1"></i>{{ post.author }}</span>
                <span><i class="bi bi-calendar3 me-1"></i>{{ formatDate(post.publishedAt) }}</span>
              </div>
              
              <div class="d-flex flex-wrap gap-2 mb-4">
                <span v-for="tag in post.tags" :key="tag" class="badge bg-light text-primary border border-primary-subtle rounded-pill fw-normal">
                  #{{ tag }}
                </span>
              </div>
              
              <router-link :to="`/blog/${post.slug}`" class="btn btn-outline-primary btn-sm w-100 mt-auto">
                Read More <i class="bi bi-arrow-right ms-1"></i>
              </router-link>
            </div>
          </article>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import api from '@/services/api'

const posts = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get('/blog')
    posts.value = response.data
  } catch (error) {
    console.error('Failed to load blog posts:', error)
  } finally {
    loading.value = false
  }
})

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.blog-card {
  transition: transform 0.3s ease;
}

.blog-card:hover {
  transform: translateY(-5px);
}
</style>
