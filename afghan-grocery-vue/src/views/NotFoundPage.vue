<template>
  <div class="not-found-page min-vh-100 d-flex flex-column bg-light">
    <AppHeader />
    
    <div class="container text-center py-5 flex-grow-1 d-flex flex-column justify-content-center">
      <div class="error-animation mb-4">
        <div class="error-code">404</div>
        <div class="error-icon">🔍</div>
      </div>
      
      <h1 class="display-4 fw-bold mb-3">Page Not Found</h1>
      <p class="lead text-muted mb-5">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div class="d-flex gap-3 justify-content-center flex-wrap">
        <router-link to="/" class="btn btn-primary btn-lg px-5 rounded-pill">
          <i class="bi bi-house-door me-2"></i>Go Home
        </router-link>
        <router-link to="/shop" class="btn btn-outline-primary btn-lg px-5 rounded-pill">
          <i class="bi bi-shop me-2"></i>Browse Shop
        </router-link>
        <button @click="goBack" class="btn btn-outline-secondary btn-lg px-5 rounded-pill">
          <i class="bi bi-arrow-left me-2"></i>Go Back
        </button>
      </div>
      
      <div class="mt-5 pt-5">
        <h3 class="h5 mb-4 text-muted">Popular Pages</h3>
        <div class="row g-3 justify-content-center">
          <div class="col-md-3 col-sm-6">
            <router-link to="/shop" class="card border-0 shadow-sm h-100 text-decoration-none hover-lift">
              <div class="card-body text-center p-4">
                <div class="fs-1 mb-2">🛒</div>
                <h6 class="fw-bold mb-0">Shop</h6>
              </div>
            </router-link>
          </div>
          <div class="col-md-3 col-sm-6">
            <router-link to="/orders" class="card border-0 shadow-sm h-100 text-decoration-none hover-lift">
              <div class="card-body text-center p-4">
                <div class="fs-1 mb-2">📦</div>
                <h6 class="fw-bold mb-0">Orders</h6>
              </div>
            </router-link>
          </div>
          <div class="col-md-3 col-sm-6">
            <router-link to="/profile" class="card border-0 shadow-sm h-100 text-decoration-none hover-lift">
              <div class="card-body text-center p-4">
                <div class="fs-1 mb-2">👤</div>
                <h6 class="fw-bold mb-0">Profile</h6>
              </div>
            </router-link>
          </div>
          <div class="col-md-3 col-sm-6">
            <router-link to="/cart" class="card border-0 shadow-sm h-100 text-decoration-none hover-lift">
              <div class="card-body text-center p-4">
                <div class="fs-1 mb-2">🛍️</div>
                <h6 class="fw-bold mb-0">Cart</h6>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <AppFooter />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<style scoped>
.error-animation {
  position: relative;
  height: 200px;
  margin-bottom: 2rem;
}

.error-code {
  font-size: 150px;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  animation: float 3s ease-in-out infinite;
}

.error-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
}

.card {
  color: inherit;
}

.card:hover {
  color: var(--bs-primary);
}
</style>
