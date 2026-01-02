/**
 * API Route for WhatsApp Bot QR Code
 */

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.WHATSAPP_BOT_API_URL || 'http://localhost:3001';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/whatsapp-bots/:id/qr - Get QR code for bot
 * This is a public endpoint (no auth required) to allow QR code scanning
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    try {
        const response = await fetch(`${API_URL}/api/bots/${id}/qr`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'QR code not available' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('WhatsApp Bot QR API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch QR code' },
            { status: 500 }
        );
    }
}
