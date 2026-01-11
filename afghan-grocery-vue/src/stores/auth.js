import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const profile = ref(null)
    const session = ref(null)
    // Don't load token from localStorage anymore - use httpOnly cookies
    const token = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const initialized = ref(false)
    const pendingVerificationEmail = ref(null)

    const isAuthenticated = computed(() => !!token.value)
    const isAdmin = computed(() => profile.value?.role === 'admin')

    async function initialize() {
        if (initialized.value) return

        loading.value = true
        try {
            const s = await authService.getSession()
            if (s && s.accessToken) {
                token.value = s.accessToken
                await fetchProfile()
            } else {
                const currentUser = await authService.getCurrentUser()
                if (currentUser) {
                    user.value = currentUser
                    profile.value = currentUser
                    token.value = 'cookie-authenticated'
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
            
            // If email verification is required, don't set user as logged in
            if (response.requireEmailVerification) {
                // Store email for resend functionality
                pendingVerificationEmail.value = userData.email
                return {
                    success: true,
                    requireEmailVerification: true,
                    message: response.message
                }
            }
            
            // For OAuth or other flows that don't require verification
            user.value = response.user
            session.value = response.session
            token.value = 'cookie-authenticated'

            if (user.value) {
                await fetchProfile()
            }
            return { success: true, requireEmailVerification: false }
        } catch (err) {
            error.value = err.message || 'Registration failed'
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function resendVerificationEmail() {
        if (!pendingVerificationEmail.value) {
            error.value = 'No pending verification email'
            return false
        }
        loading.value = true
        error.value = null
        try {
            await authService.resendVerificationEmail(pendingVerificationEmail.value)
            return true
        } catch (err) {
            error.value = err.message || 'Failed to resend verification email'
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
            token.value = 'cookie-authenticated'
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
            return true
        } catch (err) {
            error.value = err.message || 'Logout failed'
            return false
        } finally {
            loading.value = false
        }
    }

    async function fetchProfile() {
        if (!user.value) return false

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

    async function verifyOTP(email, code, language = 'en') {
        loading.value = true
        error.value = null
        try {
            const response = await authService.verifyOTP(email, code, language)
            
            if (response.verified) {
                // Auto-login after verification
                user.value = response.user
                profile.value = response.user
                token.value = 'cookie-authenticated'
                pendingVerificationEmail.value = null
                return { success: true }
            }
            
            return { success: false, error: response.error || 'Verification failed' }
        } catch (err) {
            error.value = err.message || 'Verification failed'
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    async function resendOTP(email, language = 'en') {
        loading.value = true
        error.value = null
        try {
            const response = await authService.resendOTP(email, language)
            return { 
                success: response.sent, 
                cooldownSeconds: response.cooldownSeconds || 60 
            }
        } catch (err) {
            error.value = err.message || 'Failed to resend code'
            return { success: false, error: err.message }
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
        pendingVerificationEmail,
        initialize,
        register,
        login,
        logout,
        fetchProfile,
        updateProfile,
        changePassword,
        verifyOTP,
        resendOTP,
        signInWithGoogle,
        signUpWithGoogle,
    }
})
