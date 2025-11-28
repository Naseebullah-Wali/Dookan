<template>
  <div class="profile-page">
    <AppHeader />
    
    <div class="container py-5">
      <h1 class="mb-4">My Profile</h1>

      <div class="row g-4">
        <aside class="col-lg-3 col-12">
          <div class="card border-0 shadow-sm">
            <div class="list-group list-group-flush">
              <button :class="['list-group-item list-group-item-action', { active: activeTab === 'info' }]" @click="activeTab = 'info'">
                <i class="bi bi-person me-2"></i>Personal Info
              </button>
              <button :class="['list-group-item list-group-item-action', { active: activeTab === 'addresses' }]" @click="activeTab = 'addresses'">
                <i class="bi bi-geo-alt me-2"></i>Addresses
              </button>
              <router-link to="/orders" class="list-group-item list-group-item-action">
                <i class="bi bi-box-seam me-2"></i>Order History
              </router-link>
              <router-link to="/wishlist" class="list-group-item list-group-item-action">
                <i class="bi bi-heart me-2"></i>Wishlist
              </router-link>
              <button class="list-group-item list-group-item-action text-danger" @click="handleLogout">
                <i class="bi bi-box-arrow-right me-2"></i>Logout
              </button>
            </div>
          </div>
        </aside>

        <div class="col-lg-9 col-12">
          <div v-if="activeTab === 'info'" class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h2 class="mb-4">Personal Information</h2>
              <form @submit.prevent="handleUpdate">
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">First Name</label>
                    <input v-model="formData.firstName" type="text" class="form-control form-control-lg" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Last Name</label>
                    <input v-model="formData.lastName" type="text" class="form-control form-control-lg" required />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Email</label>
                  <input v-model="formData.email" type="email" class="form-control form-control-lg" disabled />
                </div>
                <div class="mb-4">
                  <label class="form-label fw-semibold">Phone</label>
                  <input v-model="formData.phone" type="tel" class="form-control form-control-lg" placeholder="+93 700 123 456" />
                </div>
                <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? 'Saving...' : 'Save Changes' }}
                </button>
              </form>
            </div>
          </div>

          <div v-if="activeTab === 'addresses'" class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h2 class="mb-4">Delivery Addresses</h2>
              <AddressBook />
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import AddressBook from '@/components/user/AddressBook.vue'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('info')
const loading = ref(false)
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
})

onMounted(() => {
  if (authStore.user) {
    const names = (authStore.user.name || '').split(' ')
    formData.value = {
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      email: authStore.user.email,
      phone: authStore.user.phone || ''
    }
  }
})

async function handleUpdate() {
  loading.value = true
  const updateData = {
    name: `${formData.value.firstName} ${formData.value.lastName}`.trim(),
    phone: formData.value.phone
  }
  
  const success = await authStore.updateProfile(updateData)
  if (success) {
    window.showToast('Profile updated successfully!', 'success')
  } else {
    window.showToast('Failed to update profile', 'error')
  }
  loading.value = false
}

function handleLogout() {
  authStore.logout()
  router.push('/')
  window.showToast('Logged out successfully', 'success')
}
</script>

<style scoped>
/* Bootstrap handles all styling */
</style>
