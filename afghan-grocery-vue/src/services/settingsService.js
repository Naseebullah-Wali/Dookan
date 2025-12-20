import { supabase } from '../lib/supabase'

export const settingsService = {
    async getSettings(key) {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', key)
            .single()

        if (error) {
            console.error(`Error fetching setting ${key}:`, error)
            return null
        }
        return data.value
    },

    async updateSettings(key, value) {
        const { data, error } = await supabase
            .from('site_settings')
            .upsert({ key, value })
            .select()
            .single()

        if (error) throw error
        return data.value
    }
}

export default settingsService
