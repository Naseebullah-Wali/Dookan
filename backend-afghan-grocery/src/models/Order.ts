import supabase from '../lib/supabaseClient';
import { NotFoundError } from '../utils/errors';
import { generateOrderNumber, generateTrackingNumber } from '../utils/auth';

export interface Order {
    id: number;
    order_number: string;
    user_id: number;
    address_id: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_method: 'cod' | 'card' | 'bank_transfer' | 'paypal' | 'trc20' | 'arbitrum' | 'stripe' | 'whatsapp';
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
    full_name: string;
    phone: string;
    street: string;
    city: string;
    state?: string;
    zip?: string;
    country?: string;
    is_default?: boolean;
}

export interface CreateOrderData {
    user_id: number;
    address_id?: number;
    address?: AddressData;
    payment_method: 'cod' | 'card' | 'bank_transfer' | 'paypal' | 'trc20' | 'arbitrum' | 'stripe' | 'whatsapp';
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
    async create(data: CreateOrderData): Promise<Order> {
        const orderNumber = generateOrderNumber();
        const total = data.subtotal + (data.shipping_fee || 0) + (data.tax || 0) - (data.discount || 0);

        // create address if provided
        let addressId = data.address_id;
        if (data.address) {
            const { data: addr, error: addrErr } = await supabase.from('addresses').insert({
                user_id: data.user_id,
                full_name: data.address.full_name,
                phone: data.address.phone,
                street: data.address.street,
                city: data.address.city,
                state: data.address.state || null,
                zip: data.address.zip || '',
                country: data.address.country || 'Afghanistan',
                is_default: data.address.is_default ? true : false
            }).select().single();
            if (addrErr) throw addrErr;
            addressId = (addr as any).id;
        }

        if (!addressId) throw new Error('Address ID or Address Data is required');

        // Map payment methods to database-allowed values
        const paymentMethodMap: Record<string, string> = {
            'cod': 'cod',
            'card': 'card',
            'stripe': 'card',
            'bank_transfer': 'bank_transfer',
            'trc20': 'bank_transfer',
            'arbitrum': 'bank_transfer',
            'paypal': 'paypal',
            'whatsapp': 'cod'
        };
        const dbPaymentMethod = paymentMethodMap[data.payment_method] || 'cod';

        const { data: createdOrder, error } = await supabase.from('orders').insert({
            order_number: orderNumber,
            user_id: data.user_id,
            address_id: addressId,
            payment_method: dbPaymentMethod,
            subtotal: data.subtotal,
            shipping_fee: data.shipping_fee || 0,
            tax: data.tax || 0,
            discount: data.discount || 0,
            total,
            notes: data.notes || null
        }).select().single();
        if (error) throw error;

        const orderId = (createdOrder as any).id;

        // insert order items
        const itemsPayload = data.items.map(i => ({
            order_id: orderId,
            product_id: i.product_id,
            product_name: i.product_name || (i as any).name || 'Unknown Product',
            product_image: i.product_image || null,
            quantity: i.quantity,
            price: i.price,
            subtotal: i.price * i.quantity
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload);
        if (itemsErr) throw itemsErr;

        return await this.findById(orderId) as Order;
    }

    async findById(id: number): Promise<Order | null> {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data as Order | null;
    }

    async findByOrderNumber(orderNumber: string): Promise<Order | null> {
        const { data, error } = await supabase.from('orders').select('*').eq('order_number', orderNumber).single();
        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data as Order | null;
    }

    async getOrderItems(orderId: number): Promise<OrderItem[]> {
        const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId);
        if (error) throw error;
        return data as OrderItem[];
    }

    async getOrderWithItems(orderId: number): Promise<any> {
        const order = await this.findById(orderId);
        if (!order) return null;
        const items = await this.getOrderItems(orderId);
        return { ...order, items };
    }

    async getAddressById(addressId: number) {
        const { data, error } = await supabase.from('addresses').select('*').eq('id', addressId).single();
        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data || null;
    }

    async getOrderWithItemsAndAddress(orderId: number): Promise<any> {
        const order = await this.findById(orderId);
        if (!order) return null;
        const items = await this.getOrderItems(orderId);
        const address = order.address_id ? await this.getAddressById(order.address_id) : null;
        return { ...order, items, address };
    }

    async update(id: number, data: UpdateOrderData): Promise<Order> {
        const order = await this.findById(id);
        if (!order) throw new NotFoundError('Order not found');

        const payload: any = {};
        if (data.status) payload.status = data.status;
        if (data.payment_status) payload.payment_status = data.payment_status;
        if (data.tracking_number) payload.tracking_number = data.tracking_number;
        if (data.notes !== undefined) payload.notes = data.notes;

        if (data.status === 'shipped' && !order.tracking_number && !data.tracking_number) {
            payload.tracking_number = generateTrackingNumber();
        }

        if (Object.keys(payload).length === 0) return order;

        const { data: updated, error } = await supabase.from('orders').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return updated as Order;
    }

    async getUserOrders(userId: number, limit: number = 50, offset: number = 0): Promise<any[]> {
        const from = offset;
        const to = offset + limit - 1;
        const { data: orders, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }).range(from, to);
        if (error) throw error;
        const ordersWithItems = await Promise.all((orders || []).map(async (order: any) => ({
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
        let q: any = supabase.from('orders').select('*');
        if (filters.status) q = q.eq('status', filters.status);
        if (filters.payment_status) q = q.eq('payment_status', filters.payment_status);
        if (filters.user_id) q = q.eq('user_id', filters.user_id);
        const from = offset;
        const to = offset + limit - 1;
        const { data, error } = await q.order('created_at', { ascending: false }).range(from, to);
        if (error) throw error;
        return data as Order[];
    }

    async count(filters: { status?: string; payment_status?: string; user_id?: number } = {}): Promise<number> {
        let q: any = supabase.from('orders').select('id', { head: true, count: 'exact' });
        if (filters.status) q = q.eq('status', filters.status);
        if (filters.payment_status) q = q.eq('payment_status', filters.payment_status);
        if (filters.user_id) q = q.eq('user_id', filters.user_id);
        const { count, error } = await q;
        if (error) throw error;
        return (count as number) || 0;
    }
}

export default new OrderModel();
