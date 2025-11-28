<template>
  <div class="modal fade" id="productModal" tabindex="-1" aria-hidden="true" ref="modalRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Product Name *</label>
                <input v-model="formData.name" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Category *</label>
                <select v-model="formData.category_id" class="form-select" required>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Price (AFN) *</label>
                <input v-model.number="formData.price" type="number" min="0" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Stock *</label>
                <input v-model.number="formData.stock" type="number" min="0" class="form-control" required />
              </div>
              <div class="col-12">
                <label class="form-label">Description</label>
                <textarea v-model="formData.description" class="form-control" rows="3"></textarea>
              </div>
              
              <!-- Image Upload Section -->
              <div class="col-12">
                <label class="form-label">Product Image</label>
                <div class="image-upload-container">
                  <!-- Current Image Preview -->
                  <div v-if="imagePreview || formData.image" class="current-image mb-3">
                    <img :src="imagePreview || getFullImageUrl(formData.image)" alt="Product" class="img-thumbnail" style="max-height: 200px;" />
                    <button type="button" class="btn btn-sm btn-danger mt-2" @click="clearImage">
                      <i class="bi bi-trash"></i> Remove Image
                    </button>
                  </div>
                  
                  <!-- Upload Input -->
                  <div class="upload-area" @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent>
                    <input 
                      ref="fileInput" 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp,image/jpg" 
                      @change="handleFileSelect" 
                      class="d-none"
                    />
                    <div class="upload-placeholder">
                      <i class="bi bi-cloud-upload fs-1 text-primary"></i>
                      <p class="mb-0 mt-2">Click to upload or drag and drop</p>
                      <small class="text-muted">PNG, JPG, WEBP (max 5MB)</small>
                    </div>
                  </div>
                  
                  <!-- Upload Progress -->
                  <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
                    <div class="progress">
                      <div class="progress-bar" :style="{ width: uploadProgress + '%' }">{{ uploadProgress }}%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <label class="form-label">Supplier</label>
                <input v-model="formData.supplier" type="text" class="form-control" />
              </div>
            </div>
            
            <div class="mt-4 d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="loading || uploading">
                <span v-if="loading || uploading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEditing ? 'Update Product' : 'Create Product' }}
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
import api from '@/services/api'

const props = defineProps({
  product: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save'])

const modalRef = ref(null)
const modalInstance = ref(null)
const fileInput = ref(null)
const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const isEditing = ref(false)
const imagePreview = ref(null)
const selectedFile = ref(null)

const formData = ref({
  name: '',
  category_id: '',
  price: 0,
  stock: 0,
  description: '',
  image: '',
  supplier: ''
})

onMounted(() => {
  modalInstance.value = new Modal(modalRef.value)
})

watch(() => props.product, (newVal) => {
  if (newVal) {
    isEditing.value = true
    formData.value = { ...newVal }
    imagePreview.value = null
    selectedFile.value = null
  } else {
    isEditing.value = false
    resetForm()
  }
})

function resetForm() {
  formData.value = {
    name: '',
    category_id: '',
    price: 0,
    stock: 0,
    description: '',
    image: '',
    supplier: ''
  }
  imagePreview.value = null
  selectedFile.value = null
  uploadProgress.value = 0
}

function show() {
  modalInstance.value.show()
}

function hide() {
  modalInstance.value.hide()
}

function triggerFileInput() {
  fileInput.value.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

function handleDrop(event) {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

function processFile(file) {
  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    window.showToast('File size must be less than 5MB', 'error')
    return
  }
  
  selectedFile.value = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  imagePreview.value = null
  selectedFile.value = null
  formData.value.image = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function getFullImageUrl(imagePath) {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  return `${baseUrl}${imagePath}`
}

async function uploadImage() {
  if (!selectedFile.value) return formData.value.image
  
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    const formDataUpload = new FormData()
    formDataUpload.append('image', selectedFile.value)
    
    const response = await api.post('/upload', formDataUpload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })
    
    return response.data.url
  } catch (error) {
    console.error('Upload failed:', error)
    window.showToast('Failed to upload image', 'error')
    throw error
  } finally {
    uploading.value = false
  }
}

async function handleSubmit() {
  loading.value = true
  
  try {
    // Upload image if a new one was selected
    if (selectedFile.value) {
      const imageUrl = await uploadImage()
      formData.value.image = imageUrl
    }
    
    emit('save', { ...formData.value, id: props.product?.id })
    loading.value = false
  } catch (error) {
    loading.value = false
    console.error('Submit failed:', error)
  }
}

defineExpose({ show, hide })
</script>

<style scoped>
.image-upload-container {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 1rem;
}

.upload-area {
  cursor: pointer;
  padding: 2rem;
  text-align: center;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.upload-area:hover {
  background: #e9ecef;
  border-color: var(--bs-primary);
}

.upload-placeholder {
  pointer-events: none;
}

.current-image {
  text-align: center;
}

.current-image img {
  max-width: 100%;
  object-fit: contain;
}
</style>
