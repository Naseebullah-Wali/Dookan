import supabase from '../lib/supabaseClient';
import { ValidationError } from '../utils/errors';

export interface Review {
    id: number;
    product_id: number;
    user_id: string;
    rating: number;
    comment?: string;
    is_verified: number;
    created_at: string;
    updated_at: string;
}

export interface CreateReviewData {
    product_id: number;
    user_id: string;
    rating: number;
    comment?: string;
}

class ReviewModel {
    async create(data: CreateReviewData): Promise<Review> {
        const { data: created, error } = await supabase.from('product_reviews').insert({
            product_id: data.product_id,
            user_id: data.user_id,
            rating: data.rating,
            comment: data.comment || null
        }).select().single();

        if (error) {
            if (error.code === '23505') {
                throw new ValidationError('You have already submitted a review for this product. You can only review a product once.');
            }
            throw error;
        }
        await this.updateProductRating(data.product_id);
        return created as Review;
    }

    async findById(id: number): Promise<Review | null> {
        const { data, error } = await supabase.from('product_reviews').select('*').eq('id', id).single();
        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data as Review | null;
    }

    async checkExistingReview(productId: number, userId: string): Promise<boolean> {
        const { data, error } = await supabase.from('product_reviews').select('id').eq('product_id', productId).eq('user_id', userId).single();
        if (error && error.code === 'PGRST116') return false;
        if (error) throw error;
        return !!data;
    }

    async getProductReviews(productId: number): Promise<any[]> {
        const { data, error } = await supabase.from('product_reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
        if (error) throw error;
        
        if (!data || data.length === 0) {
            return [];
        }
        
        // Fetch user names from profiles table
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, name').in('id', userIds);
        
        console.log('Fetched profiles:', profiles);
        console.log('Profiles error:', profilesError);
        
        const userMap = new Map();
        if (profiles && !profilesError) {
            profiles.forEach((p: any) => {
                userMap.set(p.id, p.name || 'User');
                console.log(`Mapped profile ${p.id} to ${p.name}`);
            });
        }
        
        return data.map(review => {
            const userName = userMap.get(review.user_id) || 'User';
            console.log(`Review user_id: ${review.user_id}, user_name: ${userName}`);
            return {
                ...review,
                user_name: userName
            };
        });
    }

    async getUserReviews(userId: number): Promise<any[]> {
        const { data, error } = await supabase.from('product_reviews').select('*, products(name, image)').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async delete(id: number, userId: number): Promise<boolean> {
        const review = await this.findById(id);
        if (!review || review.user_id !== userId) return false;

        const { error } = await supabase.from('product_reviews').delete().eq('id', id);
        if (error) throw error;
        await this.updateProductRating(review.product_id);
        return true;
    }

    private async updateProductRating(productId: number): Promise<void> {
        const { data, error } = await supabase.from('product_reviews').select('rating', { count: 'exact' }).eq('product_id', productId);
        if (error) throw error;
        const ratings = (data || []).map((r: any) => r.rating);
        const avg = ratings.length ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) : 0;
        await supabase.from('products').update({ rating: avg, review_count: ratings.length }).eq('id', productId);
    }
}

export default new ReviewModel();
