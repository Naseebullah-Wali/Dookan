import supabase from '../lib/supabaseClient';
import { NotFoundError } from '../utils/errors';

export interface Category {
    id: number;
    name: string;
    name_ps?: string;
    name_fa?: string;
    name_de?: string;
    name_fr?: string;
    icon?: string;
    description?: string;
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface CreateCategoryData {
    name: string;
    name_ps?: string;
    name_fa?: string;
    name_de?: string;
    name_fr?: string;
    icon?: string;
    description?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> { }

class CategoryModel {
    private generateSlug(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .replace(/--+/g, '-');
    }

    private mapRow(row: any) {
        return {
            id: row.id,
            name: row.name_en || null,
            name_ps: row.name_ps || null,
            name_fa: row.name_fa || null,
            name_de: row.name_de || null,
            name_fr: row.name_fr || null,
            icon: row.icon || null,
            description: row.description_en || null,
            is_active: row.active === true || row.active === 1 || row.active === 'true' ? 1 : 0,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    async create(data: CreateCategoryData): Promise<Category> {
        const payload: any = {
            name_en: data.name,
            name_ps: data.name_ps || null,
            name_fa: data.name_fa || null,
            name_de: data.name_de || null,
            name_fr: data.name_fr || null,
            slug: this.generateSlug(data.name),
            icon: data.icon || null,
            description_en: data.description || null,
        };

        const { data: created, error } = await supabase.from('categories').insert(payload).select().single();
        if (error) throw error;
        return this.mapRow(created);
    }

    async findById(id: number): Promise<Category | null> {
        const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data ? this.mapRow(data) : null;
    }

    async update(id: number, data: UpdateCategoryData): Promise<Category> {
        const existing = await this.findById(id);
        if (!existing) throw new NotFoundError('Category not found');

        const payload: any = {};
        if ((data as any).name !== undefined) {
            payload['name_en'] = (data as any).name;
            // Only regenerate slug if name changed
            payload['slug'] = this.generateSlug((data as any).name);
        }
        if ((data as any).name_ps !== undefined) payload['name_ps'] = (data as any).name_ps;
        if ((data as any).name_fa !== undefined) payload['name_fa'] = (data as any).name_fa;
        if ((data as any).name_de !== undefined) payload['name_de'] = (data as any).name_de;
        if ((data as any).name_fr !== undefined) payload['name_fr'] = (data as any).name_fr;
        if ((data as any).icon !== undefined) payload['icon'] = (data as any).icon;
        if ((data as any).description !== undefined) payload['description_en'] = (data as any).description;

        const { data: updated, error } = await supabase.from('categories').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return this.mapRow(updated);
    }

    async delete(id: number): Promise<void> {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
    }

    async getAll(activeOnly: boolean = false): Promise<Category[]> {
        let q: any = supabase.from('categories').select('*');
        if (activeOnly) q = q.eq('active', true);
        const { data, error } = await q.order('name_en', { ascending: true });
        if (error) throw error;
        return (data || []).map(this.mapRow.bind(this));
    }

    async getWithProductCount(): Promise<any[]> {
        // Use RPC or manual aggregation; simpler: fetch categories and product counts separately
        const { data: cats, error: e1 } = await supabase.from('categories').select('*').eq('active', true).order('name_en', { ascending: true });
        if (e1) throw e1;
        const results: any[] = [];
        for (const c of (cats || [])) {
            const { count, error } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', c.id).eq('is_active', true);
            if (error) throw error;
            results.push({ ...this.mapRow(c), product_count: count || 0 });
        }
        return results;
    }
}

export default new CategoryModel();
