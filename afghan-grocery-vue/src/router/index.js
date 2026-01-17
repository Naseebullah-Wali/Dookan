import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAnalytics } from '@/composables/useAnalytics'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/HomePage.vue'),
        meta: { title: 'Home - Afghan Grocery' }
    },
    {
        path: '/shop',
        name: 'Shop',
        component: () => import('@/views/ShopPage.vue'),
        meta: { title: 'Shop - Afghan Grocery' }
    },
    {
        path: '/product/:id',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetailPage.vue'),
        meta: { title: 'Product - Afghan Grocery' }
    },
    {
        path: '/cart',
        name: 'Cart',
        component: () => import('@/views/CartPage.vue'),
        meta: { title: 'Shopping Cart - Afghan Grocery' }
    },
    {
        path: '/checkout',
        name: 'Checkout',
        component: () => import('@/views/CheckoutPage.vue'),
        meta: { title: 'Checkout - Afghan Grocery', requiresAuth: true }
    },
    {
        path: '/confirmation/:orderId?',
        name: 'OrderConfirmation',
        component: () => import('@/views/OrderConfirmationPage.vue'),
        meta: { title: 'Order Confirmed - Afghan Grocery' }
    },
    {
        path: '/tracking',
        name: 'Tracking',
        component: () => import('@/views/TrackingPage.vue'),
        meta: { title: 'Track Order - Afghan Grocery' }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/ProfilePage.vue'),
        meta: { title: 'My Profile - Afghan Grocery', requiresAuth: true }
    },
    {
        path: '/orders',
        name: 'OrderHistory',
        component: () => import('@/views/OrderHistoryPage.vue'),
        meta: { title: 'Order History - Afghan Grocery', requiresAuth: true }
    },
    {
        path: '/wishlist',
        name: 'Wishlist',
        component: () => import('@/views/WishlistPage.vue'),
        meta: { title: 'My Wishlist - Afghan Grocery', requiresAuth: true }
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('@/views/AboutPage.vue'),
        meta: { title: 'About Us - Afghan Grocery' }
    },
    {
        path: '/contact',
        name: 'Contact',
        component: () => import('@/views/ContactPage.vue'),
        meta: { title: 'Contact Us - Afghan Grocery' }
    },
    {
        path: '/inquiry',
        name: 'Inquiry',
        component: () => import('@/views/InquiryPage.vue'),
        meta: { title: 'Inquiry - Afghan Grocery' }
    },

    {
        path: '/referral',
        name: 'Referral',
        component: () => import('@/views/ReferralPage.vue'),
        meta: { title: 'Referral Program - Afghan Grocery', requiresAuth: true }
    },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('@/views/AdminPage.vue'),
        meta: { title: 'Admin Dashboard - Afghan Grocery', requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginPage.vue'),
        meta: { title: 'Login - Afghan Grocery', guestOnly: true }
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/views/ForgotPasswordPage.vue'),
        meta: { title: 'Forgot Password - Afghan Grocery', guestOnly: true }
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('@/pages/ResetPasswordPage.vue'),
        meta: { title: 'Reset Password - Afghan Grocery', guestOnly: true }
    },
    // OAuth callback from Supabase - main route
    {
        path: '/auth/callback',
        name: 'AuthCallback',
        component: () => import('@/views/OAuthCallback.vue'),
        meta: { title: 'Authenticating...' }
    },
    // OAuth callback alternative route (for backwards compatibility)
    {
        path: '/auth/oauth/callback',
        name: 'OAuthCallback',
        component: () => import('@/views/OAuthCallback.vue'),
        meta: { title: 'Authenticating...' }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/RegisterPage.vue'),
        meta: { title: 'Register - Afghan Grocery', guestOnly: true }
    },
    {
        path: '/verify-email',
        name: 'VerifyEmail',
        component: () => import('@/views/VerifyEmailPage.vue'),
        meta: { title: 'Verify Email - Afghan Grocery', guestOnly: true }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFoundPage.vue'),
        meta: { title: '404 - Page Not Found' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Ensure auth is initialized before any route check
    if (!authStore.initialized) {
        await authStore.initialize()
    }

    // Update page title
    document.title = to.meta.title || 'Afghan Grocery'

    // Check if route requires authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'Login', query: { redirect: to.fullPath } })
    }
    // Redirect authenticated users away from guest-only pages
    else if (to.meta.guestOnly && authStore.isAuthenticated) {
        next({ name: 'Home' })
    }
    else {
        next()
    }
})

// Track page views
router.afterEach((to) => {
    const { trackPageView } = useAnalytics()
    trackPageView(to.meta.title || 'Afghan Grocery', to.fullPath)
})

export default router
