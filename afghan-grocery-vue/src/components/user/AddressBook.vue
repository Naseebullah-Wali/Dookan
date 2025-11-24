<template>
  <div class="address-book">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="h5 fw-bold mb-0">Saved Addresses</h3>
      <button @click="showAddForm = true" class="btn btn-primary btn-sm">
        <i class="bi bi-plus-lg me-1"></i>Add New Address
      </button>
    </div>

    <!-- Add/Edit Address Form -->
    <div v-if="showAddForm || editingAddress" class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <h4 class="h6 fw-bold mb-4">{{ editingAddress ? 'Edit Address' : 'Add New Address' }}</h4>
        <form @submit.prevent="handleSaveAddress">
          <div class="mb-3">
            <label class="form-label">Address Name *</label>
            <input v-model="formData.name" type="text" class="form-control" placeholder="e.g., Home, Office" required />
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label">Full Name *</label>
              <input v-model="formData.fullName" type="text" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Phone *</label>
              <input v-model="formData.phone" type="tel" class="form-control" placeholder="+93 700 123 456" required />
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">City *</label>
            <select v-model="formData.city" class="form-select" required>
              <option value="kabul">Kabul</option>
              <option value="herat">Herat</option>
              <option value="mazar">Mazar-i-Sharif</option>
              <option value="kandahar">Kandahar</option>
              <option value="jalalabad">Jalalabad</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Complete Address *</label>
            <textarea v-model="formData.address" class="form-control" rows="3" required></textarea>
          </div>
          <div class="form-check mb-4">
            <input v-model="formData.isDefault" type="checkbox" class="form-check-input" id="defaultCheck" />
            <label class="form-check-label" for="defaultCheck">Set as default address</label>
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ loading ? 'Saving...' : 'Save Address' }}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="cancelForm">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Addresses List -->
    <div v-if="addresses.length > 0" class="d-grid gap-3">
      <div v-for="address in addresses" :key="address.id" class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <h4 class="h6 fw-bold mb-0">{{ address.name }}</h4>
            <span v-if="address.isDefault" class="badge bg-primary rounded-pill">Default</span>
          </div>
          <div class="mb-3 text-muted small">
            <p class="mb-1"><strong class="text-dark">{{ address.fullName }}</strong></p>
            <p class="mb-1">{{ address.phone }}</p>
            <p class="mb-1">{{ address.address }}</p>
            <p class="mb-0">{{ getCityName(address.city) }}</p>
          </div>
          <div class="d-flex gap-2">
            <button @click="handleEdit(address)" class="btn btn-outline-primary btn-sm">Edit</button>
            <button @click="handleSetDefault(address)" class="btn btn-outline-secondary btn-sm" :disabled="address.isDefault">
              Set Default
            </button>
            <button @click="handleDelete(address)" class="btn btn-outline-danger btn-sm">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!showAddForm" class="text-center py-5">
      <p class="text-muted mb-3">No saved addresses yet</p>
      <button @click="showAddForm = true" class="btn btn-primary">Add Your First Address</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const addresses = ref([])
const showAddForm = ref(false)
const editingAddress = ref(null)
const loading = ref(false)

const formData = ref({
  name: '',
  fullName: '',
  phone: '',
  city: 'kabul',
  address: '',
  isDefault: false
})

const cityNames = {
  kabul: 'Kabul',
  herat: 'Herat',
  mazar: 'Mazar-i-Sharif',
  kandahar: 'Kandahar',
  jalalabad: 'Jalalabad',
  other: 'Other'
}

onMounted(() => {
  loadAddresses()
})

function loadAddresses() {
  if (authStore.user && authStore.user.addresses) {
    addresses.value = authStore.user.addresses
  }
}

function getCityName(cityId) {
  return cityNames[cityId] || cityId
}

async function handleSaveAddress() {
  loading.value = true

  try {
    const newAddress = {
      ...formData.value,
      id: editingAddress.value?.id || Date.now()
    }

    if (editingAddress.value) {
      // Update existing
      const index = addresses.value.findIndex(a => a.id === editingAddress.value.id)
      addresses.value[index] = newAddress
    } else {
      // Add new
      if (newAddress.isDefault) {
        addresses.value.forEach(a => a.isDefault = false)
      }
      addresses.value.push(newAddress)
    }

    // Update user profile
    await authStore.updateProfile({
      ...authStore.user,
      addresses: addresses.value
    })

    window.showToast('Address saved successfully!', 'success')
    cancelForm()
  } catch (error) {
    window.showToast('Failed to save address', 'error')
  } finally {
    loading.value = false
  }
}

function handleEdit(address) {
  editingAddress.value = address
  formData.value = { ...address }
  showAddForm.value = false
}

async function handleSetDefault(address) {
  addresses.value.forEach(a => a.isDefault = false)
  address.isDefault = true

  await authStore.updateProfile({
    ...authStore.user,
    addresses: addresses.value
  })

  window.showToast('Default address updated', 'success')
}

async function handleDelete(address) {
  if (!confirm('Are you sure you want to delete this address?')) return

  addresses.value = addresses.value.filter(a => a.id !== address.id)

  await authStore.updateProfile({
    ...authStore.user,
    addresses: addresses.value
  })

  window.showToast('Address deleted', 'info')
}

function cancelForm() {
  showAddForm.value = false
  editingAddress.value = null
  formData.value = {
    name: '',
    fullName: '',
    phone: '',
    city: 'kabul',
    address: '',
    isDefault: false
  }
}
</script>

<style scoped>
/* Custom styles removed in favor of Bootstrap classes */
</style>
