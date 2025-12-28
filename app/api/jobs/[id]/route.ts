import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET - Récupérer un poste par ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const { id } = await params;

        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.userId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Poste non trouvé' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// PUT - Mettre à jour un poste
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const { id } = await params;
        const body = await request.json();

        const { data, error } = await supabase
            .from('jobs')
            .update({
                title: body.title,
                description: body.description,
                required_skills: body.required_skills,
                min_experience: body.min_experience,
                is_active: body.is_active,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user.userId)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// DELETE - Supprimer un poste
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const { id } = await params;

        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id)
            .eq('user_id', user.userId);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
