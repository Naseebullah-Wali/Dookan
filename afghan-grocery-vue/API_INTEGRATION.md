# API Integration Guide

## Overview
This frontend is now connected to the professional Express.js backend API. All API calls are centralized in the `src/services` directory for easy maintenance.

## Backend URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: Update `VITE_API_URL` in `.env`

## Service Architecture

### Centralized Services
All API calls are organized into dedicated service modules:

```javascript
// Import services
import { authService, productService, categoryService, orderService } from '@/services'
```

### Available Services

#### 1. Auth Service (`authService.js`)
```javascript
// Register
await authService.register({ email, password, name, phone })

// Login
await authService.login(email, password)

// Get Profile
await authService.getProfile()

// Update Profile
await authService.updateProfile({ name, email, phone })

// Change Password
await authService.changePassword(currentPassword, newPassword)
```

#### 2. Product Service (`productService.js`)
```javascript
// Get all products with filters
await productService.getAll({
    category: 1,
    search: 'rice',
    minPrice: 10,
    maxPrice: 100,
    featured: true,
    page: 1,
    limit: 20
})

// Get featured products
await productService.getFeatured(8)

// Get product by ID
await productService.getById(1)

// Admin: Create product
await productService.create(productData)

// Admin: Update product
await productService.update(id, productData)

// Admin: Delete product
await productService.delete(id)
```

#### 3. Category Service (`categoryService.js`)
```javascript
// Get all categories
await categoryService.getAll(true) // activeOnly

// Get categories with product counts
await categoryService.getWithCounts()

// Get category by ID
await categoryService.getById(1)

// Admin: Create/Update/Delete
await categoryService.create(data)
await categoryService.update(id, data)
await categoryService.delete(id)
```

#### 4. Order Service (`orderService.js`)
```javascript
// Create order
await orderService.create({
    address_id: 1,
    payment_method: 'cod',
    items: [
        {
            product_id: 1,
            product_name: 'Product Name',
            product_image: '/image.jpg',
            quantity: 2,
            price: 25.99
        }
    ],
    subtotal: 51.98,
    shipping_fee: 5.00,
    tax: 0,
    discount: 0,
    notes: 'Please deliver in the morning'
})

// Get my orders
await orderService.getMyOrders({ page: 1, limit: 20 })

// Get order by ID
await orderService.getById(orderId)

// Admin: Get all orders
await orderService.getAll({
    status: 'pending',
    payment_status: 'paid',
    page: 1,
    limit: 20
})

// Admin: Update order status
await orderService.updateStatus(orderId, {
    status: 'shipped',
    tracking_number: 'TRK-123456'
})
```

## Stores Integration

### Auth Store
```javascript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Register
await authStore.register({ email, password, name, phone })

// Login
await authStore.login(email, password)

// Logout
authStore.logout()

// Check if authenticated
authStore.isAuthenticated

// Check if admin
authStore.isAdmin

// Get current user
authStore.user

// Update profile
await authStore.updateProfile({ name, phone })

// Change password
await authStore.changePassword(currentPassword, newPassword)
```

### Products Store
```javascript
import { useProductsStore } from '@/stores/products'

const productsStore = useProductsStore()

// Fetch products
await productsStore.fetchProducts({ category: 1, search: 'rice' })

// Fetch featured products
await productsStore.fetchFeaturedProducts(8)

// Fetch product by ID
await productsStore.fetchProductById(1)

// Fetch categories
await productsStore.fetchCategories()

// Fetch categories with counts
await productsStore.fetchCategoriesWithCounts()

// Search products
await productsStore.searchProducts('rice', { category: 1 })

// Access data
productsStore.products
productsStore.categories
productsStore.featuredProducts
productsStore.pagination
```

### Orders Store
```javascript
import { useOrdersStore } from '@/stores/orders'

const ordersStore = useOrdersStore()

// Create order
await ordersStore.createOrder(orderData)

// Fetch my orders
await ordersStore.fetchMyOrders({ page: 1 })

// Fetch order by ID
await ordersStore.fetchOrderById(orderId)

// Admin: Fetch all orders
await ordersStore.fetchAllOrders({ status: 'pending' })

// Admin: Update order status
await ordersStore.updateOrderStatus(orderId, { status: 'shipped' })

// Access data
ordersStore.orders
ordersStore.currentOrder
ordersStore.pagination
```

## Response Format

All backend responses follow this format:

### Success Response
```json
{
    "success": true,
    "data": { ... },
    "message": "Operation successful"
}
```

### Paginated Response
```json
{
    "success": true,
    "data": [ ... ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100,
        "totalPages": 5
    }
}
```

### Error Response
```json
{
    "success": false,
    "error": "Error message"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login/Register** returns `accessToken` and `refreshToken`
2. **Token Storage**: Stored in localStorage
3. **Auto-Injection**: Token automatically added to all requests via axios interceptor
4. **Auto-Logout**: Automatically logs out on 401 (Unauthorized) responses

## Error Handling

All services include comprehensive error handling:

```javascript
try {
    const products = await productService.getAll()
} catch (error) {
    console.error(error.message) // User-friendly error message
}
```

## Making Changes

### To Add a New Endpoint:

1. **Add to Service** (`src/services/[resource]Service.js`):
```javascript
async newEndpoint(params) {
    const response = await api.get('/new-endpoint', { params })
    return response.data
}
```

2. **Add to Store** (if needed):
```javascript
async fetchNewData() {
    const data = await resourceService.newEndpoint()
    this.newData = data
    return data
}
```

3. **Use in Component**:
```javascript
const store = useResourceStore()
await store.fetchNewData()
```

### To Update an Endpoint:

Simply modify the service method - all components using it will automatically use the updated version!

## Security Features

✅ JWT Authentication
✅ Automatic token injection
✅ Auto-logout on unauthorized access
✅ CORS configured
✅ Rate limiting (backend)
✅ Input validation (backend)
✅ SQL injection protection (backend)
✅ Password hashing (backend)

## Default Credentials

For testing:
- **Admin**: admin@afghangrocery.com / admin123
- **Customer**: customer@test.com / customer123

## Troubleshooting

### Backend not responding
1. Check if backend is running: `npm run dev` in backend directory
2. Verify backend URL in `.env`: `VITE_API_URL=http://localhost:3000`
3. Check browser console for CORS errors

### Authentication issues
1. Clear localStorage: `localStorage.clear()`
2. Check token in Application tab (DevTools)
3. Verify backend JWT_SECRET is set

### API errors
1. Check browser Network tab for request/response
2. Verify request format matches backend expectations
3. Check backend console for errors

## Next Steps

1. ✅ Backend API is running
2. ✅ Services are configured
3. ✅ Stores are updated
4. 🔄 Update components to use new stores
5. 🔄 Test all functionality
6. 🔄 Deploy to production
