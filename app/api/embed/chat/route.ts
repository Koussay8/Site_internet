import { NextRequest, NextResponse } from 'next/server';

/**
 * Configuration des clients - Chaque client a sa propre config
 * À terme, vous pouvez migrer ça vers Supabase ou une base de données
 */
const CLIENTS_CONFIG: Record<string, {
    apiKey: string;           // Clé API Groq du client
    botName: string;          // Nom du bot
    companyName: string;      // Nom de l'entreprise
    systemPrompt?: string;    // Prompt personnalisé (optionnel)
    webhookUrl?: string;      // URL webhook pour les RDV (optionnel)
}> = {
    // Exemple de configuration client
    'demo-client': {
        apiKey: process.env.DEMO_CLIENT_GROQ_KEY || '',
        botName: 'Assistant Demo',
        companyName: 'Demo Company',
    },
    // Ajoutez vos clients ici :
    // 'client-abc': {
    //     apiKey: process.env.CLIENT_ABC_GROQ_KEY || '',
    //     botName: 'Assistant ABC',
    //     companyName: 'ABC Entreprise',
    //     systemPrompt: 'Prompt personnalisé...',
    // },
};

// Rate limiting simple
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60000;

function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const record = rateLimit.get(key);

    if (!record || now > record.resetTime) {
        rateLimit.set(key, { count: 1, resetTime: now + RATE_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT) {
        return false;
    }

    record.count++;
    return true;
}

// Prompt système par défaut
function getDefaultPrompt(companyName: string, botName: string): string {
    return `Tu es ${botName}, assistant IA de ${companyName}.

TON RÔLE : Accueillir les visiteurs, répondre à leurs questions et les aider à prendre RDV.

FLUX DE CONVERSATION :
1. ÉCOUTER : Comprendre le besoin du visiteur
2. RÉPONDRE : Expliquer comment ${companyName} peut aider
3. PROPOSER : "Souhaitez-vous prendre rendez-vous ?"
4. COLLECTER : Demande les 3 infos :
   - Date/heure de disponibilité
   - Email ou téléphone
   - Nom

GÉNÉRATION DU RDV :
Dès que tu as les 3 infos (date + contact + nom), génère :
BLOCK_RDV:{"date":"[date]","contact":"[email/tel]","nom":"[nom]","sujet":"[résumé]"}

RÈGLES :
- Réponds en 2-3 phrases MAX
- Sois professionnel et accueillant
- Réponds en français`;
}

export async function POST(request: NextRequest) {
    try {
        // CORS headers
        const origin = request.headers.get('origin') || '*';

        const { clientId, message, history } = await request.json();

        // Validate client
        if (!clientId || !CLIENTS_CONFIG[clientId]) {
            return NextResponse.json(
                { error: 'Invalid client ID' },
                {
                    status: 401,
                    headers: {
                        'Access-Control-Allow-Origin': origin,
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    }
                }
            );
        }

        const clientConfig = CLIENTS_CONFIG[clientId];

        // Check API key
        if (!clientConfig.apiKey) {
            return NextResponse.json(
                { error: 'API key not configured for this client' },
                {
                    status: 500,
                    headers: {
                        'Access-Control-Allow-Origin': origin,
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    }
                }
            );
        }

        // Rate limiting per client
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!checkRateLimit(`${clientId}:${ip}`)) {
            return NextResponse.json(
                { error: 'Too many requests' },
                {
                    status: 429,
                    headers: {
                        'Access-Control-Allow-Origin': origin,
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    }
                }
            );
        }

        // Validate message
        if (!message || typeof message !== 'string' || message.length > 1000) {
            return NextResponse.json(
                { error: 'Invalid message' },
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': origin,
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    }
                }
            );
        }

        // Prepare prompt
        const systemPrompt = clientConfig.systemPrompt ||
            getDefaultPrompt(clientConfig.companyName, clientConfig.botName);

        // Sanitize history
        const sanitizedHistory = Array.isArray(history)
            ? history.slice(-10).map((msg: { role: string; content: string }) => ({
                role: msg.role === 'bot' ? 'assistant' : msg.role,
                content: String(msg.content).slice(0, 500),
            }))
            : [];

        // Build messages
        const messages = [
            { role: 'system', content: systemPrompt },
            ...sanitizedHistory,
            { role: 'user', content: message },
        ];

        // Call Groq API with client's key
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${clientConfig.apiKey}`,
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

        return NextResponse.json(
            { response: botMessage },
            {
                headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            }
        );
    } catch (error) {
        console.error('Embed Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            }
        );
    }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin') || '*';
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
