import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// POST - Recherche IA sémantique dans les candidats
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const body = await request.json();
        const { query, filters } = body;

        if (!query) {
            return NextResponse.json({ error: 'Query requis' }, { status: 400 });
        }

        // Récupérer tous les candidats de l'utilisateur
        let candidatesQuery = supabase
            .from('candidates')
            .select('*')
            .eq('user_id', user.userId);

        const { data: candidates, error } = await candidatesQuery;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!candidates || candidates.length === 0) {
            return NextResponse.json({ results: [], message: 'Aucun candidat trouvé' });
        }

        // Préparer le contexte des candidats pour l'IA
        const candidatesSummary = candidates.map((c, i) =>
            `[${i}] ${c.name}: Skills: ${(c.skills || []).join(', ')}. ` +
            `Email: ${c.email || 'N/A'}. ` +
            `Experience: ${(c.experience || []).length} postes.`
        ).join('\n');

        // Si GROQ_API_KEY est configuré, utiliser l'IA
        if (GROQ_API_KEY) {
            try {
                const aiResponse = await fetch(GROQ_API_URL, {
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
                                content: `Tu es un assistant de recrutement expert. Tu dois analyser une liste de candidats et retourner les indices des candidats qui correspondent le mieux à la recherche de l'utilisateur.

Voici la liste des candidats:
${candidatesSummary}

Réponds UNIQUEMENT avec un JSON valide contenant:
{
  "matches": [indices des candidats correspondants, triés par pertinence],
  "reasoning": "Explication courte de pourquoi ces candidats correspondent"
}

Sois précis et ne retourne que les candidats vraiment pertinents.`
                            },
                            {
                                role: 'user',
                                content: `Recherche: ${query}`
                            }
                        ],
                        temperature: 0.3,
                        max_tokens: 500,
                    }),
                });

                if (aiResponse.ok) {
                    const aiData = await aiResponse.json();
                    const aiContent = aiData.choices?.[0]?.message?.content || '';

                    try {
                        // Extraire le JSON de la réponse
                        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            const parsed = JSON.parse(jsonMatch[0]);
                            const matchedCandidates = (parsed.matches || [])
                                .filter((i: number) => i >= 0 && i < candidates.length)
                                .map((i: number) => ({
                                    ...candidates[i],
                                    ai_match_reason: parsed.reasoning,
                                }));

                            return NextResponse.json({
                                results: matchedCandidates,
                                reasoning: parsed.reasoning,
                                source: 'ai',
                            });
                        }
                    } catch (parseError) {
                        console.error('Error parsing AI response:', parseError);
                    }
                }
            } catch (aiError) {
                console.error('AI API error:', aiError);
                // Fallback to keyword search
            }
        }

        // Fallback: recherche par mots-clés
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter((w: string) => w.length > 2);

        const scoredCandidates = candidates.map(candidate => {
            let score = 0;
            const searchableText = [
                candidate.name,
                candidate.email,
                ...(candidate.skills || []),
                candidate.cv_text,
            ].filter(Boolean).join(' ').toLowerCase();

            // Score basé sur les mots-clés
            for (const word of queryWords) {
                if (searchableText.includes(word)) {
                    score += 10;
                }
            }

            // Bonus pour les compétences exactes
            for (const skill of (candidate.skills || [])) {
                if (queryLower.includes(skill.toLowerCase())) {
                    score += 20;
                }
            }

            return { ...candidate, search_score: score };
        });

        // Filtrer et trier
        const results = scoredCandidates
            .filter(c => c.search_score > 0)
            .sort((a, b) => b.search_score - a.search_score);

        return NextResponse.json({
            results,
            source: 'keyword',
            message: results.length === 0 ? 'Aucun candidat trouvé pour cette recherche' : undefined,
        });

    } catch (error) {
        console.error('AI Search API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
