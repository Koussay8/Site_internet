import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

        // Verify token with Supabase Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.log('Verify: Invalid token:', authError?.message);
            return NextResponse.json(
                { error: 'Token invalide ou expiré' },
                { status: 401 }
            );
        }

        console.log('Verify: Token valid, user id:', user.id);

        // Get linked client data
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('id, email, company_name, applications, is_active, created_at')
            .eq('auth_uid', user.id)
            .single();

        if (clientError || !client) {
            console.log('Verify: Client not found:', clientError?.message);
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
