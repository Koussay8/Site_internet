import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Récupérer tous les leads (admin only)
export async function GET(request: NextRequest) {
    try {
        // Vérifier l'authentification admin
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabase.auth.getUser(token);

        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Vérifier si admin
        const { data: client } = await supabase
            .from('clients')
            .select('is_admin')
            .eq('auth_uid', user.id)
            .single();

        if (!client?.is_admin) {
            return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
        }

        // Récupérer les leads
        const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Stats
        const totalLeads = leads?.length || 0;
        const subscribedLeads = leads?.filter(l => l.subscribed).length || 0;

        return NextResponse.json({
            leads,
            stats: {
                total: totalLeads,
                subscribed: subscribedLeads,
                unsubscribed: totalLeads - subscribedLeads,
            },
        });
    } catch (error) {
        console.error('Get leads error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Ajouter un lead (interne)
export async function POST(request: NextRequest) {
    try {
        const { email, name, source } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email requis' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Upsert pour éviter les doublons
        const { data, error } = await supabase
            .from('leads')
            .upsert({
                email: normalizedEmail,
                name: name || null,
                source: source || 'website',
                subscribed: true,
            }, {
                onConflict: 'email',
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, lead: data });
    } catch (error) {
        console.error('Add lead error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// DELETE - Supprimer un lead (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const leadId = searchParams.get('id');

        if (!leadId) {
            return NextResponse.json({ error: 'ID requis' }, { status: 400 });
        }

        // Vérifier l'authentification admin
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabase.auth.getUser(token);

        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { data: client } = await supabase
            .from('clients')
            .select('is_admin')
            .eq('auth_uid', user.id)
            .single();

        if (!client?.is_admin) {
            return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
        }

        // Supprimer le lead
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', leadId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete lead error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
