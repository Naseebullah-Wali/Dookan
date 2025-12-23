<template>
  <header class="sticky-top bg-white shadow-sm transition-all" :class="{ 'shadow-md': isScrolled }">
    <nav class="navbar navbar-expand-lg navbar-light py-3">
      <div class="container">
        <!-- Logo -->
        <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
          <div class="logo-icon d-flex align-items-center justify-content-center" style="font-size: 2rem; filter: grayscale(100%) brightness(60%) sepia(100%) hue-rotate(-50deg) saturate(500%) contrast(1.2);">🛒</div>
          <span class="logo-text fw-bold fs-3" style="color: var(--bs-primary);">Dookan</span>
        </router-link>

        <!-- Mobile Toggle -->
        <button class="navbar-toggler border-0 p-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu" aria-controls="mobileMenu">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Desktop Navigation -->
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-4">
            <li class="nav-item">
              <router-link to="/" class="nav-link fw-semibold">{{ $t('common.home') }}</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/shop" class="nav-link fw-semibold">{{ $t('common.shop') }}</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/about" class="nav-link fw-semibold">{{ $t('common.about') }}</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/contact" class="nav-link fw-semibold">{{ $t('common.contact') }}</router-link>
            </li>
          </ul>

          <!-- Actions -->
          <div class="d-flex align-items-center gap-3">
            <CurrencySwitcher />
            <LanguageSwitcher />
            <template v-if="authStore.isAuthenticated">
              <router-link to="/wishlist" class="btn btn-link text-decoration-none p-0 position-relative hover-scale" title="Wishlist" style="color: var(--bs-primary);">
                <i class="bi bi-heart fs-4"></i>
                <span v-if="wishlistStore.itemCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {{ wishlistStore.itemCount }}
                </span>
              </router-link>
              
              <router-link to="/cart" class="btn btn-link text-decoration-none p-0 position-relative hover-scale" title="Cart" style="color: var(--bs-primary);">
                <i class="bi bi-cart3 fs-4"></i>
                <span v-if="cartStore.itemCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {{ cartStore.itemCount }}
                </span>
              </router-link>

              <!-- User Dropdown -->
              <div class="dropdown">
                <button class="btn btn-link text-decoration-none text-dark dropdown-toggle d-flex align-items-center gap-2 p-0" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <div class="user-avatar rounded-circle text-white d-flex align-items-center justify-content-center fw-bold" style="width: 36px; height: 36px; background-color: var(--bs-primary);">
                    {{ (authStore.user?.name || 'U').charAt(0).toUpperCase() }}
                  </div>
                  <span class="d-none d-lg-block fw-semibold">{{ authStore.user?.name || 'User' }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2" aria-labelledby="userDropdown">
                  <li><router-link to="/profile" class="dropdown-item d-flex align-items-center gap-2 py-2"><i class="bi bi-person"></i> {{ $t('common.profile') }}</router-link></li>
                  <li><router-link to="/orders" class="dropdown-item d-flex align-items-center gap-2 py-2"><i class="bi bi-box-seam"></i> {{ $t('profile.orders') }}</router-link></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button @click="handleLogout" class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"><i class="bi bi-box-arrow-right"></i> {{ $t('common.logout') }}</button></li>
                </ul>
              </div>
              <!-- Dev Tools (visible to dev users only) -->
              <template v-if="authStore.user?.role === 'dev'">
                <button @click="clearCaches" class="btn btn-outline-secondary btn-sm ms-2">Clear Cache</button>
              </template>
            </template>
            <template v-else>
              <router-link to="/cart" class="btn btn-link text-decoration-none p-0 position-relative hover-scale me-2" style="color: var(--bs-primary);">
                <i class="bi bi-cart3 fs-4"></i>
                <span v-if="cartStore.itemCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {{ cartStore.itemCount }}
                </span>
              </router-link>
              <router-link to="/login" class="btn btn-outline-primary btn-sm px-3">{{ $t('common.login') }}</router-link>
              <router-link to="/register" class="btn btn-primary btn-sm px-3">{{ $t('common.register') }}</router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Offcanvas Menu -->
    <div class="offcanvas offcanvas-end" tabindex="-1" id="mobileMenu" aria-labelledby="mobileMenuLabel">
      <div class="offcanvas-header border-bottom bg-light">
        <router-link to="/" class="d-flex align-items-center gap-2 text-decoration-none" data-bs-dismiss="offcanvas">
          <div class="logo-icon d-flex align-items-center justify-content-center" style="font-size: 1.75rem; filter: grayscale(100%) brightness(60%) sepia(100%) hue-rotate(-50deg) saturate(500%) contrast(1.2);">🛒</div>
          <span class="fw-bold fs-4" style="color: var(--bs-primary);">Dookan</span>
        </router-link>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body d-flex flex-column p-4">
        <!-- Mobile Nav Links -->
        <nav class="nav flex-column gap-2 mb-4">
          <button @click="navigateTo('/')" class="nav-link fs-5 fw-semibold text-dark d-flex align-items-center gap-3 p-3 rounded-3 bg-light-hover text-start border-0 bg-transparent" :class="{ 'bg-primary-subtle text-primary': route.path === '/' }">
            <i class="bi bi-house"></i> {{ $t('common.home') }}
          </button>
          <button @click="navigateTo('/shop')" class="nav-link fs-5 fw-semibold text-dark d-flex align-items-center gap-3 p-3 rounded-3 bg-light-hover text-start border-0 bg-transparent" :class="{ 'bg-primary-subtle text-primary': route.path === '/shop' }">
            <i class="bi bi-shop"></i> {{ $t('common.shop') }}
          </button>
          <button @click="navigateTo('/about')" class="nav-link fs-5 fw-semibold text-dark d-flex align-items-center gap-3 p-3 rounded-3 bg-light-hover text-start border-0 bg-transparent" :class="{ 'bg-primary-subtle text-primary': route.path === '/about' }">
            <i class="bi bi-info-circle"></i> {{ $t('common.about') }}
          </button>
          <button @click="navigateTo('/contact')" class="nav-link fs-5 fw-semibold text-dark d-flex align-items-center gap-3 p-3 rounded-3 bg-light-hover text-start border-0 bg-transparent" :class="{ 'bg-primary-subtle text-primary': route.path === '/contact' }">
            <i class="bi bi-envelope"></i> {{ $t('common.contact') }}
          </button>
        </nav>

        <!-- Mobile User Section -->
        <div class="mt-auto pt-4 border-top">
          <div class="mb-3 d-flex justify-content-center gap-3">
            <CurrencySwitcher />
            <LanguageSwitcher />
          </div>
          <template v-if="authStore.isAuthenticated">
            <div class="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
              <div class="user-avatar rounded-circle text-white d-flex align-items-center justify-content-center fw-bold" style="width: 48px; height: 48px; background-color: var(--bs-primary); font-size: 1.25rem;">
                {{ (authStore.user?.name || 'U').charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="fw-bold">{{ authStore.user?.name || 'User' }}</div>
                <div class="small text-muted">{{ authStore.user?.email }}</div>
              </div>
            </div>
            <div class="d-grid gap-2">
              <button @click="navigateTo('/wishlist')" class="btn btn-outline-light text-dark d-flex align-items-center justify-content-between">
                <span><i class="bi bi-heart me-2"></i> {{ $t('common.wishlist') }}</span>
                <span v-if="wishlistStore.itemCount > 0" class="badge bg-danger rounded-pill">{{ wishlistStore.itemCount }}</span>
              </button>
              <button @click="navigateTo('/cart')" class="btn btn-outline-light text-dark d-flex align-items-center justify-content-between">
                <span><i class="bi bi-cart3 me-2"></i> {{ $t('common.cart') }}</span>
                <span v-if="cartStore.itemCount > 0" class="badge bg-danger rounded-pill">{{ cartStore.itemCount }}</span>
              </button>
              <button @click="navigateTo('/profile')" class="btn btn-outline-light text-dark d-flex align-items-center gap-2">
                <i class="bi bi-person"></i> {{ $t('common.profile') }}
              </button>
              <button @click="navigateTo('/orders')" class="btn btn-outline-light text-dark d-flex align-items-center gap-2">
                <i class="bi bi-box-seam"></i> {{ $t('profile.orders') }}
              </button>
              <button @click="handleLogout" class="btn btn-danger d-flex align-items-center justify-content-center gap-2 mt-2">
                <i class="bi bi-box-arrow-right"></i> {{ $t('common.logout') }}
              </button>
            </div>
          </template>
          <template v-else>
            <div class="d-grid gap-2">
              <button @click="navigateTo('/login')" class="btn btn-outline-primary">{{ $t('common.login') }}</button>
              <button @click="navigateTo('/register')" class="btn btn-primary">{{ $t('common.register') }}</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { cacheManager } from '@/utils/cacheManager'
import { indexedCache } from '@/utils/indexedCache'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import CurrencySwitcher from '@/components/common/CurrencySwitcher.vue'
import { useCurrencyStore } from '@/stores/currency'
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const currencyStore = useCurrencyStore()

const isScrolled = ref(false)
let offcanvasInstance = null

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

async function handleLogout() {
  // Close mobile menu if open
  closeMobileMenu()
  
  // Await the logout operation before navigating
  const success = await authStore.logout()
  if (success) {
    // Ensure state is cleared before routing
    await router.push('/')
    window.showToast('Logged out successfully', 'success')
  } else {
    window.showToast('Logout failed', 'error')
  }
}

async function clearCaches() {
  try {
    cacheManager.clearAllCaches()
    // also clear indexdb explicitly
    await indexedCache.clearAll()
    window.showToast('Caches cleared', 'success')
  } catch (e) {
    console.error('Failed to clear caches', e)
    window.showToast('Failed to clear caches', 'error')
  }
}

function closeMobileMenu() {
  if (offcanvasInstance) {
    offcanvasInstance.hide()
  }
  
  // Manually cleanup Bootstrap's body modifications
  setTimeout(() => {
    document.body.classList.remove('modal-open')
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    
    // Remove backdrop if it exists
    const backdrop = document.querySelector('.offcanvas-backdrop')
    if (backdrop) {
      backdrop.remove()
    }
  }, 100)
}

function navigateTo(path) {
  // Close the menu first
  closeMobileMenu()
  
  // Navigate after a short delay to ensure menu closes
  setTimeout(() => {
    router.push(path)
  }, 150)
}

// Watch for route changes and close mobile menu
watch(() => route.path, () => {
  closeMobileMenu()
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  if (authStore.isAuthenticated) {
    wishlistStore.fetchWishlist()
  }
  
  // Initialize Bootstrap dropdowns and offcanvas
  if (typeof window !== 'undefined' && window.bootstrap) {
    const dropdowns = document.querySelectorAll('[data-bs-toggle="dropdown"]')
    dropdowns.forEach(dropdown => {
      new window.bootstrap.Dropdown(dropdown)
    })
    
    // Initialize offcanvas
    const offcanvasElement = document.getElementById('mobileMenu')
    if (offcanvasElement) {
      offcanvasInstance = new window.bootstrap.Offcanvas(offcanvasElement)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (offcanvasInstance) {
    offcanvasInstance.dispose()
  }
})
</script>

<style scoped>
.nav-link {
  position: relative;
  color: var(--color-text-primary);
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--bs-primary);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--bs-primary);
  transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

.bg-light-hover:hover {
  background-color: var(--bs-gray-100);
}
</style>
