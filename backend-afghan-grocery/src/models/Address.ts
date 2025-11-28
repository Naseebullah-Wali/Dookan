import DatabaseConnection from '../db/connection';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export interface Address {
    id: number;
    user_id: number;
    recipient_name: string;
    phone: string;
    province: string;
    city: string;
    district?: string;
    street: string;
    postal_code?: string;
    is_default: number;
    created_at: string;
    updated_at: string;
}

export interface CreateAddressData {
    user_id: number;
    recipient_name: string;
    phone: string;
    province: string;
    city: string;
    district?: string;
    street: string;
    postal_code?: string;
    is_default?: boolean;
}

export interface UpdateAddressData extends Partial<Omit<CreateAddressData, 'user_id'>> { }

class AddressModel {
    private async getDb() {
        return await DatabaseConnection.getInstance();
    }

    async create(data: CreateAddressData): Promise<Address> {
        const db = await this.getDb();

        // If this is the first address or set as default, handle default logic
        if (data.is_default) {
            await db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', data.user_id);
        } else {
            // Check if user has any addresses, if not, make this one default
            const count = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM addresses WHERE user_id = ?', data.user_id);
            if (count?.count === 0) {
                data.is_default = true;
            }
        }

        const result = await db.run(`
            INSERT INTO addresses (
                user_id, recipient_name, phone, province, city, 
                district, street, postal_code, is_default
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            data.user_id,
            data.recipient_name,
            data.phone,
            data.province,
            data.city,
            data.district || null,
            data.street,
            data.postal_code || null,
            data.is_default ? 1 : 0
        );

        return (await this.findById(result.lastID!))!;
    }

    async findById(id: number): Promise<Address | null> {
        const db = await this.getDb();
        return await db.get<Address>('SELECT * FROM addresses WHERE id = ?', id) || null;
    }

    async findByUserId(userId: number): Promise<Address[]> {
        const db = await this.getDb();
        return await db.all<Address[]>('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', userId);
    }

    async update(id: number, userId: number, data: UpdateAddressData): Promise<Address> {
        const db = await this.getDb();
        const address = await this.findById(id);

        if (!address) {
            throw new NotFoundError('Address not found');
        }

        if (address.user_id !== userId) {
            throw new ForbiddenError('Access denied');
        }

        // Handle default address logic
        if (data.is_default) {
            await db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', userId);
        }

        const updates: string[] = [];
        const values: any[] = [];

        const fields = ['recipient_name', 'phone', 'province', 'city', 'district', 'street', 'postal_code'];

        fields.forEach((field) => {
            if (data[field as keyof UpdateAddressData] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field as keyof UpdateAddressData]);
            }
        });

        if (data.is_default !== undefined) {
            updates.push('is_default = ?');
            values.push(data.is_default ? 1 : 0);
        }

        if (updates.length === 0) {
            return address;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await db.run(`
            UPDATE addresses
            SET ${updates.join(', ')}
            WHERE id = ?
        `, ...values);

        return (await this.findById(id))!;
    }

    async delete(id: number, userId: number): Promise<void> {
        const db = await this.getDb();
        const address = await this.findById(id);

        if (!address) {
            throw new NotFoundError('Address not found');
        }

        if (address.user_id !== userId) {
            throw new ForbiddenError('Access denied');
        }

        await db.run('DELETE FROM addresses WHERE id = ?', id);
    }
}

export default new AddressModel();
