<template>
  <div class="modal fade" id="categoryModal" tabindex="-1" aria-hidden="true" ref="modalRef">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Edit Category' : 'Add New Category' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Category Name *</label>
              <input v-model="formData.name" type="text" class="form-control" required />
            </div>
            
            <div class="mb-3">
              <label class="form-label">Icon (Emoji)</label>
              <input v-model="formData.icon" type="text" class="form-control" placeholder="🍎" />
              <small class="text-muted">Enter an emoji to represent this category</small>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea v-model="formData.description" class="form-control" rows="3"></textarea>
            </div>
            
            <div class="form-check mb-3">
              <input v-model="formData.is_active" type="checkbox" class="form-check-input" id="isActive" />
              <label class="form-check-label" for="isActive">
                Active
              </label>
            </div>
            
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEditing ? 'Update Category' : 'Create Category' }}
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
  is_active: true
})

onMounted(() => {
  modalInstance.value = new Modal(modalRef.value)
})

watch(() => props.category, (newVal) => {
  if (newVal) {
    isEditing.value = true
    formData.value = { ...newVal }
  } else {
    isEditing.value = false
    formData.value = {
      name: '',
      icon: '',
      description: '',
      is_active: true
    }
  }
})

function show() {
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
