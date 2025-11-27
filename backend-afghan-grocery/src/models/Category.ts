import DatabaseConnection from '../db/connection';
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
    parent_id?: number;
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
    parent_id?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> { }

class CategoryModel {
    private async getDb() {
        return await DatabaseConnection.getInstance();
    }

    async create(data: CreateCategoryData): Promise<Category> {
        const db = await this.getDb();

        const result = await db.run(`
      INSERT INTO categories (name, name_ps, name_fa, name_de, name_fr, icon, description, parent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
            data.name,
            data.name_ps || null,
            data.name_fa || null,
            data.name_de || null,
            data.name_fr || null,
            data.icon || null,
            data.description || null,
            data.parent_id || null
        );

        return (await this.findById(result.lastID!))!;
    }

    async findById(id: number): Promise<Category | null> {
        const db = await this.getDb();
        return await db.get<Category>('SELECT * FROM categories WHERE id = ?', id) || null;
    }

    async update(id: number, data: UpdateCategoryData): Promise<Category> {
        const db = await this.getDb();
        const category = await this.findById(id);
        if (!category) {
            throw new NotFoundError('Category not found');
        }

        const updates: string[] = [];
        const values: any[] = [];

        const fields = ['name', 'name_ps', 'name_fa', 'name_de', 'name_fr', 'icon', 'description', 'parent_id'];

        fields.forEach((field) => {
            if (data[field as keyof UpdateCategoryData] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field as keyof UpdateCategoryData]);
            }
        });

        if (updates.length === 0) {
            return category;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await db.run(`
      UPDATE categories
      SET ${updates.join(', ')}
      WHERE id = ?
    `, ...values);

        return (await this.findById(id))!;
    }

    async delete(id: number): Promise<void> {
        const db = await this.getDb();
        const result = await db.run('DELETE FROM categories WHERE id = ?', id);

        if (result.changes === 0) {
            throw new NotFoundError('Category not found');
        }
    }

    async getAll(activeOnly: boolean = false): Promise<Category[]> {
        const db = await this.getDb();
        let query = 'SELECT * FROM categories';

        if (activeOnly) {
            query += ' WHERE is_active = 1';
        }

        query += ' ORDER BY name ASC';

        return await db.all<Category[]>(query);
    }

    async getWithProductCount(): Promise<any[]> {
        const db = await this.getDb();
        return await db.all(`
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    }
}

export default new CategoryModel();
