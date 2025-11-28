import DatabaseConnection from '../db/connection';
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
    private async getDb() {
        return await DatabaseConnection.getInstance();
    }

    async create(data: CreateTestimonialData): Promise<Testimonial> {
        const db = await this.getDb();

        const result = await db.run(`
      INSERT INTO testimonials (
        user_name, location, rating, comment, avatar, gender, is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
            data.user_name,
            data.location || null,
            data.rating,
            data.comment,
            data.avatar || null,
            data.gender || null,
            data.is_active ? 1 : 1
        );

        return (await this.findById(result.lastID!))!;
    }

    async findById(id: number): Promise<Testimonial | null> {
        const db = await this.getDb();
        return await db.get<Testimonial>('SELECT * FROM testimonials WHERE id = ?', id) || null;
    }

    async update(id: number, data: UpdateTestimonialData): Promise<Testimonial> {
        const db = await this.getDb();
        const testimonial = await this.findById(id);
        if (!testimonial) {
            throw new NotFoundError('Testimonial not found');
        }

        const updates: string[] = [];
        const values: any[] = [];

        const fields = ['user_name', 'location', 'rating', 'comment', 'avatar', 'gender'];

        fields.forEach((field) => {
            if (data[field as keyof UpdateTestimonialData] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field as keyof UpdateTestimonialData]);
            }
        });

        if (data.is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(data.is_active ? 1 : 0);
        }

        if (updates.length === 0) {
            return testimonial;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await db.run(`
      UPDATE testimonials
      SET ${updates.join(', ')}
      WHERE id = ?
    `, ...values);

        return (await this.findById(id))!;
    }

    async delete(id: number): Promise<void> {
        const db = await this.getDb();
        const result = await db.run('DELETE FROM testimonials WHERE id = ?', id);

        if (result.changes === 0) {
            throw new NotFoundError('Testimonial not found');
        }
    }

    async getAll(activeOnly: boolean = true): Promise<Testimonial[]> {
        const db = await this.getDb();
        let query = 'SELECT * FROM testimonials';

        if (activeOnly) {
            query += ' WHERE is_active = 1';
        }

        query += ' ORDER BY created_at DESC';

        return await db.all<Testimonial[]>(query);
    }
}

export default new TestimonialModel();
