import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// POST - Créer un nouvel utilisateur (admin seulement)
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        // Vérifier que c'est un admin (email se terminant par @nova.com par exemple)
        if (!user.email?.endsWith('@nova.com')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const body = await request.json();
        const { email, password, company_name } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
        }

        // Vérifier si l'utilisateur existe déjà
        const { data: existing } = await supabase
            .from('clients')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Cet email existe déjà' }, { status: 400 });
        }

        // Hasher le mot de passe
        const password_hash = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const { data, error } = await supabase
            .from('clients')
            .insert({
                email: email.toLowerCase(),
                password_hash,
                company_name: company_name || 'Ma Société',
            })
            .select('id, email, company_name, created_at')
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            user: data,
            message: 'Utilisateur créé avec succès'
        }, { status: 201 });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// GET - Lister tous les utilisateurs (admin seulement)
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        if (!user.email?.endsWith('@nova.com')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('clients')
            .select('id, email, company_name, created_at, last_login')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
