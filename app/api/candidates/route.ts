import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET - Liste tous les candidats de l'utilisateur
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sort_by') || 'created_at';

        let query = supabase
            .from('candidates')
            .select('*')
            .eq('user_id', user.userId);

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        if (sortBy === 'match_score') {
            query = query.order('match_score', { ascending: false, nullsFirst: false });
        } else {
            query = query.order('created_at', { ascending: false });
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

// POST - Créer un nouveau candidat
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const body = await request.json();

        const candidateData = {
            ...body,
            user_id: user.userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('candidates')
            .insert(candidateData)
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
