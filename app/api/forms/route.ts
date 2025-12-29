import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET - Liste tous les formulaires de l'utilisateur
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const { data, error } = await supabase
            .from('forms')
            .select('*')
            .eq('user_id', user.userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Créer un nouveau formulaire
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const body = await request.json();

        // Générer un slug unique pour le lien public
        const slug = generateSlug(body.title);

        const formData = {
            title: body.title,
            description: body.description || '',
            job_id: body.job_id || null,
            fields: body.fields || [
                { id: '1', type: 'text', label: 'Nom complet', required: true },
                { id: '2', type: 'email', label: 'Email', required: true },
                { id: '3', type: 'file', label: 'CV (PDF)', required: true },
            ],
            is_active: body.is_active !== false,
            slug: slug,
            user_id: user.userId,
        };

        const { data, error } = await supabase
            .from('forms')
            .insert(formData)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Retourner le lien public
        return NextResponse.json({
            ...data,
            public_url: `/apply/${data.id}`,
        }, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// Génère un slug à partir du titre
function generateSlug(title: string): string {
    const base = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${randomSuffix}`;
}
