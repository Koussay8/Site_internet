import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        console.log('Login attempt for email:', email);

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            );
        }

        // Authenticate with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password,
        });

        if (authError || !authData.user) {
            console.log('Supabase Auth error:', authError?.message);
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            );
        }

        console.log('Supabase Auth success, user id:', authData.user.id);

        // Get linked client from clients table
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('auth_uid', authData.user.id)
            .single();

        if (clientError || !client) {
            console.log('Client not found for auth_uid:', authData.user.id);
            return NextResponse.json(
                { error: 'Compte utilisateur non configuré' },
                { status: 401 }
            );
        }

        // Update last_login
        await supabase
            .from('clients')
            .update({ last_login: new Date().toISOString() })
            .eq('id', client.id);

        // Return client data and Supabase session
        const { password_hash: _, ...clientWithoutPassword } = client;

        console.log('Login successful for:', client.email);

        return NextResponse.json({
            token: authData.session?.access_token,
            refreshToken: authData.session?.refresh_token,
            user: clientWithoutPassword,
            message: 'Connexion réussie'
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
