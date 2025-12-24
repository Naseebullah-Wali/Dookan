<template>
  <div class="admin-page bg-light min-vh-100">
    <AppHeader />
    
    <div class="container py-5">
      <div class="text-center mb-5">
        <h1 class="fw-bold mb-2">🔧 {{ $t('admin.dashboard') }}</h1>
        <p class="text-muted">{{ $t('admin.manageStore') }}</p>
      </div>

      <div v-if="!authStore.isAuthenticated || !isAdmin" class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm text-center p-5">
            <div class="display-1 mb-4">🔒</div>
            <h2 class="mb-3">{{ $t('admin.accessRequired') }}</h2>
            <p class="text-muted mb-4">{{ $t('admin.loginRequired') }}</p>
            <router-link to="/login" class="btn btn-primary btn-lg px-5">{{ $t('common.login') }}</router-link>
          </div>
        </div>
      </div>

      <div v-else class="admin-content">
        <!-- Stats Overview -->
        <div class="row g-4 mb-5">
          <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100 text-center p-4">
              <div class="display-4 mb-3">📦</div>
              <div class="h2 fw-bold text-primary mb-1">{{ stats.totalProducts }}</div>
              <div class="text-muted small text-uppercase fw-bold">{{ $t('admin.totalProducts') }}</div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100 text-center p-4">
              <div class="display-4 mb-3">🛒</div>
              <div class="h2 fw-bold text-primary mb-1">{{ stats.totalOrders }}</div>
              <div class="text-muted small text-uppercase fw-bold">{{ $t('admin.totalOrders') }}</div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100 text-center p-4">
              <div class="display-4 mb-3">👥</div>
              <div class="h2 fw-bold text-primary mb-1">{{ stats.totalUsers }}</div>
              <div class="text-muted small text-uppercase fw-bold">{{ $t('admin.totalUsers') }}</div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100 text-center p-4">
              <div class="display-4 mb-3">💰</div>
              <div class="h2 fw-bold text-primary mb-1">{{ formatPrice(stats.totalRevenue) }} {{ $t('common.afn') }}</div>
              <div class="text-muted small text-uppercase fw-bold">{{ $t('admin.totalRevenue') }}</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card border-0 shadow-sm mb-5">
          <div class="card-body p-4">
            <h2 class="h4 fw-bold mb-4">{{ $t('admin.quickActions') }}</h2>
            <div class="row g-3">
              <div class="col-md-3">
                <button @click="activeTab = 'products'" class="btn btn-outline-primary w-100 py-4 h-100 d-flex flex-column align-items-center justify-content-center gap-2" :class="{ active: activeTab === 'products' }">
                  <span class="fs-4">📦</span>
                  <span class="fw-bold">{{ $t('admin.products') }}</span>
                </button>
              </div>
              <div class="col-md-3">
                <button @click="activeTab = 'categories'" class="btn btn-outline-primary w-100 py-4 h-100 d-flex flex-column align-items-center justify-content-center gap-2" :class="{ active: activeTab === 'categories' }">
                  <span class="fs-4">🏷️</span>
                  <span class="fw-bold">{{ $t('admin.categories') }}</span>
                </button>
              </div>
              <div class="col-md-3">
                <button @click="activeTab = 'orders'" class="btn btn-outline-primary w-100 py-4 h-100 d-flex flex-column align-items-center justify-content-center gap-2" :class="{ active: activeTab === 'orders' }">
                  <span class="fs-4">🛒</span>
                  <span class="fw-bold">{{ $t('admin.orders') }}</span>
                </button>
              </div>
              <div class="col-md-3">
                <button @click="activeTab = 'users'" class="btn btn-outline-primary w-100 py-4 h-100 d-flex flex-column align-items-center justify-content-center gap-2" :class="{ active: activeTab === 'users' }">
                  <span class="fs-4">👥</span>
                  <span class="fw-bold">{{ $t('admin.users') }}</span>
                </button>
              </div>
              <div class="col-md-3">
                <button @click="activeTab = 'settings'" class="btn btn-outline-primary w-100 py-4 h-100 d-flex flex-column align-items-center justify-content-center gap-2" :class="{ active: activeTab === 'settings' }">
                  <span class="fs-4">⚙️</span>
                  <span class="fw-bold">{{ $t('admin.settings') || 'Settings' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Management -->
        <div v-if="activeTab === 'products'" class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h2 class="h4 fw-bold mb-0">{{ $t('admin.productsManagement') }}</h2>
              <button class="btn btn-primary btn-sm" @click="openProductModal(null)">
                <i class="bi bi-plus-lg me-1"></i>{{ $t('admin.addProduct') }}
              </button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>{{ $t('common.id') }}</th>
                    <th>{{ $t('common.name') }}</th>
                    <th>{{ $t('common.category') }}</th>
                    <th>{{ $t('common.price') }}</th>
                    <th>{{ $t('product.stock') }}</th>
                    <th>{{ $t('common.status') }}</th>
                    <th>{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in productsStore.products" :key="product.id">
                    <td>{{ product.id }}</td>
                    <td class="fw-semibold">{{ languageStore.getLocalizedName(product) }}</td>
                    <td><span class="badge bg-light text-dark border">{{ getCategoryName(product.category_id) }}</span></td>
                    <td>{{ formatPrice(product.price) }} {{ $t('common.afn') }}</td>
                    <td>{{ product.stock }}</td>
                    <td>
                      <span :class="['badge rounded-pill', product.stock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger']">
                        {{ product.stock > 0 ? $t('product.inStock') : $t('product.outOfStock') }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" title="Edit" @click="openProductModal(product)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" title="Delete" @click="handleDeleteProduct(product.id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Orders Management -->
        <div v-if="activeTab === 'orders'" class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h2 class="h4 fw-bold mb-0">{{ $t('admin.ordersManagement') }}</h2>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>{{ $t('admin.orderId') }}</th>
                    <th>{{ $t('admin.customer') }}</th>
                    <th>{{ $t('admin.items') }}</th>
                    <th>{{ $t('cart.total') }}</th>
                    <th>{{ $t('common.status') }}</th>
                    <th>{{ $t('common.date') }}</th>
                    <th>{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in orders" :key="order.id">
                    <td class="fw-bold">#{{ order.id }}</td>
                    <td>User {{ order.user_id }}</td>
                    <td>{{ order.items?.length || 0 }} {{ $t('admin.items') }}</td>
                    <td class="fw-bold">{{ formatPrice(order.total) }} {{ $t('common.afn') }}</td>
                    <td>
                      <select 
                        v-model="order.status" 
                        class="form-select form-select-sm" 
                        style="width: 140px;"
                        @change="updateOrderStatus(order)"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td class="text-muted small">{{ formatDate(order.created_at) }}</td>
                    <td>
                      <router-link :to="`/confirmation/${order.id}`" class="btn btn-outline-primary btn-sm" title="View Details">
                        <i class="bi bi-eye"></i>
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Categories Management -->
        <div v-if="activeTab === 'categories'" class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h2 class="h4 fw-bold mb-0">{{ $t('admin.categoriesManagement') }}</h2>
              <button class="btn btn-primary btn-sm" @click="openCategoryModal(null)">
                <i class="bi bi-plus-lg me-1"></i>{{ $t('admin.addCategory') }}
              </button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>{{ $t('common.id') }}</th>
                    <th>{{ $t('common.icon') }}</th>
                    <th>{{ $t('common.name') }}</th>
                    <th>{{ $t('common.description') }}</th>
                    <th>{{ $t('common.status') }}</th>
                    <th>{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="category in productsStore.categories" :key="category.id">
                    <td>{{ category.id }}</td>
                    <td><span class="fs-4">{{ category.icon }}</span></td>
                    <td class="fw-semibold">{{ languageStore.getLocalizedName(category) }}</td>
                    <td class="text-muted small">{{ languageStore.getLocalizedName(category, 'description') || 'N/A' }}</td>
                    <td>
                      <span :class="['badge rounded-pill', category.is_active ? 'bg-success' : 'bg-secondary']">
                        {{ category.is_active ? $t('common.active') : $t('common.inactive') }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" title="Edit" @click="openCategoryModal(category)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" title="Delete" @click="handleDeleteCategory(category.id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Users Management -->
        <div v-if="activeTab === 'users'" class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h2 class="h4 fw-bold mb-0">{{ $t('admin.usersManagement') }}</h2>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>{{ $t('common.id') }}</th>
                    <th>{{ $t('common.name') }}</th>
                    <th>{{ $t('common.email') }}</th>
                    <th>{{ $t('common.role') }}</th>
                    <th>{{ $t('common.joined') }}</th>
                    <th>{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td class="fw-semibold">{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <select 
                        v-model="user.role" 
                        class="form-select form-select-sm" 
                        style="width: 120px;"
                        @change="updateUserRole(user)"
                        :disabled="user.id === authStore.user?.id"
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td class="text-muted small">{{ formatDate(user.created_at) }}</td>
                    <td>
                      <span v-if="user.id === authStore.user?.id" class="badge bg-info">You</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Settings Management -->
        <div v-if="activeTab === 'settings'" class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <h2 class="h4 fw-bold mb-4">Currency Exchange Rates (Relative to AFN)</h2>
            <div class="row g-4">
              <div class="col-md-4" v-for="currency in currencyStore.currencies" :key="currency.code">
                <div class="card bg-light border-0">
                  <div class="card-body">
                    <label class="form-label fw-bold">{{ currency.code }} - {{ currency.name }}</label>
                    <div class="input-group">
                      <input 
                        type="number" 
                        v-model="tempRates[currency.code]" 
                        class="form-control" 
                        step="0.01"
                        :disabled="currency.code === 'AFN'"
                      >
                      <span class="input-group-text">AFN</span>
                    </div>
                    <small class="text-muted" v-if="currency.code !== 'AFN'">
                      1 {{ currency.code }} = {{ tempRates[currency.code] }} AFN
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <button class="btn btn-primary" @click="saveRates" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                Save Rates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ProductModal 
      ref="productModalRef"
      :product="selectedProduct"
      :categories="productsStore.categories"
      @save="handleSaveProduct"
    />

    <CategoryModal 
      ref="categoryModalRef"
      :category="selectedCategory"
      @save="handleSaveCategory"
    />

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import { useLanguageStore } from '@/stores/language'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import ProductModal from '@/components/admin/ProductModal.vue'
import CategoryModal from '@/components/admin/CategoryModal.vue'
import { useCurrencyStore } from '@/stores/currency'
import { settingsService } from '@/services/settingsService'
import api from '@/services/api'

const authStore = useAuthStore()
const productsStore = useProductsStore()
const languageStore = useLanguageStore()
const currencyStore = useCurrencyStore()
const { t } = useI18n()

const activeTab = ref('products')
const orders = ref([])
const users = ref([])
const loading = ref(false)
const productModalRef = ref(null)
const selectedProduct = ref(null)
const categoryModalRef = ref(null)
const selectedCategory = ref(null)
const tempRates = ref({})
const saving = ref(false)

const isAdmin = computed(() => {
  return authStore.isAdmin
})

const stats = computed(() => {
  return {
    totalProducts: productsStore.products.length,
    totalOrders: orders.value.length,
    totalUsers: users.value.length,
    totalRevenue: orders.value.reduce((sum, order) => sum + (Number(order.total) || 0), 0)
  }
})

onMounted(async () => {
  if (isAdmin.value) {
    await loadData()
    // Initialize temp rates
    tempRates.value = { ...currencyStore.rates }
  }
})

async function loadData() {
  loading.value = true
  try {
    if (productsStore.categories.length === 0) {
      await productsStore.fetchCategories()
    }
    await productsStore.fetchProducts()
    
    await productsStore.fetchProducts()
    
    // Fetch Orders from backend
    const ordersRes = await api.get('/orders')
    orders.value = ordersRes.data || []

    // Fetch Users from backend
    const usersRes = await api.get('/auth/users')
    users.value = usersRes.data || []

  } catch (error) {
    console.error('Failed to load admin data:', error)
  } finally {
    loading.value = false
  }
}

function openProductModal(product) {
  selectedProduct.value = product
  productModalRef.value.show()
}


// Helper for safe toast
function safeShowToast(message, type = 'success') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type)
  } else {
    console.warn('Toast not available:', message)
    // Fallback if needed, or just log
    if (type === 'error') alert(message)
  }
}

async function handleSaveProduct(productData) {
  loading.value = true
  try {
    if (productData.id) {
      await productsStore.updateProduct(productData.id, productData)
      safeShowToast(t('messages.productUpdated'), 'success')
    } else {
      await productsStore.createProduct(productData)
      safeShowToast(t('messages.productCreated'), 'success')
    }
  } catch (error) {
    console.error('Failed to save product:', error)
    safeShowToast('Failed to save product', 'error')
  } finally {
    loading.value = false
    if (productModalRef.value) {
      productModalRef.value.hide()
    }
  }
}

async function handleDeleteProduct(id) {
  if (!confirm(t('messages.confirmDelete') || 'Are you sure?')) return
  
  try {
    await productsStore.deleteProduct(id)
    safeShowToast(t('messages.productDeleted'), 'success')
  } catch (error) {
    console.error('Failed to delete product:', error)
    safeShowToast(t('messages.error'), 'error')
  }
}

async function updateOrderStatus(order) {
  try {
    await api.put(`/orders/${order.id}`, { status: order.status })
    safeShowToast(t('messages.statusUpdated'), 'success')
  } catch (error) {
    console.error('Failed to update status:', error)
    safeShowToast(t('messages.error'), 'error')
  }
}

function getCategoryName(categoryId) {
  const category = productsStore.categories.find(c => c.id === categoryId)
  return category ? languageStore.getLocalizedName(category) : categoryId
}

function formatPrice(price) {
  return Number(price)?.toLocaleString() || '0'
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function openCategoryModal(category) {
  selectedCategory.value = category
  categoryModalRef.value.show()
}

async function handleSaveCategory(categoryData) {
  try {
    if (categoryData.id) {
      await productsStore.updateCategory(categoryData.id, categoryData)
      safeShowToast(t('messages.categoryUpdated'), 'success')
    } else {
      await productsStore.createCategory(categoryData)
      safeShowToast(t('messages.categoryCreated'), 'success')
    }
  } catch (error) {
    console.error('Failed to save category:', error)
    safeShowToast('Failed to save category', 'error')
  } finally {
    if (categoryModalRef.value) {
      categoryModalRef.value.hide()
    }
  }
}

async function handleDeleteCategory(id) {
  if (!confirm(t('messages.confirmDelete') || 'Are you sure?')) return
  
  try {
    await productsStore.deleteCategory(id)
    safeShowToast(t('messages.categoryDeleted'), 'success')
  } catch (error) {
    console.error('Failed to delete category:', error)
    safeShowToast(t('messages.error'), 'error')
  }
}

async function updateUserRole(user) {
  try {
    await api.put(`/auth/users/${user.id}`, { role: user.role })
    safeShowToast(t('messages.roleUpdated'), 'success')
  } catch (error) {
    console.error('Failed to update user role:', error)
    safeShowToast(t('messages.error'), 'error')
  }
}

async function saveRates() {
  saving.value = true
  try {
    await settingsService.updateSettings('exchange_rates', tempRates.value)
    currencyStore.rates = { ...tempRates.value }
    safeShowToast('Exchange rates updated successfully', 'success')
  } catch (error) {
    console.error('Failed to save rates:', error)
    safeShowToast('Failed to save exchange rates', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Custom styles removed in favor of Bootstrap classes */
</style>
