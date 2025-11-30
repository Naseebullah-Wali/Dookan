<template>
  <footer class="bg-dark text-white py-5 mt-5">
    <div class="container">
      <div class="row g-4 mb-4">
        <!-- Brand Section -->
        <div class="col-lg-4 col-md-6 col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="d-flex align-items-center justify-content-center" style="font-size: 1.75rem; filter: grayscale(100%) brightness(60%) sepia(100%) hue-rotate(-50deg) saturate(500%) contrast(1.2);">🛒</div>
            <h4 class="mb-0 fw-bold" style="color: var(--bs-primary);">Dookan</h4>
          </div>
          <p class="text-white-50">Your trusted online marketplace for quality products delivered across Afghanistan.</p>
        </div>
        
        <!-- Quick Links -->
        <div class="col-lg-2 col-md-6 col-6">
          <h5 class="fw-bold mb-3 text-white">{{ $t('footer.quickLinks') }}</h5>
          <div class="d-flex flex-column gap-2">
            <router-link to="/shop" class="text-white-50 text-decoration-none hover-text-white">{{ $t('common.shop') }}</router-link>
            <router-link to="/about" class="text-white-50 text-decoration-none hover-text-white">{{ $t('common.about') }}</router-link>
            <router-link to="/contact" class="text-white-50 text-decoration-none hover-text-white">{{ $t('common.contact') }}</router-link>
          </div>
        </div>
        
        <!-- Customer Service -->
        <div class="col-lg-3 col-md-6 col-6">
          <h5 class="fw-bold mb-3 text-white">{{ $t('footer.customerService') }}</h5>
          <div class="d-flex flex-column gap-2">
            <router-link to="/orders" class="text-white-50 text-decoration-none hover-text-white">{{ $t('profile.orders') }}</router-link>
            <router-link to="/wishlist" class="text-white-50 text-decoration-none hover-text-white">{{ $t('common.wishlist') }}</router-link>
            <a href="#" class="text-white-50 text-decoration-none hover-text-white">{{ $t('footer.support') }}</a>
          </div>
        </div>
        
        <!-- Contact Info -->
        <div class="col-lg-3 col-md-6 col-12">
          <h5 class="fw-bold mb-3 text-white">{{ $t('common.contact') }}</h5>
          <div class="d-flex flex-column gap-2">
            <p class="text-white-50 mb-0"><i class="bi bi-envelope me-2"></i>info@dookan.af</p>
            <p class="text-white-50 mb-0"><i class="bi bi-telephone me-2"></i>+93 700 123 456</p>
            <p class="text-white-50 mb-0"><i class="bi bi-geo-alt me-2"></i>Kabul, Afghanistan</p>
          </div>
        </div>
      </div>
      
      <!-- Footer Bottom -->
      <div class="pt-4 border-top border-secondary">
        <div class="row align-items-center">
          <div class="col-md-6 col-12 text-center text-md-start mb-3 mb-md-0">
            <p class="text-white-50 mb-0">{{ $t('footer.copyright') }}</p>
          </div>
          <div class="col-md-6 col-12 text-center text-md-end">
            <div class="d-flex gap-3 justify-content-center justify-content-md-end">
              <a href="#" class="text-white-50 hover-text-white text-decoration-none">{{ $t('footer.privacyPolicy') }}</a>
              <a href="#" class="text-white-50 hover-text-white text-decoration-none">{{ $t('footer.termsOfService') }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.hover-text-white:hover {
  color: white !important;
  transition: color 0.2s ease;
}
</style>
