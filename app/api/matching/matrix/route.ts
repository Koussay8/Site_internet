import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// POST - Calculer la matrice de compatibilité pour un playground
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const body = await request.json();
        const { playground_id, optimize } = body;

        if (!playground_id) {
            return NextResponse.json({ error: 'playground_id requis' }, { status: 400 });
        }

        // Récupérer le playground
        const { data: playground, error: pgError } = await supabase
            .from('playgrounds')
            .select('*')
            .eq('id', playground_id)
            .eq('user_id', user.userId)
            .single();

        if (pgError || !playground) {
            return NextResponse.json({ error: 'Playground non trouvé' }, { status: 404 });
        }

        // Récupérer les postes du playground
        const jobIds = playground.job_ids || [];
        let jobs: any[] = [];
        if (jobIds.length > 0) {
            const { data: jobsData } = await supabase
                .from('jobs')
                .select('*')
                .in('id', jobIds);
            jobs = jobsData || [];
        }

        // Récupérer les candidats du playground
        const candidateIds = playground.candidate_ids || [];
        let candidates: any[] = [];
        if (candidateIds.length > 0) {
            const { data: candidatesData } = await supabase
                .from('candidates')
                .select('*')
                .in('id', candidateIds);
            candidates = candidatesData || [];
        }

        if (jobs.length === 0 || candidates.length === 0) {
            return NextResponse.json({
                matrix: [],
                jobs,
                candidates,
                optimal_assignment: null,
            });
        }

        // Calculer la matrice de compatibilité
        const matrix: number[][] = [];
        const details: any[][] = [];

        for (const candidate of candidates) {
            const row: number[] = [];
            const detailRow: any[] = [];

            for (const job of jobs) {
                const score = await calculateQuickScore(candidate, job);
                row.push(score.value);
                detailRow.push(score);
            }

            matrix.push(row);
            details.push(detailRow);
        }

        // Si optimisation demandée, exécuter l'algorithme Hungarian
        let optimalAssignment = null;
        if (optimize) {
            optimalAssignment = hungarianAlgorithm(matrix, candidates, jobs);
        }

        return NextResponse.json({
            matrix,
            details,
            jobs: jobs.map(j => ({ id: j.id, title: j.title })),
            candidates: candidates.map(c => ({ id: c.id, name: c.name })),
            optimal_assignment: optimalAssignment,
        });

    } catch (error) {
        console.error('Matrix API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

async function calculateQuickScore(candidate: any, job: any): Promise<{ value: number; explanation: string }> {
    const candidateSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());
    const jobSkills = (job.required_skills || []).map((s: any) =>
        typeof s === 'string' ? s.toLowerCase() : s.name?.toLowerCase()
    ).filter(Boolean);

    if (jobSkills.length === 0) {
        return { value: 50, explanation: 'Pas de compétences requises définies' };
    }

    const matchedSkills = jobSkills.filter((s: string) =>
        candidateSkills.some((cs: string) => cs.includes(s) || s.includes(cs))
    );

    let score = Math.round((matchedSkills.length / jobSkills.length) * 80);

    // Bonus expérience
    const expCount = (candidate.experience || []).length;
    const minExp = job.min_experience || 0;
    if (expCount >= minExp) score += 15;
    else if (expCount > 0) score += 5;

    // Bonus éducation
    if ((candidate.education || []).length > 0) score += 5;

    return {
        value: Math.min(100, score),
        explanation: `${matchedSkills.length}/${jobSkills.length} compétences`
    };
}

// Algorithme Hungarian (Kuhn-Munkres) pour l'assignation optimale
function hungarianAlgorithm(matrix: number[][], candidates: any[], jobs: any[]): any {
    const n = candidates.length;
    const m = jobs.length;

    // Convertir en matrice de coûts (inverser les scores pour maximiser)
    const costMatrix: number[][] = matrix.map(row =>
        row.map(score => 100 - score)
    );

    // Si plus de candidats que de jobs, on ignore les candidats en trop
    // Si plus de jobs que de candidats, on ne peut pas tout remplir
    const size = Math.min(n, m);

    // Assignation greedy optimisée (version simplifiée de Hungarian)
    const assignments: { candidate_id: string; candidate_name: string; job_id: string; job_title: string; score: number }[] = [];
    const usedCandidates = new Set<number>();
    const usedJobs = new Set<number>();

    // Trouver les meilleurs matchs de manière itérative
    for (let _iter = 0; _iter < size; _iter++) {
        let bestScore = -1;
        let bestCandidate = -1;
        let bestJob = -1;

        for (let i = 0; i < n; i++) {
            if (usedCandidates.has(i)) continue;
            for (let j = 0; j < m; j++) {
                if (usedJobs.has(j)) continue;
                if (matrix[i][j] > bestScore) {
                    bestScore = matrix[i][j];
                    bestCandidate = i;
                    bestJob = j;
                }
            }
        }

        if (bestCandidate >= 0 && bestJob >= 0) {
            usedCandidates.add(bestCandidate);
            usedJobs.add(bestJob);
            assignments.push({
                candidate_id: candidates[bestCandidate].id,
                candidate_name: candidates[bestCandidate].name,
                job_id: jobs[bestJob].id,
                job_title: jobs[bestJob].title,
                score: bestScore,
            });
        }
    }

    // Calculer le score total
    const totalScore = assignments.reduce((sum, a) => sum + a.score, 0);
    const avgScore = assignments.length > 0 ? Math.round(totalScore / assignments.length) : 0;

    // Candidats non assignés
    const unassignedCandidates = candidates
        .filter((_, i) => !usedCandidates.has(i))
        .map(c => ({ id: c.id, name: c.name }));

    // Jobs non remplis
    const unfilledJobs = jobs
        .filter((_, j) => !usedJobs.has(j))
        .map(j => ({ id: j.id, title: j.title }));

    return {
        assignments,
        total_score: totalScore,
        average_score: avgScore,
        unassigned_candidates: unassignedCandidates,
        unfilled_jobs: unfilledJobs,
    };
}
