import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// POST - Ajouter un candidat à un playground
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const { id } = await params;
        const body = await request.json();
        const candidateId = body.candidate_id;

        if (!candidateId) {
            return NextResponse.json({ error: 'candidate_id requis' }, { status: 400 });
        }

        // Récupérer le playground actuel
        const { data: playground, error: fetchError } = await supabase
            .from('playgrounds')
            .select('candidate_ids')
            .eq('id', id)
            .eq('user_id', user.userId)
            .single();

        if (fetchError || !playground) {
            return NextResponse.json({ error: 'Playground non trouvé' }, { status: 404 });
        }

        // Ajouter le candidat s'il n'est pas déjà présent
        const currentIds = playground.candidate_ids || [];
        if (!currentIds.includes(candidateId)) {
            currentIds.push(candidateId);
        }

        // Mettre à jour le playground
        const { data, error } = await supabase
            .from('playgrounds')
            .update({
                candidate_ids: currentIds,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Mettre à jour le candidat pour inclure ce playground (mise à jour directe)
        try {
            const { data: candidate } = await supabase
                .from('candidates')
                .select('playground_ids')
                .eq('id', candidateId)
                .single();

            if (candidate) {
                const playgroundIds = candidate.playground_ids || [];
                if (!playgroundIds.includes(id)) {
                    playgroundIds.push(id);
                    await supabase
                        .from('candidates')
                        .update({ playground_ids: playgroundIds })
                        .eq('id', candidateId);
                }
            }
        } catch {
            // Ignorer les erreurs de mise à jour du candidat
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// DELETE - Retirer un candidat d'un playground
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const candidateId = searchParams.get('candidate_id');

        if (!candidateId) {
            return NextResponse.json({ error: 'candidate_id requis' }, { status: 400 });
        }

        // Récupérer le playground actuel
        const { data: playground, error: fetchError } = await supabase
            .from('playgrounds')
            .select('candidate_ids')
            .eq('id', id)
            .eq('user_id', user.userId)
            .single();

        if (fetchError || !playground) {
            return NextResponse.json({ error: 'Playground non trouvé' }, { status: 404 });
        }

        // Retirer le candidat
        const currentIds = (playground.candidate_ids || []).filter(
            (cid: string) => cid !== candidateId
        );

        // Mettre à jour le playground
        const { data, error } = await supabase
            .from('playgrounds')
            .update({
                candidate_ids: currentIds,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
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
