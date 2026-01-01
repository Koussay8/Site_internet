import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST: Créer une demande d'accès (client)
export async function POST(request: NextRequest) {
    try {
        const { clientId, appId, message, rdvDate, rdvContact } = await request.json();

        if (!clientId || !appId) {
            return NextResponse.json(
                { error: 'clientId et appId requis' },
                { status: 400 }
            );
        }

        // Vérifier si une demande existe déjà pour cette app
        const { data: existing } = await supabase
            .from('app_requests')
            .select('id, status')
            .eq('client_id', clientId)
            .eq('app_id', appId)
            .in('status', ['pending', 'approved'])
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'Une demande existe déjà pour cette application', existing },
                { status: 409 }
            );
        }

        // Créer la demande
        const { data, error } = await supabase
            .from('app_requests')
            .insert({
                client_id: clientId,
                app_id: appId,
                message,
                rdv_date: rdvDate,
                rdv_contact: rdvContact,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating app request:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, request: data });

    } catch (error) {
        console.error('App request error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// GET: Récupérer les demandes du client
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');

        if (!clientId) {
            return NextResponse.json({ error: 'clientId requis' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('app_requests')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ requests: data });

    } catch (error) {
        console.error('Get requests error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
