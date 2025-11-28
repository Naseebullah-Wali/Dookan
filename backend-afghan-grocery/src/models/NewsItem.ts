import DatabaseConnection from '../db/connection';
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
    private async getDb() {
        return await DatabaseConnection.getInstance();
    }

    async create(data: CreateNewsItemData): Promise<NewsItem> {
        const db = await this.getDb();

        const result = await db.run(`
      INSERT INTO news_items (
        title, title_ps, title_fa, title_de, title_fr,
        subtitle, subtitle_ps, subtitle_fa, subtitle_de, subtitle_fr,
        description, description_ps, description_fa, description_de, description_fr,
        tag, image, bg_class, is_active, display_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
            data.title,
            data.title_ps || null,
            data.title_fa || null,
            data.title_de || null,
            data.title_fr || null,
            data.subtitle || null,
            data.subtitle_ps || null,
            data.subtitle_fa || null,
            data.subtitle_de || null,
            data.subtitle_fr || null,
            data.description || null,
            data.description_ps || null,
            data.description_fa || null,
            data.description_de || null,
            data.description_fr || null,
            data.tag || null,
            data.image || null,
            data.bg_class || null,
            data.is_active ? 1 : 1,
            data.display_order || 0
        );

        return (await this.findById(result.lastID!))!;
    }

    async findById(id: number): Promise<NewsItem | null> {
        const db = await this.getDb();
        return await db.get<NewsItem>('SELECT * FROM news_items WHERE id = ?', id) || null;
    }

    async update(id: number, data: UpdateNewsItemData): Promise<NewsItem> {
        const db = await this.getDb();
        const newsItem = await this.findById(id);
        if (!newsItem) {
            throw new NotFoundError('News item not found');
        }

        const updates: string[] = [];
        const values: any[] = [];

        const fields = [
            'title', 'title_ps', 'title_fa', 'title_de', 'title_fr',
            'subtitle', 'subtitle_ps', 'subtitle_fa', 'subtitle_de', 'subtitle_fr',
            'description', 'description_ps', 'description_fa', 'description_de', 'description_fr',
            'tag', 'image', 'bg_class', 'display_order'
        ];

        fields.forEach((field) => {
            if (data[field as keyof UpdateNewsItemData] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field as keyof UpdateNewsItemData]);
            }
        });

        if (data.is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(data.is_active ? 1 : 0);
        }

        if (updates.length === 0) {
            return newsItem;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await db.run(`
      UPDATE news_items
      SET ${updates.join(', ')}
      WHERE id = ?
    `, ...values);

        return (await this.findById(id))!;
    }

    async delete(id: number): Promise<void> {
        const db = await this.getDb();
        const result = await db.run('DELETE FROM news_items WHERE id = ?', id);

        if (result.changes === 0) {
            throw new NotFoundError('News item not found');
        }
    }

    async getAll(activeOnly: boolean = true): Promise<NewsItem[]> {
        const db = await this.getDb();
        let query = 'SELECT * FROM news_items';

        if (activeOnly) {
            query += ' WHERE is_active = 1';
        }

        query += ' ORDER BY display_order ASC, created_at DESC';

        return await db.all<NewsItem[]>(query);
    }
}

export default new NewsItemModel();
