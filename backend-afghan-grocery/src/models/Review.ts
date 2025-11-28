import DatabaseConnection from '../db/connection';

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
    private async getDb() {
        return await DatabaseConnection.getInstance();
    }

    async create(data: CreateReviewData): Promise<Review> {
        const db = await this.getDb();

        const result = await db.run(`
            INSERT INTO reviews (product_id, user_id, order_id, rating, comment, is_approved)
            VALUES (?, ?, ?, ?, ?, 1)
        `,
            data.product_id,
            data.user_id,
            data.order_id || null,
            data.rating,
            data.comment || null
        );

        // Update product rating
        await this.updateProductRating(data.product_id);

        return (await this.findById(result.lastID!))!;
    }

    async findById(id: number): Promise<Review | null> {
        const db = await this.getDb();
        return await db.get<Review>('SELECT * FROM reviews WHERE id = ?', id) || null;
    }

    async getProductReviews(productId: number): Promise<any[]> {
        const db = await this.getDb();
        return await db.all<any[]>(`
            SELECT 
                r.*,
                u.name as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ? AND r.is_approved = 1
            ORDER BY r.created_at DESC
        `, productId);
    }

    async getUserReviews(userId: number): Promise<any[]> {
        const db = await this.getDb();
        return await db.all<any[]>(`
            SELECT 
                r.*,
                p.name as product_name,
                p.image as product_image
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `, userId);
    }

    async delete(id: number, userId: number): Promise<boolean> {
        const db = await this.getDb();
        const review = await this.findById(id);

        if (!review || review.user_id !== userId) {
            return false;
        }

        await db.run('DELETE FROM reviews WHERE id = ?', id);
        await this.updateProductRating(review.product_id);

        return true;
    }

    private async updateProductRating(productId: number): Promise<void> {
        const db = await this.getDb();

        const stats = await db.get<{ avg_rating: number; count: number }>(`
            SELECT 
                AVG(rating) as avg_rating,
                COUNT(*) as count
            FROM reviews
            WHERE product_id = ? AND is_approved = 1
        `, productId);

        await db.run(`
            UPDATE products
            SET rating = ?, review_count = ?
            WHERE id = ?
        `,
            stats?.avg_rating || 0,
            stats?.count || 0,
            productId
        );
    }
}

export default new ReviewModel();
