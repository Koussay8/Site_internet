import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET - Récupérer le statut des uploads
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) return unauthorizedResponse();

        const { searchParams } = new URL(request.url);
        const uploadId = searchParams.get('id');

        if (uploadId) {
            // Récupérer un upload spécifique
            const { data, error } = await supabase
                .from('upload_status')
                .select('*')
                .eq('id', uploadId)
                .eq('user_id', user.userId)
                .single();

            if (error || !data) {
                return NextResponse.json({ error: 'Upload non trouvé' }, { status: 404 });
            }

            return NextResponse.json(data);
        }

        // Récupérer tous les uploads récents
        const { data, error } = await supabase
            .from('upload_status')
            .select('*')
            .eq('user_id', user.userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
