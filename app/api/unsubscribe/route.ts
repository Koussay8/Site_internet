import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateUnsubscribeToken } from '@/lib/email-sender';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Token de désabonnement manquant' },
                { status: 400 }
            );
        }

        // Valider le token
        const email = validateUnsubscribeToken(token);

        if (!email) {
            return NextResponse.json(
                { error: 'Token invalide ou expiré' },
                { status: 400 }
            );
        }

        // Désabonner l'email
        const { error } = await supabase
            .from('leads')
            .update({
                subscribed: false,
                unsubscribed_at: new Date().toISOString(),
            })
            .eq('email', email.toLowerCase());

        if (error) {
            console.error('Unsubscribe error:', error);
            return NextResponse.json(
                { error: 'Erreur lors du désabonnement' },
                { status: 500 }
            );
        }

        // Rediriger vers la page de confirmation
        return NextResponse.redirect(new URL('/unsubscribe?success=true', request.url));

    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Réabonnement
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email requis' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('leads')
            .update({
                subscribed: true,
                unsubscribed_at: null,
            })
            .eq('email', email.toLowerCase());

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Resubscribe error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
