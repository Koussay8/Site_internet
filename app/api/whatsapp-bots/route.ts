/**
 * API Routes for WhatsApp Bots
 * Proxy to Railway backend
 */

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.WHATSAPP_BOT_API_URL || 'http://localhost:3001';
const ADMIN_SECRET = process.env.WHATSAPP_BOT_ADMIN_SECRET || 'admin';

/**
 * GET /api/whatsapp-bots - List all bots
 */
export async function GET() {
    try {
        const response = await fetch(`${API_URL}/api/admin/bots`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_SECRET}`,
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

        const response = await fetch(`${API_URL}/api/admin/bots`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ADMIN_SECRET}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('WhatsApp Bots API error:', error);
        return NextResponse.json(
            { error: 'Failed to create bot' },
            { status: 500 }
        );
    }
}
