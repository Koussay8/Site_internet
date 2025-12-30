import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint pour recevoir les réservations des chatbots clients
 * Vous pouvez personnaliser ce qu'il fait avec les données (email, webhook, etc.)
 */

// Configuration des webhooks par client (optionnel)
const CLIENT_WEBHOOKS: Record<string, string> = {
    // 'client-abc': 'https://webhook.site/xxx', // URL webhook du client
};

export async function POST(request: NextRequest) {
    try {
        const origin = request.headers.get('origin') || '*';
        const data = await request.json();

        const { clientId, date, contact, nom, sujet } = data;

        if (!clientId) {
            return NextResponse.json(
                { error: 'Missing client ID' },
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

        // Log the booking (vous pouvez aussi sauvegarder en base de données)
        console.log(`[BOOKING] Client: ${clientId}`);
        console.log(`  - Date: ${date}`);
        console.log(`  - Contact: ${contact}`);
        console.log(`  - Nom: ${nom}`);
        console.log(`  - Sujet: ${sujet}`);

        // Si le client a un webhook configuré, envoyer les données
        const webhookUrl = CLIENT_WEBHOOKS[clientId];
        if (webhookUrl) {
            try {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'chatbot_booking',
                        clientId,
                        date,
                        contact,
                        nom,
                        sujet,
                        timestamp: new Date().toISOString(),
                    }),
                });
            } catch (webhookError) {
                console.error(`Webhook error for ${clientId}:`, webhookError);
            }
        }

        // Optionnel: Envoyer un email de notification
        // Vous pouvez intégrer l'envoi d'email ici

        return NextResponse.json(
            { success: true, message: 'Booking received' },
            {
                headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            }
        );
    } catch (error) {
        console.error('Booking API error:', error);
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
