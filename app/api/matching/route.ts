import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// POST - Calculer la compatibilité d'un ou plusieurs candidats avec un poste
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const body = await request.json();
        const { job_id, candidate_ids, filter_all } = body;

        if (!job_id) {
            return NextResponse.json({ error: 'job_id requis' }, { status: 400 });
        }

        // Récupérer le poste
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', job_id)
            .eq('user_id', user.userId)
            .single();

        if (jobError || !job) {
            return NextResponse.json({ error: 'Poste non trouvé' }, { status: 404 });
        }

        // Récupérer les candidats
        let candidatesQuery = supabase
            .from('candidates')
            .select('*')
            .eq('user_id', user.userId);

        if (!filter_all && candidate_ids && candidate_ids.length > 0) {
            candidatesQuery = candidatesQuery.in('id', candidate_ids);
        }

        const { data: candidates, error: candidatesError } = await candidatesQuery;

        if (candidatesError || !candidates || candidates.length === 0) {
            return NextResponse.json({ results: [] });
        }

        // Calculer les scores de compatibilité
        const results = await Promise.all(
            candidates.map(async (candidate) => {
                const score = await calculateCompatibility(candidate, job);
                return {
                    candidate_id: candidate.id,
                    candidate_name: candidate.name,
                    candidate_email: candidate.email,
                    candidate_skills: candidate.skills || [],
                    score,
                    explanation: score.explanation,
                };
            })
        );

        // Trier par score décroissant
        results.sort((a, b) => b.score.value - a.score.value);

        return NextResponse.json({ results, job });

    } catch (error) {
        console.error('Matching API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

interface CompatibilityScore {
    value: number; // 0-100
    explanation: string;
    matchedSkills: string[];
    missingSkills: string[];
}

async function calculateCompatibility(candidate: any, job: any): Promise<CompatibilityScore> {
    const candidateSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());
    const jobSkills = (job.required_skills || []).map((s: any) =>
        typeof s === 'string' ? s.toLowerCase() : s.name?.toLowerCase()
    ).filter(Boolean);

    // Calcul basique des skills matchées
    const matchedSkills = jobSkills.filter((s: string) =>
        candidateSkills.some((cs: string) => cs.includes(s) || s.includes(cs))
    );
    const missingSkills = jobSkills.filter((s: string) => !matchedSkills.includes(s));

    // Score de base basé sur les compétences
    let baseScore = jobSkills.length > 0
        ? Math.round((matchedSkills.length / jobSkills.length) * 70)
        : 50;

    // Bonus pour l'expérience
    const experienceYears = (candidate.experience || []).length;
    const minExp = job.min_experience || 0;
    if (experienceYears >= minExp) {
        baseScore += 15;
    } else if (experienceYears > 0) {
        baseScore += 5;
    }

    // Bonus pour les formations pertinentes
    if (candidate.education && candidate.education.length > 0) {
        baseScore += 10;
    }

    // Cap à 100
    baseScore = Math.min(100, baseScore);

    // Si Groq est disponible, enrichir avec l'IA
    if (GROQ_API_KEY && candidate.cv_text) {
        try {
            const aiScore = await getAICompatibility(candidate, job);
            if (aiScore) {
                // Moyenne pondérée: 60% IA, 40% calcul basique
                baseScore = Math.round(aiScore.value * 0.6 + baseScore * 0.4);
                return {
                    value: baseScore,
                    explanation: aiScore.explanation,
                    matchedSkills: matchedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                    missingSkills: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                };
            }
        } catch (e) {
            console.error('AI scoring failed:', e);
        }
    }

    const explanation = baseScore >= 80
        ? 'Excellent match! Compétences et expérience correspondent bien.'
        : baseScore >= 60
            ? 'Bon profil avec quelques compétences manquantes.'
            : baseScore >= 40
                ? 'Profil partiel, formation possible recommandée.'
                : 'Profil peu adapté pour ce poste.';

    return {
        value: baseScore,
        explanation,
        matchedSkills: matchedSkills.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)),
        missingSkills: missingSkills.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)),
    };
}

async function getAICompatibility(candidate: any, job: any): Promise<{ value: number; explanation: string } | null> {
    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `Tu es un expert RH. Évalue la compatibilité entre un candidat et un poste.
Retourne UNIQUEMENT un JSON: {"score": 0-100, "explanation": "Explication courte en français"}`
                    },
                    {
                        role: 'user',
                        content: `POSTE: ${job.title}
Description: ${job.description || 'Non spécifié'}
Compétences requises: ${JSON.stringify(job.required_skills || [])}
Expérience min: ${job.min_experience || 0} ans

CANDIDAT: ${candidate.name}
Compétences: ${JSON.stringify(candidate.skills || [])}
Expériences: ${(candidate.experience || []).length} postes
CV: ${(candidate.cv_text || '').substring(0, 2000)}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 200,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
                const parsed = JSON.parse(match[0]);
                return {
                    value: Math.min(100, Math.max(0, parsed.score || 50)),
                    explanation: parsed.explanation || '',
                };
            }
        }
    } catch (e) {
        console.error('AI compatibility error:', e);
    }
    return null;
}
