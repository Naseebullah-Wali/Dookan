import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token') || null)
    const loading = ref(false)
    const error = ref(null)

    const isAuthenticated = computed(() => !!token.value)
    const isAdmin = computed(() => user.value?.role === 'admin')

    async function register(userData) {
        loading.value = true
        error.value = null
        try {
            const response = await authService.register(userData)
            user.value = response.user
            token.value = response.accessToken
            localStorage.setItem('token', token.value)
            localStorage.setItem('user', JSON.stringify(user.value))
            return true
        } catch (err) {
            error.value = err.message || 'Registration failed'
            return false
        } finally {
            loading.value = false
        }
    }

    async function login(email, password) {
        loading.value = true
        error.value = null
        try {
            const response = await authService.login(email, password)
            user.value = response.user
            token.value = response.accessToken
            localStorage.setItem('token', token.value)
            localStorage.setItem('user', JSON.stringify(user.value))
            return true
        } catch (err) {
            error.value = err.message || 'Login failed'
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

    async function fetchProfile() {
        if (!token.value) return false

        loading.value = true
        error.value = null
        try {
            const userData = await authService.getProfile()
            user.value = userData
            localStorage.setItem('user', JSON.stringify(user.value))
            return true
        } catch (err) {
            error.value = err.message || 'Failed to fetch profile'
            // If token is invalid, logout
            if (err.response?.status === 401) {
                logout()
            }
            return false
        } finally {
            loading.value = false
        }
    }

    async function updateProfile(data) {
        loading.value = true
        error.value = null
        try {
            const updatedUser = await authService.updateProfile(data)
            user.value = updatedUser
            localStorage.setItem('user', JSON.stringify(user.value))
            return true
        } catch (err) {
            error.value = err.message || 'Update failed'
            return false
        } finally {
            loading.value = false
        }
    }

    async function changePassword(currentPassword, newPassword) {
        loading.value = true
        error.value = null
        try {
            await authService.changePassword(currentPassword, newPassword)
            return true
        } catch (err) {
            error.value = err.message || 'Password change failed'
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
        isAdmin,
        register,
        login,
        logout,
        checkAuth,
        fetchProfile,
        updateProfile,
        changePassword
    }
})
