import DatabaseConnection from '../db/connection';
import { NotFoundError, ConflictError } from '../utils/errors';

export interface User {
    id: number;
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'customer' | 'admin';
    is_verified: number;
    created_at: string;
    updated_at: string;
}

export interface CreateUserData {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: 'customer' | 'admin';
}

export interface UpdateUserData {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
}

class UserModel {
    private async getDb() {
        return await DatabaseConnection.getInstance();
    }

    async create(data: CreateUserData): Promise<User> {
        const db = await this.getDb();

        try {
            const result = await db.run(`
      INSERT INTO users (email, password, name, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `,
                data.email,
                data.password,
                data.name,
                data.phone || null,
                data.role || 'customer'
            );

            return (await this.findById(result.lastID!))!;
        } catch (error: any) {
            if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('UNIQUE constraint')) {
                throw new ConflictError('Email already exists');
            }
            throw error;
        }
    }

    async findById(id: number): Promise<User | null> {
        const db = await this.getDb();
        return await db.get<User>('SELECT * FROM users WHERE id = ?', id) || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const db = await this.getDb();
        return await db.get<User>('SELECT * FROM users WHERE email = ?', email) || null;
    }

    async update(id: number, data: UpdateUserData): Promise<User> {
        const db = await this.getDb();
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const updates: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.phone !== undefined) {
            updates.push('phone = ?');
            values.push(data.phone);
        }
        if (data.email !== undefined) {
            updates.push('email = ?');
            values.push(data.email);
        }
        if (data.password !== undefined) {
            updates.push('password = ?');
            values.push(data.password);
        }

        if (updates.length === 0) {
            return user;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        try {
            await db.run(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ?
    `, ...values);
            return (await this.findById(id))!;
        } catch (error: any) {
            if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('UNIQUE constraint')) {
                throw new ConflictError('Email already exists');
            }
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        const db = await this.getDb();
        const result = await db.run('DELETE FROM users WHERE id = ?', id);

        if (result.changes === 0) {
            throw new NotFoundError('User not found');
        }
    }

    async getAll(limit: number = 50, offset: number = 0): Promise<User[]> {
        const db = await this.getDb();
        return await db.all<User[]>(`
      SELECT * FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, limit, offset);
    }

    async count(): Promise<number> {
        const db = await this.getDb();
        const result = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
        return result?.count || 0;
    }
}

export default new UserModel();
