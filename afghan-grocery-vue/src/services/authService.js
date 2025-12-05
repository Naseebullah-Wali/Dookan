/**
 * Authentication Service - Supabase Implementation
 * Handles all authentication-related operations using Supabase Auth
 */
import { supabase, getUserProfile } from '../lib/supabase'

export const authService = {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @param {string} userData.email - User email
     * @param {string} userData.password - User password
     * @param {string} userData.name - User full name
     * @param {string} [userData.phone] - User phone number (optional)
     * @returns {Promise<Object>} User data and session
     */
    async register(userData) {
        const { email, password, name, phone } = userData

        try {
            // Create auth user with metadata
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        phone
                    },
                    emailRedirectTo: window.location.origin
                }
            })

            if (authError) {
                console.error('Registration auth error:', authError)
                throw authError
            }

            console.log('Registration successful:', {
                user: authData.user?.id,
                session: authData.session ? 'Session created' : 'No session (email confirmation required)',
                email: authData.user?.email
            })

            // Profile is created by database trigger
            // Wait longer and retry if needed
            if (authData.user) {
                // Wait for trigger to complete
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Try to fetch profile with retries
                let retries = 3
                let profile = null
                while (retries > 0 && !profile) {
                    try {
                        profile = await getUserProfile(authData.user.id)
                        if (profile) {
                            console.log('Profile found:', profile)
                            break
                        }
                    } catch (err) {
                        console.log(`Profile fetch attempt ${4 - retries} failed, retrying...`)
                    }
                    retries--
                    if (retries > 0) {
                        await new Promise(resolve => setTimeout(resolve, 500))
                    }
                }

                if (!profile) {
                    console.warn('Profile not found after retries, will be fetched on next login')
                }
            }

            return {
                user: authData.user,
                session: authData.session
            }
        } catch (error) {
            console.error('Registration failed:', error)
            throw error
        }
    },

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data and session
     */
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw error

        // Fetch profile
        const profile = await getUserProfile(data.user.id)

        return {
            user: data.user,
            session: data.session,
            profile
        }
    },

    /**
     * Get current session
     * @returns {Promise<Object|null>} Current session or null
     */
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
            console.error('Error getting session:', error)
            return null
        }

        console.log('getSession result:', {
            hasSession: !!session,
            userId: session?.user?.id
        })

        return session
    },

    /**
     * Logout user
     * @returns {Promise<void>}
     */
    async logout() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    /**
     * Get current user profile
     * @returns {Promise<Object>} User profile data
     */
    async getProfile() {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('Not authenticated')

        const profile = await getUserProfile(user.id)

        return {
            ...profile,
            email: user.email
        }
    },

    /**
     * Update user profile
     * @param {Object} data - Profile update data
     * @param {string} [data.name] - User name
     * @param {string} [data.phone] - User phone
     * @param {string} [data.avatar_url] - Avatar URL
     * @param {string} [data.language_preference] - Language preference
     * @returns {Promise<Object>} Updated user data
     */
    async updateProfile(data) {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('Not authenticated')

        // Update profile in database
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', user.id)
            .select()
            .single()

        if (profileError) throw profileError

        // Update email if provided
        if (data.email && data.email !== user.email) {
            const { error: emailError } = await supabase.auth.updateUser({
                email: data.email
            })
            if (emailError) throw emailError
        }

        return profile
    },

    /**
     * Change user password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Success response
     */
    async changePassword(currentPassword, newPassword) {
        // Supabase doesn't require current password for authenticated users
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (error) throw error

        return { message: 'Password updated successfully' }
    },

    /**
     * Get current session
     * @returns {Promise<Object>} Current session
     */
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        return session
    },

    /**
     * Listen to auth state changes
     * @param {Function} callback - Callback function
     * @returns {Object} Subscription object
     */
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback)
    }
}

export default authService
