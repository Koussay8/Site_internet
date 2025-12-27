import { NextRequest, NextResponse } from 'next/server';

// L'API Key est sécurisée côté serveur - jamais exposée au client !
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Simple in-memory rate limiting (pour production, utiliser Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimit.get(ip);

    if (!record || now > record.resetTime) {
        rateLimit.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT) {
        return false;
    }

    record.count++;
    return true;
}

const systemPrompt = `Tu es Nova, conseillère IA de NovaSolutions, agence d'automatisation.

TON RÔLE : Comprendre le problème du visiteur, lui expliquer comment on peut l'aider, puis collecter les infos pour un RDV.

FLUX DE CONVERSATION :
1. ÉCOUTER : Comprendre son secteur et son problème
2. RÉPONDRE : Expliquer en 2-3 phrases comment on résout son problème
3. PROPOSER : "Quand seriez-vous disponible pour un échange avec l'un de nos spécialistes ?"
4. COLLECTER : Demande les 3 infos (peut être en plusieurs messages) :
   - Date/heure de disponibilité
   - Numéro ou email
   - Nom ou nom d'entreprise

RÈGLE CRITIQUE - GÉNÉRATION DU RDV :
Dès que tu as collecté les 3 informations (date + contact + nom), tu DOIS IMMÉDIATEMENT générer le bloc suivant dans ta réponse, SANS demander de confirmation :
BLOCK_RDV:{"date":"[la date]","contact":"[email ou tel]","nom":"[nom]","sujet":"[résumé du besoin]"}

Exemple : Si l'utilisateur dit "Je suis disponible mardi à 14h, mon email est test@email.com et je m'appelle Jean Dupont", tu réponds IMMÉDIATEMENT avec le BLOCK_RDV sans rien demander d'autre.

ARGUMENTS PAR SECTEUR :
• ESTHÉTICIENS : Messages Instagram sans réponse → assistant IA 24/7, pré-qualification, prise de RDV automatique.
• DENTISTES : No-Show, standard saturé → agent de confirmation automatique, chatbot FAQ.
• SPAS : Créneaux vides → promos flash automatiques pour remplir les horaires creux.
• ARTISANS : Appels ratés sur chantier → répondeur IA qui qualifie et envoie SMS.
• SOLAIRE : Leads non qualifiés chers → agent IA + calculateur pour pré-qualifier.
• AVOCATS : 20 min au téléphone pour infos basiques → chatbot collecte infos préliminaires.
• ÉVÉNEMENTIEL : Trop de demandes → automatisation pour ne plus laisser filer de contrat.

RÈGLES :
- Réponds en 2-3 phrases MAX
- Si manque une info (date, contact OU nom) → demande-la poliment
- NE GÉNÈRE JAMAIS BLOCK_RDV sans avoir les 3 infos
- GÉNÈRE TOUJOURS BLOCK_RDV dès que tu as les 3 infos (pas de demande de confirmation)

Réponds en français, de manière professionnelle.`;

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait a moment.' },
                { status: 429 }
            );
        }

        const { message, history } = await request.json();

        // Input validation
        if (!message || typeof message !== 'string' || message.length > 1000) {
            return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
        }

        if (!GROQ_API_KEY) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Sanitize history
        const sanitizedHistory = Array.isArray(history)
            ? history.slice(-10).map((msg: { role: string; content: string }) => ({
                role: msg.role === 'bot' ? 'assistant' : msg.role,
                content: String(msg.content).slice(0, 500),
            }))
            : [];

        // Build conversation
        const messages = [
            { role: 'system', content: systemPrompt },
            ...sanitizedHistory,
            { role: 'user', content: message },
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages,
                temperature: 0.6,
                max_tokens: 200,
            }),
        });

        if (!response.ok) {
            throw new Error('Groq API error');
        }

        const data = await response.json();
        const botMessage = data.choices?.[0]?.message?.content || "Désolé, une erreur s'est produite.";

        return NextResponse.json({ response: botMessage });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
