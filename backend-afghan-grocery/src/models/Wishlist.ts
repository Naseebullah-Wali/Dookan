import DatabaseConnection from '../db/connection';

export interface WishlistItem {
    id: number;
    user_id: number;
    product_id: number;
    created_at: string;
}

class WishlistModel {
    private async getDb() {
        return await DatabaseConnection.getInstance();
    }

    async getUserWishlist(userId: number): Promise<any[]> {
        const db = await this.getDb();
        const items = await db.all<any[]>(`
            SELECT 
                w.id,
                w.user_id,
                w.product_id,
                w.created_at,
                p.name,
                p.price,
                p.original_price,
                p.image,
                p.stock,
                p.rating,
                p.category_id,
                p.size
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `, userId);
        return items;
    }

    async add(userId: number, productId: number): Promise<WishlistItem> {
        const db = await this.getDb();

        // Check if already exists
        const existing = await db.get<WishlistItem>(
            'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
            userId,
            productId
        );

        if (existing) {
            return existing;
        }

        const result = await db.run(
            'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
            userId,
            productId
        );

        return (await db.get<WishlistItem>(
            'SELECT * FROM wishlist WHERE id = ?',
            result.lastID
        ))!;
    }

    async remove(userId: number, productId: number): Promise<boolean> {
        const db = await this.getDb();
        const result = await db.run(
            'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
            userId,
            productId
        );
        return (result.changes || 0) > 0;
    }

    async removeById(id: number, userId: number): Promise<boolean> {
        const db = await this.getDb();
        const result = await db.run(
            'DELETE FROM wishlist WHERE id = ? AND user_id = ?',
            id,
            userId
        );
        return (result.changes || 0) > 0;
    }

    async clear(userId: number): Promise<void> {
        const db = await this.getDb();
        await db.run('DELETE FROM wishlist WHERE user_id = ?', userId);
    }
}

export default new WishlistModel();
