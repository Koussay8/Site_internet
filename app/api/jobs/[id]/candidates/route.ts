import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';

// GET - Liste des candidats associés à un poste (triés par score)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { id } = await params;

        const { data, error } = await supabase
            .from('job_candidates')
            .select(`
                id,
                match_score,
                matched_skills,
                missing_skills,
                explanation,
                added_at,
                candidate:candidates(id, name, email, phone, skills)
            `)
            .eq('job_id', id)
            .order('match_score', { ascending: false });

        if (error) {
            console.error('Error fetching job candidates:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Ajouter des candidats à un poste (avec calcul de score)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { id: jobId } = await params;
        const { candidateIds } = await request.json();

        if (!candidateIds || !Array.isArray(candidateIds)) {
            return NextResponse.json({ error: 'candidateIds requis' }, { status: 400 });
        }

        // Récupérer le job
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError || !job) {
            return NextResponse.json({ error: 'Poste non trouvé' }, { status: 404 });
        }

        // Récupérer les candidats
        const { data: candidates, error: candError } = await supabase
            .from('candidates')
            .select('*')
            .in('id', candidateIds);

        if (candError) {
            return NextResponse.json({ error: candError.message }, { status: 500 });
        }

        // Calculer les scores et insérer
        const jobSkills = (job.required_skills || []).map((s: string) => s.toLowerCase());
        const insertData = candidates?.map(candidate => {
            const candSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());
            const matched = jobSkills.filter((s: string) => candSkills.includes(s));
            const missing = jobSkills.filter((s: string) => !candSkills.includes(s));
            const score = jobSkills.length > 0
                ? Math.round((matched.length / jobSkills.length) * 100)
                : 50;

            return {
                job_id: jobId,
                candidate_id: candidate.id,
                match_score: score,
                matched_skills: matched,
                missing_skills: missing,
                explanation: `${matched.length}/${jobSkills.length} compétences requises`
            };
        }) || [];

        // Upsert pour éviter les doublons
        const { data, error } = await supabase
            .from('job_candidates')
            .upsert(insertData, { onConflict: 'job_id,candidate_id' })
            .select();

        if (error) {
            console.error('Error adding candidates:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, added: data?.length || 0 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// DELETE - Retirer un candidat d'un poste
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { id: jobId } = await params;
        const { candidateId } = await request.json();

        if (!candidateId) {
            return NextResponse.json({ error: 'candidateId requis' }, { status: 400 });
        }

        const { error } = await supabase
            .from('job_candidates')
            .delete()
            .eq('job_id', jobId)
            .eq('candidate_id', candidateId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
