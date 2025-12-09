<template>
  <div class="about-page">
    <AppHeader />
    
    <!-- Hero Section -->
    <section class="hero-section py-5 text-center">
      <div class="container">
        <h1 class="display-4 fw-bold mb-3">{{ $t('about.title') }}</h1>
        <div class="section-divider mx-auto mb-3"></div>
        <p class="lead text-muted">{{ $t('about.subtitle') }}</p>
      </div>
    </section>

    <div class="container py-5">
      <!-- Mission Section -->
      <section class="mb-5">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 p-md-5">
            <h2 class="mb-4">{{ $t('about.missionTitle') }}</h2>
            <p class="lead mb-4">
              {{ $t('about.missionText') }}
            </p>
            <p class="mb-0">
              {{ $t('about.missionSubtext') }}
            </p>
          </div>
        </div>
      </section>

      <!-- Section Divider -->
      <div class="section-separator my-5"></div>

      <!-- Story Section -->
      <section class="mb-5">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 p-md-5">
            <h2 class="mb-4">{{ $t('about.storyTitle') }}</h2>
            <p class="mb-3">
              {{ $t('about.storyText') }}
            </p>
            <p class="mb-0">
              {{ $t('about.storySubtext') }}
            </p>
          </div>
        </div>
      </section>

      <!-- Section Divider -->
      <div class="section-separator my-5"></div>

      <!-- Values Section -->
      <section class="values-section mb-5 py-5">
        <div class="text-center mb-5">
          <h2 class="mb-2">{{ $t('about.valuesTitle') }}</h2>
          <div class="section-divider mx-auto"></div>
        </div>
        <div class="row g-4">
          <div class="col-lg-3 col-md-6 col-sm-6 col-12">
            <div class="card border-0 shadow-sm h-100 text-center">
              <div class="card-body p-4">
                <div class="mb-3" style="font-size: 3rem;">🤝</div>
                <h5 class="card-title mb-3">{{ $t('about.trust') }}</h5>
                <p class="card-text text-muted">{{ $t('about.trustText') }}</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-6 col-12">
            <div class="card border-0 shadow-sm h-100 text-center">
              <div class="card-body p-4">
                <div class="mb-3" style="font-size: 3rem;">❤️</div>
                <h5 class="card-title mb-3">{{ $t('about.familyFirst') }}</h5>
                <p class="card-text text-muted">{{ $t('about.familyFirstText') }}</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-6 col-12">
            <div class="card border-0 shadow-sm h-100 text-center">
              <div class="card-body p-4">
                <div class="mb-3" style="font-size: 3rem;">⭐</div>
                <h5 class="card-title mb-3">{{ $t('about.quality') }}</h5>
                <p class="card-text text-muted">{{ $t('about.qualityText') }}</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-6 col-12">
            <div class="card border-0 shadow-sm h-100 text-center">
              <div class="card-body p-4">
                <div class="mb-3" style="font-size: 3rem;">🚀</div>
                <h5 class="card-title mb-3">{{ $t('about.reliability') }}</h5>
                <p class="card-text text-muted">{{ $t('about.reliabilityText') }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Divider -->
      <div class="section-separator my-5"></div>

      <!-- Impact Section -->
      <section class="mb-5">
        <div class="rounded-3 p-5" style="background-color: rgba(231, 111, 26, 0.1);">
          <h2 class="text-center mb-5">{{ $t('about.impactTitle') }}</h2>
          <div class="row g-4 text-center">
            <div class="col-lg-3 col-md-6 col-6">
              <div class="display-4 fw-bold text-primary mb-2">5,000+</div>
              <div class="fw-semibold text-muted">{{ $t('about.familiesServed') }}</div>
            </div>
            <div class="col-lg-3 col-md-6 col-6">
              <div class="display-4 fw-bold text-primary mb-2">15,000+</div>
              <div class="fw-semibold text-muted">{{ $t('about.ordersDelivered') }}</div>
            </div>
            <div class="col-lg-3 col-md-6 col-6">
              <div class="display-4 fw-bold text-primary mb-2">6</div>
              <div class="fw-semibold text-muted">{{ $t('about.citiesCovered') }}</div>
            </div>
            <div class="col-lg-3 col-md-6 col-6">
              <div class="display-4 fw-bold text-primary mb-2">98%</div>
              <div class="fw-semibold text-muted">{{ $t('about.customerSatisfaction') }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Divider -->
      <div class="section-separator my-5"></div>

      <!-- Coverage Section -->
      <section class="mb-5">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 p-md-5">
            <h2 class="mb-4">{{ $t('about.deliveryTitle') }}</h2>
            <p class="mb-4">{{ $t('about.deliveryText') }}</p>
            <div class="row g-3">
              <div class="col-lg-4 col-md-6 col-sm-6 col-12">
                <div class="p-3 bg-light rounded text-center fw-semibold">📍 Kabul</div>
              </div>
              <div class="col-lg-4 col-md-6 col-sm-6 col-12">
                <div class="p-3 bg-light rounded text-center fw-semibold">📍 Herat</div>
              </div>
              <div class="col-lg-4 col-md-6 col-sm-6 col-12">
                <div class="p-3 bg-light rounded text-center fw-semibold">📍 Mazar-i-Sharif</div>
              </div>
              <div class="col-lg-4 col-md-6 col-sm-6 col-12">
                <div class="p-3 bg-light rounded text-center fw-semibold">📍 Kandahar</div>
              </div>
              <div class="col-lg-4 col-md-6 col-sm-6 col-12">
                <div class="p-3 bg-light rounded text-center fw-semibold">📍 Jalalabad</div>
              </div>
              <div class="col-lg-4 col-md-6 col-sm-6 col-12">
                <div class="p-3 bg-light rounded text-center fw-semibold">📍 {{ $t('about.moreCities') }}</div>
              </div>
            </div>

            <div class="mt-5">
              <h4 class="mb-3">{{ $t('about.deliveryZoneMap') }}</h4>
              <DeliveryMap height="450px" />
            </div>
          </div>
        </div>
      </section>

      <!-- Section Divider -->
      <div class="section-separator my-5"></div>

      <!-- CTA Section -->
      <section class="my-5">
        <div class="card border-0 shadow-sm text-center" style="background: linear-gradient(135deg, rgba(231, 111, 26, 0.1) 0%, rgba(47, 157, 82, 0.1) 100%);">
          <div class="card-body p-5">
            <h2 class="mb-3">{{ $t('about.ctaTitle') }}</h2>
            <p class="lead mb-4">{{ $t('about.ctaText') }}</p>
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <router-link to="/shop" class="btn btn-primary btn-lg">
                <i class="bi bi-bag me-2"></i>{{ $t('about.startShopping') }}
              </router-link>
              <router-link to="/contact" class="btn btn-outline-secondary btn-lg">
                <i class="bi bi-envelope me-2"></i>{{ $t('about.contactUs') }}
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import DeliveryMap from '@/components/common/DeliveryMap.vue'
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, rgba(231, 111, 26, 0.1) 0%, rgba(47, 157, 82, 0.1) 100%);
  border-bottom: 2px solid rgba(231, 111, 26, 0.1);
}

.section-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--bs-primary), var(--bs-secondary));
  border-radius: 2px;
  margin-top: 0.5rem;
}

.section-separator {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(231, 111, 26, 0.2) 20%, rgba(47, 157, 82, 0.2) 80%, transparent 100%);
  margin: 0;
}

.values-section {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 0.5rem;
}
</style>
