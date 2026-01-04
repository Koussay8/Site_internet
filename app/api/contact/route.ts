import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyEmailQuick } from '@/lib/email-verifier';
import { sendEmail, emailTemplates } from '@/lib/email-sender';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { name, email, message, type } = data;

        // 1. Vérifier l'email si fourni
        if (email) {
            const emailCheck = await verifyEmailQuick(email.toLowerCase().trim());

            if (!emailCheck.valid) {
                return NextResponse.json({
                    success: false,
                    warning: 'L\'email semble invalide, mais votre message a été enregistré.',
                });
            }

            // 2. Ajouter à la liste des leads
            await supabase
                .from('leads')
                .upsert({
                    email: email.toLowerCase().trim(),
                    name: name || null,
                    source: type === 'chatbot_booking' ? 'chatbot' : 'contact',
                    subscribed: true,
                }, {
                    onConflict: 'email',
                });

            // 3. Envoyer une confirmation si c'est un RDV
            if (type === 'chatbot_booking' && data.date && data.contact) {
                await sendEmail({
                    to: email.toLowerCase().trim(),
                    subject: 'Confirmation de votre rendez-vous - NovaSolutions',
                    html: emailTemplates.rdvConfirmation({
                        name: name || data.nom || 'Client',
                        date: data.date,
                        contact: data.contact || email,
                    }),
                });
            }
        }

        // 4. Forward to Google Apps Script (existing behavior)
        if (GOOGLE_SCRIPT_URL) {
            try {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(data),
                });
            } catch (error) {
                console.error('Google Script error:', error);
                // Non-bloquant
            }
        }

        // 5. Stocker dans Supabase aussi
        await supabase
            .from('form_submissions')
            .insert({
                form_id: null, // Formulaire contact général
                data: {
                    name,
                    email,
                    message,
                    type: type || 'contact',
                    submitted_at: new Date().toISOString(),
                },
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
