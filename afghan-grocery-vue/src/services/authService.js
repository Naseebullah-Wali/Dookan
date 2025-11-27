/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
import api from './api'

export const authService = {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @param {string} userData.email - User email
     * @param {string} userData.password - User password
     * @param {string} userData.name - User full name
     * @param {string} [userData.phone] - User phone number (optional)
     * @returns {Promise<Object>} User data and tokens
     */
    async register(userData) {
        const response = await api.post('/auth/register', userData)
        return response.data
    },

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data and tokens
     */
    async login(email, password) {
        const response = await api.post('/auth/login', { email, password })
        return response.data
    },

    /**
     * Get current user profile
     * @returns {Promise<Object>} User profile data
     */
    async getProfile() {
        const response = await api.get('/auth/profile')
        return response.data
    },

    /**
     * Update user profile
     * @param {Object} data - Profile update data
     * @param {string} [data.name] - User name
     * @param {string} [data.email] - User email
     * @param {string} [data.phone] - User phone
     * @returns {Promise<Object>} Updated user data
     */
    async updateProfile(data) {
        const response = await api.put('/auth/profile', data)
        return response.data
    },

    /**
     * Change user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Success response
     */
    async changePassword(currentPassword, newPassword) {
        const response = await api.post('/auth/change-password', {
            currentPassword,
            newPassword
        })
        return response.data
    }
}

export default authService
