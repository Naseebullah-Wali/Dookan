import supabase from '../lib/supabaseClient';
import { NotFoundError } from '../utils/errors';

export interface Product {
    id: number;
    name: string;
    name_ps?: string;
    name_fa?: string;
    name_de?: string;
    name_fr?: string;
    description?: string;
    description_ps?: string;
    description_fa?: string;
    description_de?: string;
    description_fr?: string;
    price: number;
    original_price?: number;
    stock: number;
    category_id: number;
    image?: string;
    images?: string;
    unit: string;
    weight?: number;
    verified: number;
    seller?: string;
    supplier?: string;
    is_new: number;
    is_featured: number;
    on_sale: number;
    rating: number;
    review_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateProductData {
    name: string;
    name_ps?: string;
    name_fa?: string;
    name_de?: string;
    name_fr?: string;
    description?: string;
    description_ps?: string;
    description_fa?: string;
    description_de?: string;
    description_fr?: string;
    price: number;
    original_price?: number;
    stock?: number;
    category_id: number;
    image?: string;
    images?: string[];
    unit?: string;
    weight?: number;
    verified?: boolean;
    seller?: string;
    supplier?: string;
    is_new?: boolean;
    is_featured?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> { }

export interface ProductFilters {
    category_id?: number;
    is_featured?: boolean;
    is_active?: boolean;
    min_price?: number;
    max_price?: number;
    search?: string;
}

class ProductModel {
    private generateSlug(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .replace(/--+/g, '-');
    }

    private mapRow(row: any): Product {
        if (!row) return row;

        return {
            id: row.id,
            name: row.name_en || row.name || null,
            name_ps: row.name_ps || row.name_ps || null,
            name_fa: row.name_fa || row.name_fa || null,
            name_de: row.name_de || row.name_de || null,
            name_fr: row.name_fr || row.name_fr || null,
            description: row.description_en || row.description || null,
            description_ps: row.description_ps || null,
            description_fa: row.description_fa || null,
            description_de: row.description_de || null,
            description_fr: row.description_fr || null,
            price: parseFloat(row.price || 0),
            original_price: row.compare_at_price || row.original_price || null,
            stock: row.stock || 0,
            category_id: row.category_id || null,
            image: row.image || null,
            images: Array.isArray(row.images) ? row.images : (row.images ? JSON.parse(row.images) : null) as any,
            unit: row.unit || 'piece',
            weight: row.weight || null,
            verified: row.verified ? 1 : 0,
            seller: row.seller || null,
            supplier: row.supplier || null,
            is_new: row.is_new ? 1 : 0,
            is_featured: row.featured || row.is_featured ? 1 : 0,
            on_sale: row.on_sale ? 1 : 0,
            is_active: row.is_active !== undefined ? (row.is_active ? 1 : 0) : 1,
            rating: parseFloat(row.rating || 0),
            review_count: row.review_count || 0,
            created_at: row.created_at,
            updated_at: row.updated_at,
        } as Product;
    }

    async create(data: CreateProductData): Promise<Product> {
        const payload: any = {
            name_en: data.name,
            name_ps: data.name_ps || null,
            name_fa: data.name_fa || null,
            name_de: data.name_de || null,
            name_fr: data.name_fr || null,
            description_en: data.description || null,
            slug: this.generateSlug(data.name),
            price: data.price,
            compare_at_price: data.original_price || null,
            stock: data.stock || 0,
            category_id: data.category_id || null,
            image: data.image || null,
            images: data.images || null,
            weight: data.weight || null,
            verified: data.verified ? true : false,
            on_sale: false,
            featured: data.is_featured ? true : false,
        };

        const { data: created, error } = await supabase.from('products').insert(payload).select().single();
        if (error) throw error;
        return this.mapRow(created);
    }

    async findById(id: number): Promise<Product | null> {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data ? this.mapRow(data) : null;
    }

    async update(id: number, data: UpdateProductData): Promise<Product> {
        const existing = await this.findById(id);
        if (!existing) throw new NotFoundError('Product not found');

        const payload: any = {};
        const fields = [
            'name', 'name_ps', 'name_fa', 'name_de', 'name_fr',
            'description', 'description_ps', 'description_fa', 'description_de', 'description_fr',
            'price', 'original_price', 'stock', 'category_id', 'image',
            'weight'
        ];

        fields.forEach((f) => {
            if ((data as any)[f] !== undefined) {
                // map to supabase column names where necessary
                if (f === 'name') payload['name_en'] = (data as any)[f];
                else if (f === 'description') payload['description_en'] = (data as any)[f];
                else if (f === 'original_price') payload['compare_at_price'] = (data as any)[f];
                else payload[f] = (data as any)[f];
            }
        });

        if ((data as any).images !== undefined) payload['images'] = (data as any).images;
        if ((data as any).verified !== undefined) payload['verified'] = (data as any).verified ? true : false;
        if ((data as any).is_new !== undefined) payload['is_new'] = (data as any).is_new ? true : false;
        if ((data as any).is_featured !== undefined) payload['featured'] = (data as any).is_featured ? true : false;

        const { data: updated, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return this.mapRow(updated);
    }

    async delete(id: number): Promise<void> {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
    }

    async getAll(
        filters: ProductFilters = {},
        limit: number = 50,
        offset: number = 0
    ): Promise<Product[]> {
        let query: any = supabase.from('products').select('*');

        if ((filters as any).ids) {
            const ids = Array.isArray((filters as any).ids) ? (filters as any).ids : String((filters as any).ids).split(',').map((v: string) => Number(v));
            query = query.in('id', ids as number[]);
            // when querying by ids, ignore pagination
            const { data, error } = await query;
            if (error) throw error;
            return (data || []).map(this.mapRow.bind(this));
        }

        if ((filters as any).category_id) query = query.eq('category_id', filters.category_id);
        if (filters.is_featured !== undefined) query = query.eq('featured', filters.is_featured);
        if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);
        if ((filters as any).min_price) query = query.gte('price', (filters as any).min_price);
        if ((filters as any).max_price) query = query.lte('price', (filters as any).max_price);
        if (filters.search) {
            const term = `%${filters.search}%`;
            query = query.or(`name_en.ilike.${term},description_en.ilike.${term}`);
        }

        query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(this.mapRow.bind(this));
    }

    async count(filters: ProductFilters = {}): Promise<number> {
        let query: any = supabase.from('products').select('id', { count: 'exact', head: true });

        if ((filters as any).category_id) query = query.eq('category_id', filters.category_id);
        if (filters.is_featured !== undefined) query = query.eq('featured', filters.is_featured);
        if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);
        if ((filters as any).min_price) query = query.gte('price', (filters as any).min_price);
        if ((filters as any).max_price) query = query.lte('price', (filters as any).max_price);
        if (filters.search) {
            const term = `%${filters.search}%`;
            query = query.or(`name_en.ilike.${term},description_en.ilike.${term}`);
        }

        const { count, error } = await query;
        if (error) throw error;
        // supabase returns count via a header when head:true; using .select with head: true returns count in `count` variable
        return (count as number) || 0;
    }

    async updateStock(id: number, quantity: number): Promise<void> {
        const { data, error } = await (supabase.from('products').update({ stock: (supabase as any).raw('stock + ?', [quantity]) }).eq('id', id) as any);
        if (error) throw error;
        if (!data || (Array.isArray(data) && (data as any).length === 0)) throw new NotFoundError('Product not found');
    }

    async updateRating(productId: number): Promise<void> {
        // Recalculate rating using reviews table
        const { data: avgData, error: e1 } = await supabase.from('product_reviews').select('rating').eq('product_id', productId).eq('verified_purchase', true);
        if (e1) throw e1;
        const ratings = (avgData || []).map((r: any) => r.rating);
        const avg = ratings.length ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) : 0;
        await supabase.from('products').update({ rating: avg, review_count: ratings.length }).eq('id', productId);
    }
}

export default new ProductModel();
