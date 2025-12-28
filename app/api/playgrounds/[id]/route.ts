import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET - Récupérer un playground par ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const { id } = await params;

        const { data, error } = await supabase
            .from('playgrounds')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.userId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Playground non trouvé' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// PUT - Mettre à jour un playground
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
            .from('playgrounds')
            .update({
                name: body.name,
                description: body.description,
                color: body.color,
                candidate_ids: body.candidate_ids,
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

// DELETE - Supprimer un playground
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const { id } = await params;

        const { error } = await supabase
            .from('playgrounds')
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
