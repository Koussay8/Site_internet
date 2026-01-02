/**
 * API Routes for Chatbot Widgets
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function presets with their system prompts
const FUNCTION_PRESETS: Record<string, string> = {
    accueil: `Tu es un assistant d'accueil professionnel et chaleureux pour {company_name}.
Ton rôle est de:
1. Accueillir chaleureusement les visiteurs
2. Répondre à leurs questions sur l'entreprise et ses services
3. Les orienter vers le bon service selon leurs besoins
4. Après 2-3 échanges constructifs, proposer gentiment de prendre un rendez-vous

Quand tu proposes un RDV, utilise cette formule: "Si vous le souhaitez, je peux vous proposer un rendez-vous pour en discuter plus en détail. Qu'en pensez-vous ?"
Si le visiteur accepte, demande son nom, email, téléphone et la date souhaitée.

Sois toujours poli, professionnel et concis. Utilise des emojis avec modération.`,

    support: `Tu es un agent de support technique pour {company_name}.
Ton rôle est de:
1. Écouter attentivement le problème du client
2. Poser des questions pour bien comprendre la situation
3. Proposer des solutions étape par étape
4. Escalader vers un humain si le problème est trop complexe

Si tu ne peux pas résoudre le problème, dis: "Je vais transmettre votre demande à notre équipe technique qui vous recontactera rapidement."

Reste calme et empathique même si le client est frustré.`,

    vente: `Tu es un conseiller commercial pour {company_name}.
Ton rôle est de:
1. Comprendre les besoins du prospect
2. Présenter les solutions adaptées
3. Répondre aux objections avec tact
4. Proposer un rendez-vous ou une démonstration

Après avoir qualifié le besoin, propose: "Je peux organiser une démonstration personnalisée. Avez-vous 15 minutes cette semaine ?"

Sois enthousiaste mais pas insistant.`,

    custom: ''
};

/**
 * GET /api/chatbot-widgets - List user's widgets
 */
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('chatbot_widgets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ widgets: data });
    } catch (error) {
        console.error('Error fetching widgets:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * POST /api/chatbot-widgets - Create new widget
 */
export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            companyName,
            welcomeMessage,
            systemPrompt,
            knowledgeBase,
            functionPreset,
            settings
        } = body;

        if (!name) {
            return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
        }

        // Build final system prompt
        let finalPrompt = systemPrompt || '';
        if (functionPreset && FUNCTION_PRESETS[functionPreset]) {
            const presetPrompt = FUNCTION_PRESETS[functionPreset].replace('{company_name}', companyName || 'notre entreprise');
            finalPrompt = presetPrompt + (systemPrompt ? '\n\n' + systemPrompt : '');
        }

        // Add knowledge base to prompt if provided
        if (knowledgeBase && knowledgeBase.length > 0) {
            finalPrompt += '\n\nBase de connaissances:\n';
            knowledgeBase.forEach((entry: { question: string; answer: string } | string) => {
                if (typeof entry === 'object') {
                    finalPrompt += `Q: ${entry.question}\nR: ${entry.answer}\n\n`;
                } else {
                    finalPrompt += `- ${entry}\n`;
                }
            });
        }

        const { data, error } = await supabase
            .from('chatbot_widgets')
            .insert({
                user_id: userId,
                name,
                company_name: companyName,
                welcome_message: welcomeMessage || 'Bonjour ! Comment puis-je vous aider ?',
                system_prompt: finalPrompt,
                knowledge_base: knowledgeBase || [],
                function_preset: functionPreset || 'custom',
                settings: settings || {}
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ widget: data });
    } catch (error) {
        console.error('Error creating widget:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
