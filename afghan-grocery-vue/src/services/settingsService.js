import api from './api'

export const settingsService = {
    async getSettings(key) {
        const res = await api.get(`/settings/${encodeURIComponent(key)}`)
        return res.data ?? null
    },

    async updateSettings(key, value) {
        const res = await api.put(`/settings/${encodeURIComponent(key)}`, { value })
        return res.data ?? null
    }
}

export default settingsService
