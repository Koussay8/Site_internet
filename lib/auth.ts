import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface AuthUser {
    userId: string;
    email: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);

        // Verify token using Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Auth verification failed:', error?.message);
            return null;
        }

        // Get client data from clients table
        const { data: client } = await supabase
            .from('clients')
            .select('id, email')
            .eq('auth_uid', user.id)
            .single();

        if (!client) {
            console.error('Client not found for auth_uid:', user.id);
            return null;
        }

        return {
            userId: client.id,
            email: client.email,
        };
    } catch (error) {
        console.error('Auth verification failed:', error);
        return null;
    }
}

export function unauthorizedResponse() {
    return Response.json({ error: 'Non autorisé' }, { status: 401 });
}
