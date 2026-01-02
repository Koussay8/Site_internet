/**
 * API Routes for a specific Chatbot Widget
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/chatbot-widgets/:id - Get widget details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    try {
        const { data, error } = await getSupabaseAdmin()
            .from('chatbot_widgets')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Widget non trouvé' }, { status: 404 });
        }

        return NextResponse.json({ widget: data });
    } catch (error) {
        console.error('Error fetching widget:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * PUT /api/chatbot-widgets/:id - Update widget
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    try {
        const body = await request.json();

        const { data, error } = await getSupabaseAdmin()
            .from('chatbot_widgets')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ widget: data });
    } catch (error) {
        console.error('Error updating widget:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * DELETE /api/chatbot-widgets/:id - Delete widget
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    try {
        const { error } = await getSupabaseAdmin()
            .from('chatbot_widgets')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting widget:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
