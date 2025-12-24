import supabase from '../lib/supabaseClient';

export interface WishlistItem {
    id: number;
    user_id: string; // UUID from profiles table
    product_id: number;
    created_at: string;
}

class WishlistModel {
    async getUserWishlist(userId: string): Promise<any[]> {
        const { data, error } = await supabase.from('wishlists').select('*, products(*)').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async add(userId: string, productId: number): Promise<WishlistItem> {
        // Check if exists
        const { data: existing } = await supabase.from('wishlists').select('*').eq('user_id', userId).eq('product_id', productId).single();
        if (existing) return existing as WishlistItem;

        const { data, error } = await supabase.from('wishlists').insert({ user_id: userId, product_id: productId }).select().single();
        if (error) throw error;
        return data as WishlistItem;
    }

    async remove(userId: string, productId: number): Promise<boolean> {
        const { data, error } = await supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', productId);
        if (error) throw error;
        // Supabase returns null on successful delete; presence of error indicates success
        return !error;
    }

    async removeById(id: number, userId: string): Promise<boolean> {
        console.log('Wishlist.removeById query:', { id, userId });
        const { data, error } = await supabase.from('wishlists').delete().eq('id', id).eq('user_id', userId);
        console.log('Wishlist.removeById result:', { data, error });
        if (error) throw error;
        // Supabase returns null on successful delete; no error means success
        return true;
    }

    async clear(userId: string): Promise<void> {
        const { error } = await supabase.from('wishlists').delete().eq('user_id', userId);
        if (error) throw error;
        // Supabase returns null on successful delete
    }
}

export default new WishlistModel();
