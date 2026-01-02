/**
 * API Route to enable/disable a WhatsApp Bot
 */

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.WHATSAPP_BOT_API_URL || 'http://localhost:3001';
const ADMIN_SECRET = process.env.WHATSAPP_BOT_ADMIN_SECRET || 'admin';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/whatsapp-bots/:id/enable - Enable/Disable the bot
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    try {
        const body = await request.json();

        const response = await fetch(`${API_URL}/api/admin/bots/${id}/enable`, {
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
        console.error('WhatsApp Bot Enable API error:', error);
        return NextResponse.json(
            { error: 'Failed to update bot status' },
            { status: 500 }
        );
    }
}
