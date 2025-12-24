import api from './api'

export const authService = {
    async register(userData) {
        const res = await api.post('/auth/register', userData)
        // backend returns { user, accessToken, refreshToken }
        const data = res.data || {}
        return {
            user: data.user || null,
            session: {
                accessToken: data.accessToken || null,
                refreshToken: data.refreshToken || null
            }
        }
    },

    async login(email, password) {
        const res = await api.post('/auth/login', { email, password })
        const data = res.data || {}
        return {
            user: data.user || null,
            session: {
                accessToken: data.accessToken || null,
                refreshToken: data.refreshToken || null
            },
            profile: data.user || null
        }
    },

    async getSession() {
        // Tokens are stored in localStorage by the auth store; return them
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        if (!accessToken) return null
        return { accessToken, refreshToken }
    },

    async getCurrentUser() {
        // Check if user is authenticated via cookies (called after OAuth redirect)
        try {
            const res = await api.get('/auth/me')
            return res.data || null
        } catch (err) {
            // Not authenticated or error
            return null
        }
    },

    async logout() {
        // Call backend logout endpoint to clear httpOnly cookies
        try {
            await api.post('/auth/logout')
        } catch (err) {
            // Ignore errors; proceed with client-side logout
        }
        // Clear tokens client-side
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        return true
    },

    async getProfile() {
        const res = await api.get('/auth/profile')
        return res.data || null
    },

    async updateProfile(data) {
        const res = await api.put('/auth/profile', data)
        return res.data || null
    },

    async changePassword(currentPassword, newPassword) {
        const res = await api.post('/auth/change-password', { currentPassword, newPassword })
        return res.data || null
    },

    onAuthStateChange() {
        // Not supported client-side when using backend sessions; frontend can observe storage changes
        return null
    },

    async signInWithGoogle() {
        // Start backend OAuth flow by redirecting to the backend start endpoint
        // Ensure the URL includes the API version (defaults to /api/v1)
        const rawApi = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
        let apiBase = '';
        if (rawApi) {
            const trimmed = rawApi.replace(/\/$/, '');
            if (trimmed.includes('/api/')) apiBase = trimmed;
            else apiBase = `${trimmed}/api/v1`;
        } else {
            apiBase = '/api/v1';
        }

        window.location.href = `${apiBase}/auth/oauth/google`;
    },

    async signUpWithGoogle() {
        // Alias to signInWithGoogle; backend handles user creation if needed
        return this.signInWithGoogle();
    }
}
