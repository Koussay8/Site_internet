import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET - Récupérer les statistiques du dashboard
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        // Récupérer les données en parallèle
        const [candidatesRes, jobsRes, playgroundsRes] = await Promise.all([
            supabase
                .from('candidates')
                .select('id, skills, match_score, created_at')
                .eq('user_id', user.userId),
            supabase
                .from('jobs')
                .select('id')
                .eq('user_id', user.userId)
                .eq('is_active', true),
            supabase
                .from('playgrounds')
                .select('id')
                .eq('user_id', user.userId),
        ]);

        const candidates = candidatesRes.data || [];
        const jobs = jobsRes.data || [];
        const playgrounds = playgroundsRes.data || [];

        // Calculer les statistiques
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const candidatesThisMonth = candidates.filter(c =>
            new Date(c.created_at) >= thisMonth
        ).length;

        // Calcul du score moyen
        const matchScores = candidates
            .filter(c => c.match_score != null)
            .map(c => c.match_score);
        const averageMatchScore = matchScores.length > 0
            ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
            : 0;

        // Top compétences
        const skillCounts: Record<string, number> = {};
        candidates.forEach(c => {
            (c.skills || []).forEach((skill: string) => {
                skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
        });

        const topSkills = Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));

        // Candidats par mois (6 derniers mois)
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const candidatesByMonth = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthIndex = date.getMonth();
            const year = date.getFullYear();

            const count = candidates.filter(c => {
                const created = new Date(c.created_at);
                return created.getMonth() === monthIndex && created.getFullYear() === year;
            }).length;

            candidatesByMonth.push({
                month: months[monthIndex],
                count,
            });
        }

        return NextResponse.json({
            totalCandidates: candidates.length,
            totalJobs: jobs.length,
            totalPlaygrounds: playgrounds.length,
            candidatesThisMonth,
            averageMatchScore,
            topSkills,
            candidatesByMonth,
        });

    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
