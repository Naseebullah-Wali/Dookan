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

// Get CSRF token from cookie or backend
let csrfToken = null

const getCsrfTokenFromCookie = () => {
    const name = 'XSRF-TOKEN'
    const nameEQ = name + '='
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim()
        if (cookie.indexOf(nameEQ) === 0) {
            const token = decodeURIComponent(cookie.substring(nameEQ.length))
            console.log('✅ Found XSRF-TOKEN in cookie:', token.substring(0, 20) + '...')
            return token
        }
    }
    console.log('❌ XSRF-TOKEN not found in cookies')
    return null
}

const fetchCsrfToken = async () => {
    try {
        // First try to get from cookie
        const cookieToken = getCsrfTokenFromCookie()
        if (cookieToken) {
            csrfToken = cookieToken
            return csrfToken
        }

        // If not in cookie, fetch from backend
        if (!csrfToken) {
            console.log('📡 Fetching CSRF token from backend...')
            const response = await axios.get(`${API_BASE_URL}/api/${API_VERSION}/csrf-token`, {
                withCredentials: true
            })
            csrfToken = response.data.csrfToken
            console.log('✅ Got CSRF token from backend:', csrfToken?.substring(0, 20) + '...')
            
            // Check if cookie was set after this request
            const cookieAfterFetch = getCsrfTokenFromCookie()
            if (cookieAfterFetch) {
                console.log('✅ XSRF-TOKEN cookie set after fetch')
            } else {
                console.warn('⚠️ XSRF-TOKEN cookie NOT set after fetch')
            }
        }
        return csrfToken
    } catch (error) {
        console.warn('Failed to fetch CSRF token:', error)
        return null
    }
}

// Request interceptor - add auth token and CSRF token
api.interceptors.request.use(
    async (config) => {
        const authStore = useAuthStore()
        
        // Only add Bearer token if it's a real token (not the cookie-auth placeholder)
        if (authStore.token && authStore.token !== 'cookie-authenticated') {
            config.headers.Authorization = `Bearer ${authStore.token}`
        }

        // Add CSRF token for non-GET requests
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase())) {
            const token = await fetchCsrfToken()
            if (token) {
                config.headers['X-CSRF-Token'] = token
                console.log('✅ Added X-CSRF-Token header for', config.method, config.url)
            } else {
                console.warn('⚠️ No CSRF token available for', config.method, config.url)
            }
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
