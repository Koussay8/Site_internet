/**
 * API Routes for WhatsApp Bots
 * Proxy to GCP backend with multi-tenant support
 */

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.WHATSAPP_BOT_API_URL || 'http://localhost:3001';
const ADMIN_SECRET = process.env.WHATSAPP_BOT_ADMIN_SECRET || 'admin';

/**
 * GET /api/whatsapp-bots - List bots (filtered by owner if not admin)
 */
export async function GET(request: NextRequest) {
    try {
        // Get user headers
        const userEmail = request.headers.get('X-User-Email') || '';
        const isAdmin = request.headers.get('X-Is-Admin') || 'false';

        const response = await fetch(`${API_URL}/api/admin/bots`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_SECRET}`,
                'X-User-Email': userEmail,
                'X-Is-Admin': isAdmin,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch bots' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('WhatsApp Bots API error:', error);
        return NextResponse.json(
            { error: 'Backend not available', bots: [] },
            { status: 503 }
        );
    }
}

/**
 * POST /api/whatsapp-bots - Create a new bot
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Get user headers
        const userEmail = request.headers.get('X-User-Email') || '';
        const isAdmin = request.headers.get('X-Is-Admin') || 'false';
        const botLimit = request.headers.get('X-Bot-Limit') || '1';

        console.log(`[WhatsApp API] Creating bot for ${userEmail}, isAdmin:${isAdmin}, limit:${botLimit}`);
        console.log(`[WhatsApp API] Backend URL: ${API_URL}`);
        console.log(`[WhatsApp API] Body:`, JSON.stringify(body));

        const response = await fetch(`${API_URL}/api/admin/bots`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ADMIN_SECRET}`,
                'Content-Type': 'application/json',
                'X-User-Email': userEmail,
                'X-Is-Admin': isAdmin,
                'X-Bot-Limit': botLimit,
            },
            body: JSON.stringify(body),
        });

        console.log(`[WhatsApp API] Response status: ${response.status}`);

        if (!response.ok) {
            const error = await response.json();
            console.error(`[WhatsApp API] Error:`, error);
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();
        console.log(`[WhatsApp API] Success:`, data);
        return NextResponse.json(data);
    } catch (error) {
        console.error('[WhatsApp API] Critical error:', error);
        return NextResponse.json(
            { error: 'Failed to create bot - Backend not reachable' },
            { status: 500 }
        );
    }
}

