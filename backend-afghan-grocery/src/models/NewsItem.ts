import supabase from '../lib/supabaseClient';
import { NotFoundError } from '../utils/errors';

export interface NewsItem {
    id: number;
    title: string;
    title_ps?: string;
    title_fa?: string;
    title_de?: string;
    title_fr?: string;
    subtitle?: string;
    subtitle_ps?: string;
    subtitle_fa?: string;
    subtitle_de?: string;
    subtitle_fr?: string;
    description?: string;
    description_ps?: string;
    description_fa?: string;
    description_de?: string;
    description_fr?: string;
    tag?: string;
    image?: string;
    bg_class?: string;
    is_active: number;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface CreateNewsItemData {
    title: string;
    title_ps?: string;
    title_fa?: string;
    title_de?: string;
    title_fr?: string;
    subtitle?: string;
    subtitle_ps?: string;
    subtitle_fa?: string;
    subtitle_de?: string;
    subtitle_fr?: string;
    description?: string;
    description_ps?: string;
    description_fa?: string;
    description_de?: string;
    description_fr?: string;
    tag?: string;
    image?: string;
    bg_class?: string;
    is_active?: boolean;
    display_order?: number;
}

export interface UpdateNewsItemData extends Partial<CreateNewsItemData> { }

class NewsItemModel {
    async create(data: CreateNewsItemData): Promise<NewsItem> {
        const payload: any = {
            title: data.title,
            title_ps: data.title_ps || null,
            title_fa: data.title_fa || null,
            title_de: data.title_de || null,
            title_fr: data.title_fr || null,
            subtitle: data.subtitle || null,
            subtitle_ps: data.subtitle_ps || null,
            subtitle_fa: data.subtitle_fa || null,
            subtitle_de: data.subtitle_de || null,
            subtitle_fr: data.subtitle_fr || null,
            description: data.description || null,
            description_ps: data.description_ps || null,
            description_fa: data.description_fa || null,
            description_de: data.description_de || null,
            description_fr: data.description_fr || null,
            tag: data.tag || null,
            image: data.image || null,
            bg_class: data.bg_class || null,
            is_active: data.is_active !== undefined ? data.is_active : true,
            display_order: data.display_order || 0
        };

        const { data: created, error } = await supabase
            .from('news_items')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        return created as NewsItem;
    }

    async findById(id: number): Promise<NewsItem | null> {
        const { data, error } = await supabase
            .from('news_items')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return (data as NewsItem) || null;
    }

    async update(id: number, data: UpdateNewsItemData): Promise<NewsItem> {
        const existing = await this.findById(id);
        if (!existing) throw new NotFoundError('News item not found');

        const payload: any = { ...data };
        if (payload.is_active !== undefined) payload.is_active = !!payload.is_active;

        const { data: updated, error } = await supabase
            .from('news_items')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return updated as NewsItem;
    }

    async delete(id: number): Promise<void> {
        const { count, error, data } = await supabase
            .from('news_items')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || (Array.isArray(data) && data.length === 0)) {
            throw new NotFoundError('News item not found');
        }
    }

    async getAll(activeOnly: boolean = true): Promise<NewsItem[]> {
        let query = supabase.from('news_items').select('*');

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        // order by display_order asc, created_at desc
        const { data, error } = await query
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data as NewsItem[]) || [];
    }
}

export default new NewsItemModel();
