import DatabaseConnection from '../db/connection';
import { NotFoundError } from '../utils/errors';
import { generateOrderNumber, generateTrackingNumber } from '../utils/auth';

export interface Order {
    id: number;
    order_number: string;
    user_id: number;
    address_id: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_method: 'cod' | 'card' | 'bank_transfer';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    subtotal: number;
    shipping_fee: number;
    tax: number;
    discount: number;
    total: number;
    notes?: string;
    tracking_number?: string;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product_name: string;
    product_image?: string;
    quantity: number;
    price: number;
    subtotal: number;
    created_at: string;
}

export interface AddressData {
    recipient_name: string;
    phone: string;
    province: string;
    city: string;
    district?: string;
    street: string;
    postal_code?: string;
    is_default?: boolean;
}

export interface CreateOrderData {
    user_id: number;
    address_id?: number;
    address?: AddressData;
    payment_method: 'cod' | 'card' | 'bank_transfer';
    items: {
        product_id: number;
        product_name: string;
        product_image?: string;
        quantity: number;
        price: number;
    }[];
    subtotal: number;
    shipping_fee?: number;
    tax?: number;
    discount?: number;
    notes?: string;
}

export interface UpdateOrderData {
    status?: Order['status'];
    payment_status?: Order['payment_status'];
    tracking_number?: string;
    notes?: string;
}

class OrderModel {
    private async getDb() {
        return await DatabaseConnection.getInstance();
    }

    async create(data: CreateOrderData): Promise<Order> {
        const db = await this.getDb();
        const orderNumber = generateOrderNumber();
        const total = data.subtotal + (data.shipping_fee || 0) + (data.tax || 0) - (data.discount || 0);

        try {
            await db.run('BEGIN TRANSACTION');

            let addressId = data.address_id;

            // Create address if provided
            if (data.address) {
                const addressResult = await db.run(`
                    INSERT INTO addresses (
                        user_id, recipient_name, phone, province, city,
                        district, street, postal_code, is_default
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                    data.user_id,
                    data.address.recipient_name,
                    data.address.phone,
                    data.address.province,
                    data.address.city,
                    data.address.district || null,
                    data.address.street,
                    data.address.postal_code || null,
                    data.address.is_default ? 1 : 0
                );
                addressId = addressResult.lastID!;
            }

            if (!addressId) {
                throw new Error('Address ID or Address Data is required');
            }

            const result = await db.run(`
        INSERT INTO orders (
          order_number, user_id, address_id, payment_method,
          subtotal, shipping_fee, tax, discount, total, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
                orderNumber,
                data.user_id,
                addressId,
                data.payment_method,
                data.subtotal,
                data.shipping_fee || 0,
                data.tax || 0,
                data.discount || 0,
                total,
                data.notes || null
            );

            const orderId = result.lastID!;

            // Insert order items
            for (const item of data.items) {
                const itemSubtotal = item.price * item.quantity;
                await db.run(`
          INSERT INTO order_items (
            order_id, product_id, product_name, product_image,
            quantity, price, subtotal
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
                    orderId,
                    item.product_id,
                    item.product_name,
                    item.product_image || null,
                    item.quantity,
                    item.price,
                    itemSubtotal
                );
            }

            await db.run('COMMIT');
            return (await this.findById(orderId))!;

        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    }

    async findById(id: number): Promise<Order | null> {
        const db = await this.getDb();
        return await db.get<Order>('SELECT * FROM orders WHERE id = ?', id) || null;
    }

    async findByOrderNumber(orderNumber: string): Promise<Order | null> {
        const db = await this.getDb();
        return await db.get<Order>('SELECT * FROM orders WHERE order_number = ?', orderNumber) || null;
    }

    async getOrderItems(orderId: number): Promise<OrderItem[]> {
        const db = await this.getDb();
        return await db.all<OrderItem[]>('SELECT * FROM order_items WHERE order_id = ?', orderId);
    }

    async getOrderWithItems(orderId: number): Promise<any> {
        const order = await this.findById(orderId);
        if (!order) {
            return null;
        }

        const items = await this.getOrderItems(orderId);
        return { ...order, items };
    }

    async update(id: number, data: UpdateOrderData): Promise<Order> {
        const db = await this.getDb();
        const order = await this.findById(id);
        if (!order) {
            throw new NotFoundError('Order not found');
        }

        const updates: string[] = [];
        const values: any[] = [];

        if (data.status) {
            updates.push('status = ?');
            values.push(data.status);

            // Auto-generate tracking number when status changes to shipped
            if (data.status === 'shipped' && !order.tracking_number && !data.tracking_number) {
                updates.push('tracking_number = ?');
                values.push(generateTrackingNumber());
            }
        }

        if (data.payment_status) {
            updates.push('payment_status = ?');
            values.push(data.payment_status);
        }

        if (data.tracking_number) {
            updates.push('tracking_number = ?');
            values.push(data.tracking_number);
        }

        if (data.notes !== undefined) {
            updates.push('notes = ?');
            values.push(data.notes);
        }

        if (updates.length === 0) {
            return order;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await db.run(`
      UPDATE orders
      SET ${updates.join(', ')}
      WHERE id = ?
    `, ...values);

        return (await this.findById(id))!;
    }

    async getUserOrders(userId: number, limit: number = 50, offset: number = 0): Promise<any[]> {
        const db = await this.getDb();
        const orders = await db.all<Order[]>(`
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, userId, limit, offset);

        // Fetch items for each order (could be optimized with a join, but keeping it simple for now)
        const ordersWithItems = await Promise.all(orders.map(async (order) => ({
            ...order,
            items: await this.getOrderItems(order.id),
        })));

        return ordersWithItems;
    }

    async getAll(
        filters: {
            status?: string;
            payment_status?: string;
            user_id?: number;
        } = {},
        limit: number = 50,
        offset: number = 0
    ): Promise<Order[]> {
        const db = await this.getDb();
        let query = 'SELECT * FROM orders WHERE 1=1';
        const params: any[] = [];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.payment_status) {
            query += ' AND payment_status = ?';
            params.push(filters.payment_status);
        }

        if (filters.user_id) {
            query += ' AND user_id = ?';
            params.push(filters.user_id);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return await db.all<Order[]>(query, ...params);
    }

    async count(filters: { status?: string; payment_status?: string; user_id?: number } = {}): Promise<number> {
        const db = await this.getDb();
        let query = 'SELECT COUNT(*) as count FROM orders WHERE 1=1';
        const params: any[] = [];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.payment_status) {
            query += ' AND payment_status = ?';
            params.push(filters.payment_status);
        }

        if (filters.user_id) {
            query += ' AND user_id = ?';
            params.push(filters.user_id);
        }

        const result = await db.get<{ count: number }>(query, ...params);
        return result?.count || 0;
    }
}

export default new OrderModel();
