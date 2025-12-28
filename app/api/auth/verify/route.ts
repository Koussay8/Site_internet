import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Verify: Token manquant');
            return NextResponse.json(
                { error: 'Token manquant' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        // Verify JWT token
        const { payload } = await jwtVerify(token, JWT_SECRET);
        console.log('Verify: Token valid, userId:', payload.userId);

        // Get fresh client data from Supabase (table: clients, not users!)
        const { data: client, error } = await supabase
            .from('clients')
            .select('id, email, company_name, applications, is_active, created_at')
            .eq('id', payload.userId)
            .single();

        if (error || !client) {
            console.log('Verify: Client not found:', error?.message);
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 401 }
            );
        }

        console.log('Verify: Success for:', client.email);

        return NextResponse.json({
            valid: true,
            user: client,
        });

    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json(
            { error: 'Token invalide ou expiré' },
            { status: 401 }
        );
    }
}
