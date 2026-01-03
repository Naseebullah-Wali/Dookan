<template>
  <div class="address-book">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="h5 fw-bold mb-0">{{ $t('profile.savedAddresses') }}</h3>
      <button @click="showAddForm = true" class="btn btn-primary btn-sm">
        <i class="bi bi-plus-lg me-1"></i>{{ $t('profile.addNewAddress') }}
      </button>
    </div>

    <!-- Add/Edit Address Form -->
    <div v-if="showAddForm || editingAddress" class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <h4 class="h6 fw-bold mb-4">{{ editingAddress ? $t('profile.editAddress') : $t('profile.addNewAddress') }}</h4>
        <form @submit.prevent="handleSaveAddress">
          <div class="mb-3">
            <label class="form-label">Address Name *</label>
            <input v-model="formData.name" type="text" class="form-control" placeholder="e.g., Home, Office" required />
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label">{{ $t('profile.fullName') }} *</label>
              <input v-model="formData.fullName" type="text" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">{{ $t('checkout.phoneNumber') }} *</label>
              <input v-model="formData.phone" type="tel" class="form-control" placeholder="+93 700 123 456" required />
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">{{ $t('checkout.city') }} *</label>
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
            <label class="form-label">{{ $t('checkout.address') }} *</label>
            <textarea v-model="formData.address" class="form-control" rows="3" required></textarea>
          </div>
          <div class="form-check mb-4">
            <input v-model="formData.isDefault" type="checkbox" class="form-check-input" id="defaultCheck" />
            <label class="form-check-label" for="defaultCheck">{{ $t('profile.setAsDefault') }}</label>
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ loading ? $t('common.saving') : $t('profile.saveAddress') }}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="cancelForm">{{ $t('common.cancel') }}</button>
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
            <span v-if="address.isDefault" class="badge bg-primary rounded-pill">{{ $t('profile.default') }}</span>
          </div>
          <div class="mb-3 text-muted small">
            <p class="mb-1"><strong class="text-dark">{{ address.fullName }}</strong></p>
            <p class="mb-1">{{ address.phone }}</p>
            <p class="mb-1">{{ address.address }}</p>
            <p class="mb-0">{{ getCityName(address.city) }}</p>
          </div>
          <div class="d-flex gap-2">
            <button @click="handleEdit(address)" class="btn btn-outline-primary btn-sm">{{ $t('common.edit') }}</button>
            <button @click="handleSetDefault(address)" class="btn btn-outline-secondary btn-sm" :disabled="address.isDefault">
              {{ $t('profile.setDefault') }}
            </button>
            <button @click="handleDelete(address)" class="btn btn-outline-danger btn-sm">{{ $t('common.delete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!showAddForm" class="text-center py-5">
      <p class="text-muted mb-3">{{ $t('profile.noAddresses') }}</p>
      <button @click="showAddForm = true" class="btn btn-primary">{{ $t('profile.addFirstAddress') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import addressService from '@/services/addressService'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const addresses = ref([])
const showAddForm = ref(false)
const editingAddress = ref(null)
const loading = ref(false)

const formData = ref({
  recipient_name: '',
  fullName: '', // Kept for compatibility if needed, but recipient_name is the backend field
  phone: '',
  city: 'kabul',
  street: '', // Backend expects 'street', frontend was 'address'
  address: '', // Kept for binding, will map to street
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

async function loadAddresses() {
  try {
    addresses.value = await addressService.getAll()
  } catch (error) {
    console.error('Failed to load addresses:', error)
  }
}

function getCityName(cityId) {
  return cityNames[cityId] || cityId
}

async function handleSaveAddress() {
  loading.value = true

  try {
    // Map frontend fields to backend expected fields
    const addressData = {
      full_name: formData.value.fullName || formData.value.recipient_name,
      phone: formData.value.phone,
      city: formData.value.city,
      street: formData.value.address, // Map address to street
      country: 'Afghanistan',
      is_default: formData.value.isDefault
    }

    if (editingAddress.value) {
      await addressService.update(editingAddress.value.id, addressData)
      window.showToast(t('messages.addressUpdated'), 'success')
    } else {
      await addressService.create(addressData)
      window.showToast(t('messages.addressCreated'), 'success')
    }

    await loadAddresses()
    cancelForm()
  } catch (error) {
    console.error('Failed to save address:', error)
    window.showToast(t('messages.error'), 'error')
  } finally {
    loading.value = false
  }
}

function handleEdit(address) {
  editingAddress.value = address
  formData.value = {
    fullName: address.full_name,
    phone: address.phone,
    city: address.city,
    address: address.street,
    isDefault: !!address.is_default
  }
  showAddForm.value = true
}

async function handleSetDefault(address) {
  try {
    await addressService.update(address.id, { is_default: true })
    await loadAddresses()
    window.showToast(t('messages.defaultAddressUpdated'), 'success')
  } catch (error) {
    console.error('Failed to set default address:', error)
    window.showToast(t('messages.error'), 'error')
  }
}

async function handleDelete(address) {
  if (!confirm(t('messages.confirmDelete'))) return

  try {
    await addressService.delete(address.id)
    addresses.value = addresses.value.filter(a => a.id !== address.id)
    window.showToast(t('messages.addressDeleted'), 'info')
  } catch (error) {
    console.error('Failed to delete address:', error)
    window.showToast(t('messages.error'), 'error')
  }
}

function cancelForm() {
  showAddForm.value = false
  editingAddress.value = null
  formData.value = {
    recipient_name: '',
    fullName: '',
    phone: '',
    city: 'kabul',
    street: '',
    address: '',
    isDefault: false
  }
}
</script>

<style scoped>
/* Custom styles removed in favor of Bootstrap classes */
</style>
