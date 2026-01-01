import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Liste tous les clients avec leurs accès
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si admin
    const { data: adminClient } = await supabase
        .from('clients')
        .select('email')
        .eq('auth_uid', user.id)
        .single();

    if (adminClient?.email !== 'admin@nova.com') {
        return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
    }

    // Récupérer tous les clients (sauf admin)
    const { data: clients, error } = await supabase
        .from('clients')
        .select('id, email, company_name, applications, created_at, last_login')
        .neq('email', 'admin@nova.com')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ clients: clients || [] });
}

// PUT - Modifier les accès d'un utilisateur
export async function PUT(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si admin
    const { data: adminClient } = await supabase
        .from('clients')
        .select('email')
        .eq('auth_uid', user.id)
        .single();

    if (adminClient?.email !== 'admin@nova.com') {
        return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
    }

    const { clientId, action, appId } = await request.json();

    if (!clientId || !action || !appId) {
        return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Récupérer les applications actuelles
    const { data: client, error: fetchError } = await supabase
        .from('clients')
        .select('applications')
        .eq('id', clientId)
        .single();

    if (fetchError || !client) {
        return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    let applications = client.applications || [];

    if (action === 'add') {
        if (!applications.includes(appId)) {
            applications.push(appId);
        }
    } else if (action === 'remove') {
        applications = applications.filter((a: string) => a !== appId);
    }

    // Mettre à jour
    const { error: updateError } = await supabase
        .from('clients')
        .update({ applications })
        .eq('id', clientId);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: action === 'add' ? 'Accès ajouté' : 'Accès retiré',
        applications
    });
}
