/**
 * Address Service - Supabase Implementation
 * Handles all address-related database operations
 */
import { supabase, getCurrentUser } from '../lib/supabase'

export const addressService = {
    /**
     * Get all addresses for the current user
     * @returns {Promise<Array>} List of addresses
     */
    async getAll() {
        const user = await getCurrentUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Create a new address
     * @param {Object} addressData - Address data
     * @returns {Promise<Object>} Created address
     */
    async create(addressData) {
        const user = await getCurrentUser()
        if (!user) throw new Error('Not authenticated')

        // If this is set as default, unset other defaults
        if (addressData.is_default) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id)
        }

        const { data, error } = await supabase
            .from('addresses')
            .insert({
                ...addressData,
                user_id: user.id
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Update an existing address
     * @param {number} id - Address ID
     * @param {Object} addressData - Updated address data
     * @returns {Promise<Object>} Updated address
     */
    async update(id, addressData) {
        const user = await getCurrentUser()
        if (!user) throw new Error('Not authenticated')

        // If this is set as default, unset other defaults
        if (addressData.is_default) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id)
                .neq('id', id)
        }

        const { data, error } = await supabase
            .from('addresses')
            .update(addressData)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Delete an address
     * @param {number} id - Address ID
     * @returns {Promise<Object>} Success response
     */
    async delete(id) {
        const user = await getCurrentUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error
        return { message: 'Address deleted successfully' }
    }
}

export default addressService
