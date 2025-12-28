import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET - Liste tous les postes de l'utilisateur
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const activeOnly = searchParams.get('active') === 'true';

        let query = supabase
            .from('jobs')
            .select('*')
            .eq('user_id', user.userId)
            .order('created_at', { ascending: false });

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

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

// POST - Créer un nouveau poste
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const body = await request.json();

        const jobData = {
            title: body.title,
            description: body.description || '',
            required_skills: body.required_skills || [],
            min_experience: body.min_experience || 0,
            is_active: body.is_active !== false,
            user_id: user.userId,
        };

        const { data, error } = await supabase
            .from('jobs')
            .insert(jobData)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
