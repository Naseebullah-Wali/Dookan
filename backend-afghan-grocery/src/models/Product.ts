import DatabaseConnection from '../db/connection';
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
    is_featured: number;
    is_active: number;
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
    private async getDb() {
        return await DatabaseConnection.getInstance();
    }

    async create(data: CreateProductData): Promise<Product> {
        const db = await this.getDb();

        const result = await db.run(`
      INSERT INTO products (
        name, name_ps, name_fa, name_de, name_fr,
        description, description_ps, description_fa, description_de, description_fr,
        price, original_price, stock, category_id, image, images,
        unit, weight, is_featured
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
            data.name,
            data.name_ps || null,
            data.name_fa || null,
            data.name_de || null,
            data.name_fr || null,
            data.description || null,
            data.description_ps || null,
            data.description_fa || null,
            data.description_de || null,
            data.description_fr || null,
            data.price,
            data.original_price || null,
            data.stock || 0,
            data.category_id,
            data.image || null,
            data.images ? JSON.stringify(data.images) : null,
            data.unit || 'piece',
            data.weight || null,
            data.is_featured ? 1 : 0
        );

        return (await this.findById(result.lastID!))!;
    }

    async findById(id: number): Promise<Product | null> {
        const db = await this.getDb();
        return await db.get<Product>('SELECT * FROM products WHERE id = ?', id) || null;
    }

    async update(id: number, data: UpdateProductData): Promise<Product> {
        const db = await this.getDb();
        const product = await this.findById(id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        const updates: string[] = [];
        const values: any[] = [];

        const fields = [
            'name', 'name_ps', 'name_fa', 'name_de', 'name_fr',
            'description', 'description_ps', 'description_fa', 'description_de', 'description_fr',
            'price', 'original_price', 'stock', 'category_id', 'image',
            'unit', 'weight'
        ];

        fields.forEach((field) => {
            if (data[field as keyof UpdateProductData] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field as keyof UpdateProductData]);
            }
        });

        if (data.images !== undefined) {
            updates.push('images = ?');
            values.push(JSON.stringify(data.images));
        }

        if (data.is_featured !== undefined) {
            updates.push('is_featured = ?');
            values.push(data.is_featured ? 1 : 0);
        }

        if (updates.length === 0) {
            return product;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await db.run(`
      UPDATE products
      SET ${updates.join(', ')}
      WHERE id = ?
    `, ...values);

        return (await this.findById(id))!;
    }

    async delete(id: number): Promise<void> {
        const db = await this.getDb();
        const result = await db.run('DELETE FROM products WHERE id = ?', id);

        if (result.changes === 0) {
            throw new NotFoundError('Product not found');
        }
    }

    async getAll(
        filters: ProductFilters = {},
        limit: number = 50,
        offset: number = 0
    ): Promise<Product[]> {
        const db = await this.getDb();
        let query = 'SELECT * FROM products WHERE 1=1';
        const params: any[] = [];

        if (filters.category_id) {
            query += ' AND category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.is_featured !== undefined) {
            query += ' AND is_featured = ?';
            params.push(filters.is_featured ? 1 : 0);
        }

        if (filters.is_active !== undefined) {
            query += ' AND is_active = ?';
            params.push(filters.is_active ? 1 : 0);
        }

        if (filters.min_price) {
            query += ' AND price >= ?';
            params.push(filters.min_price);
        }

        if (filters.max_price) {
            query += ' AND price <= ?';
            params.push(filters.max_price);
        }

        if (filters.search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return await db.all<Product[]>(query, ...params);
    }

    async count(filters: ProductFilters = {}): Promise<number> {
        const db = await this.getDb();
        let query = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
        const params: any[] = [];

        if (filters.category_id) {
            query += ' AND category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.is_featured !== undefined) {
            query += ' AND is_featured = ?';
            params.push(filters.is_featured ? 1 : 0);
        }

        if (filters.is_active !== undefined) {
            query += ' AND is_active = ?';
            params.push(filters.is_active ? 1 : 0);
        }

        if (filters.min_price) {
            query += ' AND price >= ?';
            params.push(filters.min_price);
        }

        if (filters.max_price) {
            query += ' AND price <= ?';
            params.push(filters.max_price);
        }

        if (filters.search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        const result = await db.get<{ count: number }>(query, ...params);
        return result?.count || 0;
    }

    async updateStock(id: number, quantity: number): Promise<void> {
        const db = await this.getDb();

        const result = await db.run(`
      UPDATE products
      SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, quantity, id);

        if (result.changes === 0) {
            throw new NotFoundError('Product not found');
        }
    }

    async updateRating(productId: number): Promise<void> {
        const db = await this.getDb();

        await db.run(`
      UPDATE products
      SET 
        rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ? AND is_approved = 1),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ? AND is_approved = 1),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, productId, productId, productId);
    }
}

export default new ProductModel();
