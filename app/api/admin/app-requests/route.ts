import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Liste des emails admin autorisés
const ADMIN_EMAILS = ['admin@nova.com'];

async function verifyAdmin(request: NextRequest): Promise<{ isAdmin: boolean; error?: string }> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { isAdmin: false, error: 'Token manquant' };
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return { isAdmin: false, error: 'Token invalide' };
    }

    if (!ADMIN_EMAILS.includes(user.email || '')) {
        return { isAdmin: false, error: 'Accès non autorisé' };
    }

    return { isAdmin: true };
}

// GET: Lister toutes les demandes (admin)
export async function GET(request: NextRequest) {
    const auth = await verifyAdmin(request);
    if (!auth.isAdmin) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';

        const { data, error } = await supabase
            .from('app_requests')
            .select(`
                *,
                clients (id, email, company_name)
            `)
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ requests: data });

    } catch (error) {
        console.error('Admin get requests error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// PUT: Approuver/Rejeter une demande (admin)
export async function PUT(request: NextRequest) {
    const auth = await verifyAdmin(request);
    if (!auth.isAdmin) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const { requestId, action, adminNotes } = await request.json();

        if (!requestId || !['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'requestId et action (approve/reject) requis' },
                { status: 400 }
            );
        }

        // Récupérer la demande
        const { data: appRequest, error: fetchError } = await supabase
            .from('app_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError || !appRequest) {
            return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 });
        }

        // Mettre à jour le statut
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        const { error: updateError } = await supabase
            .from('app_requests')
            .update({
                status: newStatus,
                admin_notes: adminNotes,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', requestId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Si approuvé, ajouter l'app aux applications du client
        if (action === 'approve') {
            const { data: client } = await supabase
                .from('clients')
                .select('applications')
                .eq('id', appRequest.client_id)
                .single();

            const currentApps = client?.applications || [];
            if (!currentApps.includes(appRequest.app_id)) {
                const { error: clientError } = await supabase
                    .from('clients')
                    .update({
                        applications: [...currentApps, appRequest.app_id],
                    })
                    .eq('id', appRequest.client_id);

                if (clientError) {
                    console.error('Error updating client apps:', clientError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: action === 'approve' ? 'Demande approuvée' : 'Demande rejetée',
        });

    } catch (error) {
        console.error('Admin update request error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
