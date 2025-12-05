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

    const isAuthenticated = computed(() => !!session.value)
    const isAdmin = computed(() => profile.value?.role === 'admin')

    // Initialize auth state from Supabase
    async function initialize() {
        console.log('🔄 Initializing auth store...')
        loading.value = true
        try {
            const currentSession = await authService.getSession()
            console.log('Session from Supabase:', {
                hasSession: !!currentSession,
                session: currentSession
            })

            if (currentSession) {
                session.value = currentSession
                user.value = currentSession.user
                console.log('✅ Session loaded, fetching profile...')
                await fetchProfile()
                console.log('✅ Auth initialized:', {
                    isAuthenticated: !!session.value,
                    userName: profile.value?.name
                })
            } else {
                console.log('❌ No session found')
            }
        } catch (err) {
            console.error('Auth initialization error:', err)
        } finally {
            loading.value = false
        }

        // Listen to auth changes
        authService.onAuthStateChange(async (event, newSession) => {
            console.log('🔔 Auth state changed:', {
                event,
                hasSession: !!newSession,
                userId: newSession?.user?.id,
                timestamp: new Date().toISOString()
            })

            session.value = newSession
            user.value = newSession?.user || null

            if (newSession?.user) {
                await fetchProfile()
            } else {
                profile.value = null
            }
        })
    }

    async function register(userData) {
        loading.value = true
        error.value = null
        try {
            const response = await authService.register(userData)

            console.log('Auth store - Registration response:', {
                hasUser: !!response.user,
                hasSession: !!response.session,
                userId: response.user?.id,
                userEmail: response.user?.email
            })

            user.value = response.user
            session.value = response.session

            // Fetch profile after registration
            if (user.value && response.session) {
                console.log('Fetching profile for user:', user.value.id)
                await fetchProfile()
                console.log('Profile fetched:', profile.value)
                console.log('✅ Profile loaded successfully')

                // Manually persist session to localStorage to avoid setSession hang
                // Key format: sb-<project-ref>-auth-token
                const projectRef = 'vmkicfgzgwdfpdnisarn' // From previous logs
                const storageKey = `sb-${projectRef}-auth-token`

                try {
                    console.log('💾 Manually persisting session to localStorage...')
                    localStorage.setItem(storageKey, JSON.stringify(response.session))
                    console.log('✅ Session manually persisted to', storageKey)

                    // Also notify Supabase client if possible, but manual storage should be enough
                    // for the next page load to pick it up
                } catch (e) {
                    console.error('❌ Failed to manually persist session:', e)
                }
            } else {
                console.warn('No session created - email confirmation may be required')
            }

            return true
        } catch (err) {
            console.error('Registration error in store:', err)
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
            return true
        } catch (err) {
            console.error('Error fetching profile:', err)
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
        profile,
        session,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        initialize,
        register,
        login,
        logout,
        fetchProfile,
        updateProfile,
        changePassword
    }
})
