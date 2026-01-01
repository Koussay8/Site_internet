import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        // Sign out from Supabase Auth
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.log('Logout error:', error.message);
            // Still return success - client will clear local storage anyway
        }

        return NextResponse.json({
            success: true,
            message: 'Déconnexion réussie'
        });

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la déconnexion' },
            { status: 500 }
        );
    }
}
