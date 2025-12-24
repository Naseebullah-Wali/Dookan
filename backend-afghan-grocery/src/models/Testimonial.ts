import supabase from '../lib/supabaseClient';
import { NotFoundError } from '../utils/errors';

export interface Testimonial {
    id: number;
    user_name: string;
    location?: string;
    rating: number;
    comment: string;
    avatar?: string;
    gender?: 'male' | 'female';
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface CreateTestimonialData {
    user_name: string;
    location?: string;
    rating: number;
    comment: string;
    avatar?: string;
    gender?: 'male' | 'female';
    is_active?: boolean;
}

export interface UpdateTestimonialData extends Partial<CreateTestimonialData> { }

class TestimonialModel {
    async create(data: CreateTestimonialData): Promise<Testimonial> {
        const payload: any = {
            user_name: data.user_name,
            user_name_de: null,
            user_name_fr: null,
            user_name_ps: null,
            user_name_fa: null,
            location: data.location || null,
            rating: data.rating,
            comment: data.comment,
            comment_de: null,
            comment_fr: null,
            comment_ps: null,
            comment_fa: null,
            avatar: data.avatar || null,
            gender: data.gender || null,
            is_active: data.is_active !== undefined ? data.is_active : true
        };

        const { data: created, error } = await supabase
            .from('testimonials')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        return created as Testimonial;
    }

    async findById(id: number): Promise<Testimonial | null> {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return (data as Testimonial) || null;
    }

    async update(id: number, data: UpdateTestimonialData): Promise<Testimonial> {
        const existing = await this.findById(id);
        if (!existing) throw new NotFoundError('Testimonial not found');

        const payload: any = { ...data };
        if (payload.is_active !== undefined) payload.is_active = !!payload.is_active;

        const { data: updated, error } = await supabase
            .from('testimonials')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return updated as Testimonial;
    }

    async delete(id: number): Promise<void> {
        const { data, error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || (Array.isArray(data) && data.length === 0)) {
            throw new NotFoundError('Testimonial not found');
        }
    }

    async getAll(activeOnly: boolean = true): Promise<Testimonial[]> {
        let query = supabase.from('testimonials').select('*');

        if (activeOnly) query = query.eq('is_active', true);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return (data as Testimonial[]) || [];
    }
}

export default new TestimonialModel();
