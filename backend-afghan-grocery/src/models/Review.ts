import supabase from '../lib/supabaseClient';

export interface Review {
    id: number;
    product_id: number;
    user_id: number;
    order_id?: number;
    rating: number;
    comment?: string;
    is_verified: number;
    is_approved: number;
    created_at: string;
    updated_at: string;
}

export interface CreateReviewData {
    product_id: number;
    user_id: number;
    order_id?: number;
    rating: number;
    comment?: string;
}

class ReviewModel {
    async create(data: CreateReviewData): Promise<Review> {
        const { data: created, error } = await supabase.from('reviews').insert({
            product_id: data.product_id,
            user_id: data.user_id,
            order_id: data.order_id || null,
            rating: data.rating,
            comment: data.comment || null,
            is_approved: 1
        }).select().single();

        if (error) throw error;
        await this.updateProductRating(data.product_id);
        return created as Review;
    }

    async findById(id: number): Promise<Review | null> {
        const { data, error } = await supabase.from('reviews').select('*').eq('id', id).single();
        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data as Review | null;
    }

    async getProductReviews(productId: number): Promise<any[]> {
        const { data, error } = await supabase.from('reviews').select('*, users(name)').eq('product_id', productId).eq('is_approved', 1).order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async getUserReviews(userId: number): Promise<any[]> {
        const { data, error } = await supabase.from('reviews').select('*, products(name, image)').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async delete(id: number, userId: number): Promise<boolean> {
        const review = await this.findById(id);
        if (!review || review.user_id !== userId) return false;

        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) throw error;
        await this.updateProductRating(review.product_id);
        return true;
    }

    private async updateProductRating(productId: number): Promise<void> {
        const { data, error } = await supabase.from('reviews').select('rating', { count: 'exact' }).eq('product_id', productId).eq('is_approved', 1);
        if (error) throw error;
        const ratings = (data || []).map((r: any) => r.rating);
        const avg = ratings.length ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) : 0;
        await supabase.from('products').update({ rating: avg, review_count: ratings.length }).eq('id', productId);
    }
}

export default new ReviewModel();
