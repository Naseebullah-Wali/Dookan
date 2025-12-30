import supabase from '../lib/supabaseClient';
import { NotFoundError, ConflictError } from '../utils/errors';
import { retry } from '../utils/retry';

export interface User {
    id: string; // UUID from auth.users
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'customer' | 'admin';
    is_verified?: number;
    created_at: string;
    updated_at: string;
}

export interface CreateUserData {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: 'customer' | 'admin';
    is_verified?: number;
}

export interface UpdateUserData {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
}

class UserModel {
    /**
     * Create a user using Supabase Auth's admin API.
     * This creates the user in auth.users table.
     * Supabase trigger will automatically create the corresponding profile.
     */
    async create(data: CreateUserData): Promise<User> {
        try {
            // Use Supabase Auth admin API to create user in auth.users
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: data.email,
                password: data.password,
                user_metadata: {
                    name: data.name,
                    phone: data.phone,
                },
            });

            if (authError || !authUser?.user) {
                console.error('Auth user creation error:', authError);
                throw authError || new Error('Failed to create auth user');
            }

            // Now create/update the profile with additional role information
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authUser.user.id,
                    name: data.name,
                    phone: data.phone || null,
                    role: data.role || 'customer',
                }, { onConflict: 'id' })
                .select()
                .single();

            if (profileError) {
                console.error('Profile creation error:', profileError);
                throw profileError;
            }

            return {
                id: authUser.user.id,
                email: authUser.user.email || '',
                password: '', // Don't return password
                name: data.name,
                phone: data.phone || '',
                role: profileData?.role || 'customer',
                is_verified: authUser.user.email_confirmed_at ? 1 : 0,
                created_at: authUser.user.created_at || new Date().toISOString(),
                updated_at: authUser.user.updated_at || new Date().toISOString(),
            };
        } catch (err: any) {
            console.error('UserModel.create error:', err);
            throw err;
        }
    }

    async findById(id: string): Promise<User | null> {
        try {
            return await retry(async () => {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (profileError && profileError.code === 'PGRST116') return null;
                if (profileError) throw profileError;

                // Get email from auth.users via a join or fetch separately
                let email = '';
                try {
                    const { data: authUser } = await supabase.auth.admin.getUserById(id);
                    email = authUser?.user?.email || '';
                } catch (err) {
                    // If we can't fetch from auth, that's okay; email will be empty
                }

                return {
                    id: profile.id,
                    email,
                    password: '',
                    name: profile.name,
                    phone: profile.phone,
                    role: profile.role,
                    created_at: profile.created_at,
                    updated_at: profile.updated_at,
                };
            }, { maxAttempts: 3, initialDelay: 200, maxDelay: 3000 });
        } catch (err: any) {
            console.error('UserModel.findById error:', err);
            throw err;
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            // Query auth.users by email, then fetch the corresponding profile
            const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
            if (authError) throw authError;

            const authUser = (authUsers?.users as any)?.find((u: any) => u.email === email);
            if (!authUser) return null;

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (profileError && profileError.code === 'PGRST116') return null;
            if (profileError) throw profileError;

            return {
                id: profile.id,
                email,
                password: '',
                name: profile.name,
                phone: profile.phone,
                role: profile.role,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
            };
        } catch (err: any) {
            console.error('UserModel.findByEmail error:', err);
            // If admin API is unavailable, fall back to a simple approach
            return null;
        }
    }

    async update(id: string, data: UpdateUserData): Promise<User> {
        try {
            const existing = await this.findById(id);
            if (!existing) throw new NotFoundError('User not found');

            const payload: any = {};
            if (data.name !== undefined) payload.name = data.name;
            if (data.phone !== undefined) payload.phone = data.phone;

            // First check if profile exists in profiles table
            const { data: profileExists, error: checkError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', id)
                .single();

            if (!profileExists) {
                // Profile doesn't exist, create it first
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({ id, ...payload });
                if (insertError) throw insertError;
                return {
                    id,
                    email: existing.email,
                    password: '',
                    name: data.name || '',
                    phone: data.phone || undefined,
                    role: 'customer',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
            }

            const { data: updated, error } = await supabase
                .from('profiles')
                .update(payload)
                .eq('id', id)
                .select();

            if (error) throw error;
            if (!updated || updated.length === 0) throw new NotFoundError('Failed to update user profile');

            const profile = updated[0];
            return {
                id: profile.id,
                email: existing.email,
                password: '',
                name: profile.name,
                phone: profile.phone,
                role: profile.role,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
            };
        } catch (err: any) {
            console.error('UserModel.update error:', err);
            throw err;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) throw error;
        } catch (err: any) {
            console.error('UserModel.delete error:', err);
            throw err;
        }
    }

    async getAll(limit: number = 50, offset: number = 0): Promise<User[]> {
        try {
            const from = offset;
            const to = offset + limit - 1;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            // For each profile, we'd ideally fetch the email, but for now return with empty email
            return (data || []).map((p) => ({
                id: p.id,
                email: '',
                password: '',
                name: p.name,
                phone: p.phone,
                role: p.role,
                created_at: p.created_at,
                updated_at: p.updated_at,
            }));
        } catch (err: any) {
            console.error('UserModel.getAll error:', err);
            throw err;
        }
    }

    async count(): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('profiles')
                .select('id', { head: true, count: 'exact' });

            if (error) throw error;
            return (count as number) || 0;
        } catch (err: any) {
            console.error('UserModel.count error:', err);
            throw err;
        }
    }

    private _generateUUID(): string {
        // Simple UUID v4 generator for fallback
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}

export default new UserModel();
