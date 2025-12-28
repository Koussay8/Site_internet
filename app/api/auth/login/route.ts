import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

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

        // Get client from Supabase (table: clients, field: email)
        const { data: client, error } = await supabase
            .from('clients')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        console.log('Supabase query result:', { client, error });

        if (error || !client) {
            console.log('Client not found:', error?.message);
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, client.password_hash);
        console.log('Password validation:', isValidPassword);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            );
        }

        // Update last_login
        await supabase
            .from('clients')
            .update({ last_login: new Date().toISOString() })
            .eq('id', client.id);

        // Create JWT token
        const token = await new SignJWT({
            userId: client.id,
            email: client.email,
            companyName: client.company_name,
            applications: client.applications || [],
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        // Return client data (without password) and token
        const { password_hash: _, ...clientWithoutPassword } = client;

        console.log('Login successful for:', client.email);

        return NextResponse.json({
            token,
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
