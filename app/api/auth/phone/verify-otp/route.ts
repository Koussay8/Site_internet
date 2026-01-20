import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mock OTP storage (must match send-otp route)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
    try {
        const { phone, code } = await request.json();

        if (!phone || !code) {
            return NextResponse.json(
                { error: 'Numéro et code requis' },
                { status: 400 }
            );
        }

        // Verify OTP from store
        const stored = otpStore.get(phone);

        if (!stored) {
            return NextResponse.json(
                { error: 'Code expiré ou invalide' },
                { status: 401 }
            );
        }

        if (stored.expiresAt < Date.now()) {
            otpStore.delete(phone);
            return NextResponse.json(
                { error: 'Code expiré' },
                { status: 401 }
            );
        }

        if (stored.code !== code) {
            return NextResponse.json(
                { error: 'Code incorrect' },
                { status: 401 }
            );
        }

        // OTP is valid, delete it
        otpStore.delete(phone);

        // Check if user exists with this phone
        const { data: existingClient, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('phone', phone)
            .single();

        let client;

        if (clientError && clientError.code !== 'PGRST116') {
            console.error('Error checking existing client:', clientError);
        }

        if (existingClient) {
            // Update last login
            await supabase
                .from('clients')
                .update({ last_login: new Date().toISOString() })
                .eq('id', existingClient.id);

            client = existingClient;
        } else {
            // Create new client with phone
            const { data: newClient, error: insertError } = await supabase
                .from('clients')
                .insert({
                    phone,
                    email: `${phone}@phone.vextra.tech`, // Dummy email
                    company_name: 'Via Téléphone',
                    is_verified: true,
                    password_hash: null,
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString(),
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating client:', insertError);
                return NextResponse.json(
                    { error: 'Erreur lors de la création du compte' },
                    { status: 500 }
                );
            }

            client = newClient;
        }

        // Generate a simple token (in production, use proper JWT)
        const token = Buffer.from(`${client.id}:${Date.now()}`).toString('base64');

        const { password_hash: _, ...clientWithoutPassword } = client;

        return NextResponse.json({
            success: true,
            token,
            user: clientWithoutPassword,
            message: 'Connexion réussie',
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
