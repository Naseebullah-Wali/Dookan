<template>
  <div class="modal fade" id="categoryModal" tabindex="-1" aria-hidden="true" ref="modalRef">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? $t('admin.editCategory') : $t('admin.addCategory') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">{{ $t('common.name') }} *</label>
              <input v-model="formData.name" type="text" class="form-control" required />
            </div>
            
            <div class="mb-3">
              <label class="form-label">{{ $t('common.icon') }} ({{ $t('admin.emoji') }})</label>
              <input v-model="formData.icon" type="text" class="form-control" placeholder="🍎" />
              <small class="text-muted">{{ $t('admin.emojiHint') }}</small>
            </div>
            
            <div class="mb-3">
              <label class="form-label">{{ $t('common.description') }}</label>
              <textarea v-model="formData.description" class="form-control" rows="3"></textarea>
            </div>
            
            <div class="form-check mb-3">
              <input v-model="formData.active" type="checkbox" class="form-check-input" id="isActive" />
              <label class="form-check-label" for="isActive">
                {{ $t('common.active') }}
              </label>
            </div>
            
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEditing ? $t('admin.updateCategory') : $t('admin.createCategory') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Modal } from 'bootstrap'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  category: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save'])

const modalRef = ref(null)
const modalInstance = ref(null)
const loading = ref(false)
const isEditing = ref(false)

const formData = ref({
  name: '',
  icon: '',
  description: '',
  active: true
})

onMounted(() => {
  modalInstance.value = new Modal(modalRef.value)
})

// Watch for prop changes to sync with formData
watch(() => props.category, (newVal) => {
  if (newVal) {
    isEditing.value = true
    formData.value = {
      name: newVal.name || '',
      icon: newVal.icon || '',
      description: newVal.description || '',
      active: newVal.active === 1 ? true : (newVal.active ? true : false)
    }
  } else {
    isEditing.value = false
    formData.value = {
      name: '',
      icon: '',
      description: '',
      active: true
    }
  }
}, { deep: true })

function show() {
  // Re-sync formData from prop when showing
  if (props.category) {
    isEditing.value = true
    formData.value = {
      name: props.category.name || '',
      icon: props.category.icon || '',
      description: props.category.description || '',
      active: props.category.active === 1 ? true : (props.category.active ? true : false)
    }
  } else {
    isEditing.value = false
    formData.value = {
      name: '',
      icon: '',
      description: '',
      active: true
    }
  }
  modalInstance.value.show()
}

function hide() {
  modalInstance.value.hide()
}

async function handleSubmit() {
  loading.value = true
  emit('save', { ...formData.value, id: props.category?.id })
  loading.value = false
}

defineExpose({ show, hide })
</script>
