import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token') || null)
    const loading = ref(false)
    const error = ref(null)

    const isAuthenticated = computed(() => !!token.value)

    async function register(userData) {
        loading.value = true
        error.value = null
        try {
            const response = await api.post('/register', userData)
            user.value = response.data.user
            token.value = response.data.accessToken
            localStorage.setItem('token', token.value)
            localStorage.setItem('user', JSON.stringify(user.value))
            return true
        } catch (err) {
            error.value = err.response?.data?.message || 'Registration failed'
            return false
        } finally {
            loading.value = false
        }
    }

    async function login(email, password) {
        loading.value = true
        error.value = null
        try {
            const response = await api.post('/login', { email, password })
            user.value = response.data.user
            token.value = response.data.accessToken
            localStorage.setItem('token', token.value)
            localStorage.setItem('user', JSON.stringify(user.value))
            return true
        } catch (err) {
            error.value = err.response?.data || 'Login failed'
            return false
        } finally {
            loading.value = false
        }
    }

    function logout() {
        user.value = null
        token.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    function checkAuth() {
        const savedUser = localStorage.getItem('user')
        const savedToken = localStorage.getItem('token')
        if (savedUser && savedToken) {
            user.value = JSON.parse(savedUser)
            token.value = savedToken
        }
    }

    async function updateProfile(data) {
        loading.value = true
        error.value = null
        try {
            const response = await api.patch(`/users/${user.value.id}`, data)
            user.value = response.data
            localStorage.setItem('user', JSON.stringify(user.value))
            return true
        } catch (err) {
            error.value = err.response?.data?.message || 'Update failed'
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        register,
        login,
        logout,
        checkAuth,
        updateProfile
    }
})
