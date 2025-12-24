import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const profile = ref(null)
    const session = ref(null)
    const token = ref(localStorage.getItem('accessToken') || null)
    const loading = ref(false)
    const error = ref(null)
    const initialized = ref(false)

    const isAuthenticated = computed(() => !!token.value)
    const isAdmin = computed(() => profile.value?.role === 'admin')

    // Initialize auth state from Supabase
    async function initialize() {
        if (initialized.value) return

        loading.value = true
        try {
            // First check if we have localStorage tokens
            const s = await authService.getSession()
            if (s && s.accessToken) {
                token.value = s.accessToken
                // attempt to fetch profile
                await fetchProfile()
            } else {
                // No localStorage token; check if we're authenticated via cookies (e.g., after OAuth)
                const currentUser = await authService.getCurrentUser()
                if (currentUser) {
                    // User is authenticated via cookies; set a flag so we know auth is valid
                    // (we won't store the httpOnly cookie in localStorage, but we know we're logged in)
                    user.value = currentUser
                    profile.value = currentUser
                    token.value = 'cookie-authenticated' // placeholder to indicate cookie-auth
                }
            }
        } catch (err) {
            // ignore
        } finally {
            loading.value = false
            initialized.value = true
        }
    }

    async function register(userData) {
        loading.value = true
        error.value = null
        try {
            const response = await authService.register(userData)

            user.value = response.user
            session.value = response.session
            token.value = response.session?.accessToken || null
            if (token.value) {
                localStorage.setItem('accessToken', token.value)
                if (response.session.refreshToken) localStorage.setItem('refreshToken', response.session.refreshToken)
            }

            if (user.value) {
                await fetchProfile()
            }
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
            session.value = response.session
            token.value = response.session?.accessToken || null
            if (token.value) {
                localStorage.setItem('accessToken', token.value)
                if (response.session.refreshToken) localStorage.setItem('refreshToken', response.session.refreshToken)
            }

            profile.value = response.profile
            return true
        } catch (err) {
            error.value = err.message || 'Login failed'
            return false
        } finally {
            loading.value = false
        }
    }

    async function logout() {
        loading.value = true
        error.value = null
        try {
            await authService.logout()
            user.value = null
            session.value = null
            profile.value = null
            token.value = null
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            return true
        } catch (err) {
            error.value = err.message || 'Logout failed'
            return false
        } finally {
            loading.value = false
        }
    }

    async function fetchProfile() {
        if (!user.value) {
            return false
        }

        loading.value = true
        error.value = null
        try {
            const userData = await authService.getProfile()
            profile.value = userData

            if (user.value) {
                if (userData.name) user.value.name = userData.name
                if (userData.phone) user.value.phone = userData.phone
            }
            return true
        } catch (err) {
            error.value = err.message || 'Failed to fetch profile'
            return false
        } finally {
            loading.value = false
        }
    }

    async function updateProfile(data) {
        loading.value = true
        error.value = null
        try {
            const updatedProfile = await authService.updateProfile(data)
            profile.value = updatedProfile
            
            // Also update user object so name change is reflected
            if (user.value) {
                user.value.name = data.name
                if (data.phone) {
                    user.value.phone = data.phone
                }
            }
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

    async function signInWithGoogle(redirectTo) {
        loading.value = true
        error.value = null
        try {
            await authService.signInWithGoogle({
                redirectTo: redirectTo || `${window.location.origin}/`
            })
            return true
        } catch (err) {
            error.value = err.message || 'Google sign-in failed'
            return false
        } finally {
            loading.value = false
        }
    }

    async function signUpWithGoogle(redirectTo) {
        loading.value = true
        error.value = null
        try {
            await authService.signUpWithGoogle({
                redirectTo: redirectTo || `${window.location.origin}/`
            })
            return true
        } catch (err) {
            error.value = err.message || 'Google sign-up failed'
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        user,
        profile,
        session,
        loading,
        error,
        initialized,
        isAuthenticated,
        isAdmin,
            token,
        initialize,
        register,
        login,
        logout,
        fetchProfile,
        updateProfile,
        changePassword,
        signInWithGoogle,
        signUpWithGoogle
    }
})
