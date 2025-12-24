import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// API Configuration
// Priority: Environment Variable > Local Development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_VERSION = 'v1'

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Send cookies with every request
})

// Request interceptor - add auth token (but not for cookie-authenticated users)
api.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore()
        // Only add Bearer token if it's a real token (not the cookie-auth placeholder)
        if (authStore.token && authStore.token !== 'cookie-authenticated') {
            config.headers.Authorization = `Bearer ${authStore.token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - handle errors and extract data
api.interceptors.response.use(
    (response) => {
        // Extract data from the standardized response format
        // Backend returns: { success: true, data: {...}, message: "..." }
        return response.data.data !== undefined ? { ...response, data: response.data.data } : response
    },
    (error) => {
        if (error.response?.status === 401) {
            const authStore = useAuthStore()
            // DISABLED: This causes Supabase session to be cleared when legacy API calls fail
            // authStore.logout()
            console.warn('Legacy API 401 Unauthorized - ignoring auto-logout')
        }

        // Extract error message from backend response
        const errorMessage = error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            'An error occurred'

        return Promise.reject({
            ...error,
            message: errorMessage
        })
    }
)

export default api
