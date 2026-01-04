import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendBulkEmails, emailTemplates, generateUnsubscribeToken } from '@/lib/email-sender';

export async function POST(request: NextRequest) {
    try {
        // 1. Vérifier l'authentification admin
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabase.auth.getUser(token);

        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // 2. Vérifier si admin
        const { data: client } = await supabase
            .from('clients')
            .select('id, is_admin')
            .eq('auth_uid', user.id)
            .single();

        if (!client?.is_admin) {
            return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
        }

        // 3. Récupérer les données de la newsletter
        const { subject, htmlContent } = await request.json();

        if (!subject || !htmlContent) {
            return NextResponse.json(
                { error: 'Sujet et contenu requis' },
                { status: 400 }
            );
        }

        // 4. Récupérer tous les leads abonnés
        const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('email')
            .eq('subscribed', true);

        if (leadsError) {
            throw leadsError;
        }

        if (!leads || leads.length === 0) {
            return NextResponse.json(
                { error: 'Aucun abonné à la newsletter' },
                { status: 400 }
            );
        }

        // 5. Créer la campagne
        const { data: campaign, error: campaignError } = await supabase
            .from('newsletter_campaigns')
            .insert({
                subject,
                html_content: htmlContent,
                sent_by: client.id,
                recipients_count: leads.length,
                status: 'sending',
            })
            .select()
            .single();

        if (campaignError) {
            throw campaignError;
        }

        // 6. Envoyer les emails avec lien de désabonnement personnalisé
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://novasolutions.fr';

        // Préparer les emails avec unsubscribe links
        const recipients = leads.map(lead => lead.email);

        // Pour chaque email, générer le contenu avec le lien de désabonnement
        let sentCount = 0;
        let failedCount = 0;

        for (const email of recipients) {
            const unsubscribeToken = generateUnsubscribeToken(email);
            const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${unsubscribeToken}`;
            const personalizedHtml = emailTemplates.newsletter(htmlContent, unsubscribeUrl);

            const result = await sendBulkEmails([email], subject, personalizedHtml);
            sentCount += result.sent;
            failedCount += result.failed;

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 7. Mettre à jour la campagne
        await supabase
            .from('newsletter_campaigns')
            .update({
                sent_count: sentCount,
                failed_count: failedCount,
                status: failedCount > sentCount ? 'failed' : 'sent',
                sent_at: new Date().toISOString(),
            })
            .eq('id', campaign.id);

        return NextResponse.json({
            success: true,
            campaign_id: campaign.id,
            stats: {
                total_recipients: leads.length,
                sent: sentCount,
                failed: failedCount,
            },
        });

    } catch (error) {
        console.error('Newsletter send error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// GET - Historique des campagnes (admin only)
export async function GET(request: NextRequest) {
    try {
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

        const { data: campaigns, error } = await supabase
            .from('newsletter_campaigns')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            throw error;
        }

        return NextResponse.json({ campaigns });
    } catch (error) {
        console.error('Get newsletters error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
