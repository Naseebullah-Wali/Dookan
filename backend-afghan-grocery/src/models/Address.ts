import supabase from '../lib/supabaseClient';
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
    async create(data: CreateAddressData): Promise<Address> {
        // If default, clear others
        if (data.is_default) {
            await supabase.from('addresses').update({ is_default: false }).eq('user_id', data.user_id);
        } else {
            const { count } = await supabase.from('addresses').select('id', { head: true, count: 'exact' }).eq('user_id', data.user_id);
            if ((count || 0) === 0) data.is_default = true;
        }

        const { data: created, error } = await supabase.from('addresses').insert({
            user_id: data.user_id,
            recipient_name: data.recipient_name,
            phone: data.phone,
            province: data.province,
            city: data.city,
            district: data.district || null,
            street: data.street,
            postal_code: data.postal_code || null,
            is_default: data.is_default ? true : false
        }).select().single();
        if (error) throw error;
        return created as Address;
    }

    async findById(id: number): Promise<Address | null> {
        const { data, error } = await supabase.from('addresses').select('*').eq('id', id).single();
        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data as Address | null;
    }

    async findByUserId(userId: number): Promise<Address[]> {
        const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async update(id: number, userId: number, data: UpdateAddressData): Promise<Address> {
        const address = await this.findById(id);
        if (!address) throw new NotFoundError('Address not found');
        if (address.user_id !== userId) throw new ForbiddenError('Access denied');

        if ((data as any).is_default) {
            await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
        }

        const payload: any = {};
        const fields = ['recipient_name', 'phone', 'province', 'city', 'district', 'street', 'postal_code'];
        fields.forEach((f) => {
            if ((data as any)[f] !== undefined) payload[f] = (data as any)[f];
        });
        if ((data as any).is_default !== undefined) payload.is_default = (data as any).is_default ? true : false;

        const { data: updated, error } = await supabase.from('addresses').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return updated as Address;
    }

    async delete(id: number, userId: number): Promise<void> {
        const address = await this.findById(id);
        if (!address) throw new NotFoundError('Address not found');
        if (address.user_id !== userId) throw new ForbiddenError('Access denied');

        const { error } = await supabase.from('addresses').delete().eq('id', id);
        if (error) throw error;
    }
}

export default new AddressModel();
