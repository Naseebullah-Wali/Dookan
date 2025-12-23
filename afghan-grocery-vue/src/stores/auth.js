import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const profile = ref(null)
    const session = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const initialized = ref(false)

    const isAuthenticated = computed(() => !!session.value)
    const isAdmin = computed(() => profile.value?.role === 'admin')

    // Initialize auth state from Supabase
    async function initialize() {
        if (initialized.value) return

        loading.value = true
        try {
            // Get initial session
            const { data: { session: initialSession } } = await supabase.auth.getSession()

            if (initialSession) {
                session.value = initialSession
                user.value = initialSession.user
                await fetchProfile()
            }
        } catch (err) {
        } finally {
            loading.value = false
            initialized.value = true
        }

        // Listen to auth changes
        authService.onAuthStateChange(async (event, newSession) => {
            if (newSession) {
                session.value = newSession
                user.value = newSession.user
                await fetchProfile()
            } else {
                session.value = null
                user.value = null
                profile.value = null
            }
        })
    }

    async function register(userData) {
        loading.value = true
        error.value = null
        try {
            const response = await authService.register(userData)

            user.value = response.user
            session.value = response.session

            // Fetch profile after registration
            if (user.value && response.session) {
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

            // Ensure auth user object mirrors profile fields used in UI
            if (user.value) {
                // Supabase auth user may not include profile.name or phone
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
