import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { email, password, companyName } = await request.json();

        console.log('Register attempt for email:', email);

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 6 caractères' },
                { status: 400 }
            );
        }

        // Register with Supabase Auth
        // The trigger will automatically create the client row
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.toLowerCase(),
            password,
            options: {
                data: {
                    company_name: companyName || 'Mon Entreprise',
                }
            }
        });

        if (authError) {
            console.log('Supabase Auth signup error:', authError.message);

            // Handle specific errors
            if (authError.message.includes('already registered')) {
                return NextResponse.json(
                    { error: 'Cet email est déjà utilisé' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Erreur lors de la création du compte' },
                { status: 500 }
            );
        }

        console.log('User created successfully:', authData.user.id);

        // Wait a short moment for trigger to execute, then fetch client
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('auth_uid', authData.user.id)
            .single();

        if (clientError) {
            console.log('Warning: Could not fetch client immediately:', clientError.message);
        }

        // Check if email confirmation is required
        const needsConfirmation = !authData.session;

        return NextResponse.json({
            success: true,
            needsConfirmation,
            user: client ? {
                id: client.id,
                email: client.email,
                company_name: client.company_name,
            } : {
                id: authData.user.id,
                email: authData.user.email,
            },
            token: authData.session?.access_token,
            message: needsConfirmation
                ? 'Compte créé ! Vérifiez votre email pour confirmer.'
                : 'Compte créé avec succès !'
        });

    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
