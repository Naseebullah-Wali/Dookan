<template>
  <div class="admin-page bg-light min-vh-100">
    <AppHeader />
    
    <div class="container py-5">
      <div class="text-center mb-5">
        <h1 class="fw-bold mb-2">🔧 Admin Dashboard</h1>
        <p class="text-muted">Manage your store</p>
      </div>

      <div v-if="!authStore.isAuthenticated || !isAdmin" class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm text-center p-5">
            <div class="display-1 mb-4">🔒</div>
            <h2 class="mb-3">Admin Access Required</h2>
            <p class="text-muted mb-4">Please login with admin credentials</p>
            <router-link to="/login" class="btn btn-primary btn-lg px-5">Login</router-link>
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
              <div class="text-muted small text-uppercase fw-bold">Total Products</div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100 text-center p-4">
              <div class="display-4 mb-3">🛒</div>
              <div class="h2 fw-bold text-primary mb-1">{{ stats.totalOrders }}</div>
              <div class="text-muted small text-uppercase fw-bold">Total Orders</div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100 text-center p-4">
              <div class="display-4 mb-3">👥</div>
              <div class="h2 fw-bold text-primary mb-1">{{ stats.totalUsers }}</div>
              <div class="text-muted small text-uppercase fw-bold">Total Users</div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100 text-center p-4">
              <div class="display-4 mb-3">💰</div>
              <div class="h2 fw-bold text-primary mb-1">{{ formatPrice(stats.totalRevenue) }} AFN</div>
              <div class="text-muted small text-uppercase fw-bold">Total Revenue</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card border-0 shadow-sm mb-5">
          <div class="card-body p-4">
            <h2 class="h4 fw-bold mb-4">Quick Actions</h2>
            <div class="row g-3">
              <div class="col-md-6 col-lg-3">
                <button @click="activeTab = 'products'" class="btn btn-outline-primary w-100 py-4 h-100 d-flex flex-column align-items-center justify-content-center gap-2" :class="{ active: activeTab === 'products' }">
                  <span class="fs-4">📦</span>
                  <span class="fw-bold">Manage Products</span>
                </button>
              </div>
              <div class="col-md-6 col-lg-3">
                <button @click="activeTab = 'orders'" class="btn btn-outline-primary w-100 py-4 h-100 d-flex flex-column align-items-center justify-content-center gap-2" :class="{ active: activeTab === 'orders' }">
                  <span class="fs-4">🛒</span>
                  <span class="fw-bold">View Orders</span>
                </button>
              </div>
              <div class="col-md-6 col-lg-3">
                <button @click="activeTab = 'users'" class="btn btn-outline-primary w-100 py-4 h-100 d-flex flex-column align-items-center justify-content-center gap-2" :class="{ active: activeTab === 'users' }">
                  <span class="fs-4">👥</span>
                  <span class="fw-bold">Manage Users</span>
                </button>
              </div>
              <div class="col-md-6 col-lg-3">
                <button class="btn btn-outline-primary w-100 py-4 h-100 d-flex flex-column align-items-center justify-content-center gap-2">
                  <span class="fs-4">📊</span>
                  <span class="fw-bold">View Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Management -->
        <div v-if="activeTab === 'products'" class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h2 class="h4 fw-bold mb-0">Products Management</h2>
              <button class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-1"></i>Add Product</button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in products.slice(0, 10)" :key="product.id">
                    <td>{{ product.id }}</td>
                    <td class="fw-semibold">{{ product.name }}</td>
                    <td><span class="badge bg-light text-dark border">{{ product.category }}</span></td>
                    <td>{{ formatPrice(product.price) }} AFN</td>
                    <td>{{ product.stock }}</td>
                    <td>
                      <span :class="['badge rounded-pill', product.stock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger']">
                        {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" title="Edit"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-outline-danger" title="Delete"><i class="bi bi-trash"></i></button>
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
              <h2 class="h4 fw-bold mb-0">Orders Management</h2>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in orders" :key="order.id">
                    <td class="fw-bold">#{{ order.id }}</td>
                    <td>User {{ order.userId }}</td>
                    <td>{{ order.items.length }} items</td>
                    <td class="fw-bold">{{ formatPrice(order.total) }} AFN</td>
                    <td>
                      <select v-model="order.status" class="form-select form-select-sm" style="width: 140px;">
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td class="text-muted small">{{ formatDate(order.createdAt) }}</td>
                    <td>
                      <button class="btn btn-outline-primary btn-sm" title="View Details"><i class="bi bi-eye"></i></button>
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
              <h2 class="h4 fw-bold mb-0">Users Management</h2>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Orders</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td class="fw-semibold">{{ user.firstName }} {{ user.lastName }}</td>
                    <td>{{ user.email }}</td>
                    <td class="text-muted small">{{ formatDate(user.createdAt) }}</td>
                    <td><span class="badge bg-secondary rounded-pill">{{ getUserOrderCount(user.id) }}</span></td>
                    <td>
                      <button class="btn btn-outline-primary btn-sm" title="View Profile"><i class="bi bi-eye"></i></button>
                    </td>
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

const authStore = useAuthStore()

const activeTab = ref('products')
const products = ref([])
const orders = ref([])
const users = ref([])

const isAdmin = computed(() => {
  return authStore.user?.email === 'demo@afghangrocery.com' || authStore.user?.role === 'admin'
})

const stats = computed(() => {
  return {
    totalProducts: products.value.length,
    totalOrders: orders.value.length,
    totalUsers: users.value.length,
    totalRevenue: orders.value.reduce((sum, order) => sum + order.total, 0)
  }
})

onMounted(async () => {
  if (isAdmin.value) {
    await loadData()
  }
})

async function loadData() {
  try {
    const [productsRes, ordersRes, usersRes] = await Promise.all([
      api.get('/products'),
      api.get('/orders'),
      api.get('/users')
    ])
    
    products.value = productsRes.data
    orders.value = ordersRes.data
    users.value = usersRes.data
  } catch (error) {
    console.error('Failed to load admin data:', error)
  }
}

function getUserOrderCount(userId) {
  return orders.value.filter(o => o.userId === userId).length
}

function formatPrice(price) {
  return price?.toLocaleString() || '0'
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
/* Custom styles removed in favor of Bootstrap classes */
</style>
