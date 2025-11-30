<template>
  <div class="referral-page bg-light min-vh-100">
    <AppHeader />
    
    <div class="container py-5">
      <!-- Hero Section -->
      <div class="card border-0 shadow-sm mb-5 overflow-hidden">
        <div class="card-body p-5 text-center bg-primary bg-gradient text-white">
          <h1 class="display-5 fw-bold mb-3">🎁 {{ $t('referral.title') }}</h1>
          <p class="lead mb-0 opacity-90">{{ $t('referral.subtitle') }}</p>
        </div>
      </div>

      <div v-if="!authStore.isAuthenticated" class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm text-center p-5">
            <div class="display-1 mb-4">🔒</div>
            <h2 class="mb-3">{{ $t('referral.loginRequired') }}</h2>
            <p class="text-muted mb-4">{{ $t('referral.loginMessage') }}</p>
            <router-link to="/login" class="btn btn-primary btn-lg px-5">{{ $t('common.login') }}</router-link>
          </div>
        </div>
      </div>

      <div v-else class="referral-content">
        <!-- Referral Stats -->
        <div class="row g-4 mb-5">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100 text-center p-4">
              <div class="display-4 mb-3">👥</div>
              <div class="h2 fw-bold text-primary mb-1">{{ referralStats.totalReferrals }}</div>
              <div class="text-muted small text-uppercase fw-bold">{{ $t('referral.totalReferrals') }}</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100 text-center p-4">
              <div class="display-4 mb-3">💰</div>
              <div class="h2 fw-bold text-primary mb-1">{{ referralStats.totalRewards }} {{ $t('common.afn') }}</div>
              <div class="text-muted small text-uppercase fw-bold">{{ $t('referral.totalEarned') }}</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100 text-center p-4">
              <div class="display-4 mb-3">⏳</div>
              <div class="h2 fw-bold text-primary mb-1">{{ referralStats.pendingReferrals }}</div>
              <div class="text-muted small text-uppercase fw-bold">{{ $t('referral.pending') }}</div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Referral Link -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-4">
                <h2 class="h4 fw-bold mb-3">{{ $t('referral.yourLink') }}</h2>
                <p class="text-muted mb-4">{{ $t('referral.shareLink') }}</p>
                
                <div class="input-group mb-4">
                  <input
                    ref="linkInput"
                    :value="referralLink"
                    readonly
                    class="form-control form-control-lg bg-light"
                    @click="selectLink"
                  />
                  <button @click="copyLink" class="btn btn-primary px-4" type="button">
                    {{ copied ? $t('referral.copied') : $t('referral.copy') }}
                  </button>
                </div>

                <div class="social-share">
                  <p class="fw-bold mb-3">{{ $t('referral.shareOn') }}:</p>
                  <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-success text-white">
                      <i class="bi bi-whatsapp me-2"></i>WhatsApp
                    </button>
                    <button class="btn btn-primary" style="background-color: #1877F2; border-color: #1877F2;">
                      <i class="bi bi-facebook me-2"></i>Facebook
                    </button>
                    <button class="btn btn-info text-white" style="background-color: #1DA1F2; border-color: #1DA1F2;">
                      <i class="bi bi-twitter me-2"></i>Twitter
                    </button>
                    <button class="btn btn-danger">
                      <i class="bi bi-envelope me-2"></i>Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- How It Works -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-4">
                <h2 class="h4 fw-bold mb-4">{{ $t('referral.howItWorks') }}</h2>
                <div class="d-flex flex-column gap-4">
                  <div class="d-flex gap-3">
                    <div class="flex-shrink-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.25rem; font-weight: bold;">1</div>
                    <div>
                      <h3 class="h5 fw-bold mb-1">{{ $t('referral.step1Title') }}</h3>
                      <p class="text-muted mb-0">{{ $t('referral.step1Text') }}</p>
                    </div>
                  </div>
                  <div class="d-flex gap-3">
                    <div class="flex-shrink-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.25rem; font-weight: bold;">2</div>
                    <div>
                      <h3 class="h5 fw-bold mb-1">{{ $t('referral.step2Title') }}</h3>
                      <p class="text-muted mb-0">{{ $t('referral.step2Text') }}</p>
                    </div>
                  </div>
                  <div class="d-flex gap-3">
                    <div class="flex-shrink-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.25rem; font-weight: bold;">3</div>
                    <div>
                      <h3 class="h5 fw-bold mb-1">{{ $t('referral.step3Title') }}</h3>
                      <p class="text-muted mb-0">{{ $t('referral.step3Text') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Referral History -->
        <div class="card border-0 shadow-sm mt-5">
          <div class="card-body p-4">
            <h2 class="h4 fw-bold mb-4">{{ $t('referral.history') }}</h2>
            
            <div v-if="referrals.length === 0" class="text-center py-5 text-muted">
              <p class="mb-0">{{ $t('referral.noReferrals') }}</p>
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th scope="col">{{ $t('common.status') }}</th>
                    <th scope="col">{{ $t('common.date') }}</th>
                    <th scope="col" class="text-end">{{ $t('referral.reward') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="referral in referrals" :key="referral.id">
                    <td>
                      <span class="badge rounded-pill" :class="referral.status === 'completed' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
                        <i class="bi me-1" :class="referral.status === 'completed' ? 'bi-check-circle-fill' : 'bi-hourglass-split'"></i>
                        {{ referral.status === 'completed' ? $t('common.completed') : $t('common.pending') }}
                      </span>
                    </td>
                    <td class="text-muted">{{ formatDate(referral.createdAt) }}</td>
                    <td class="text-end fw-bold text-success">+{{ referral.reward }} {{ $t('common.afn') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import api from '@/services/api'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const authStore = useAuthStore()

const referrals = ref([])
const copied = ref(false)
const linkInput = ref(null)

const referralCode = computed(() => {
  return authStore.user?.referralCode || `USER${authStore.user?.id}2025`
})

const referralLink = computed(() => {
  return `${window.location.origin}/register?ref=${referralCode.value}`
})

const referralStats = computed(() => {
  return {
    totalReferrals: referrals.value.length,
    totalRewards: referrals.value.reduce((sum, r) => sum + (r.status === 'completed' ? r.reward : 0), 0),
    pendingReferrals: referrals.value.filter(r => r.status === 'pending').length
  }
})

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await loadReferrals()
  }
})

async function loadReferrals() {
  try {
    const response = await api.get(`/referrals?referrerId=${authStore.user.id}`)
    referrals.value = response.data
  } catch (error) {
    console.error('Failed to load referrals:', error)
  }
}

function selectLink() {
  linkInput.value?.select()
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    copied.value = true
    window.showToast(t('referral.linkCopied'), 'success')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    window.showToast(t('referral.copyFailed'), 'error')
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
/* Custom styles removed in favor of Bootstrap classes */
</style>
