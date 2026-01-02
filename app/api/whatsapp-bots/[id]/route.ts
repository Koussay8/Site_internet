/**
 * API Routes for a specific WhatsApp Bot
 */

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.WHATSAPP_BOT_API_URL || 'http://localhost:3001';
const ADMIN_SECRET = process.env.WHATSAPP_BOT_ADMIN_SECRET || 'admin';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/whatsapp-bots/:id - Get bot details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    try {
        const response = await fetch(`${API_URL}/api/admin/bots/${id}`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_SECRET}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Bot not found' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('WhatsApp Bot API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bot' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/whatsapp-bots/:id - Update bot config
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    try {
        const body = await request.json();

        const response = await fetch(`${API_URL}/api/admin/bots/${id}`, {
            method: 'PUT',
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
        console.error('WhatsApp Bot API error:', error);
        return NextResponse.json(
            { error: 'Failed to update bot' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/whatsapp-bots/:id - Delete bot
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    try {
        const response = await fetch(`${API_URL}/api/admin/bots/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${ADMIN_SECRET}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('WhatsApp Bot API error:', error);
        return NextResponse.json(
            { error: 'Failed to delete bot' },
            { status: 500 }
        );
    }
}
