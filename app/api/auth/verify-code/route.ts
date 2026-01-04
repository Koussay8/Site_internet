import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { email, code, password, companyName } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email et code requis' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Vérifier le code
        const { data: verificationRecord, error: fetchError } = await supabase
            .from('email_verification_codes')
            .select('*')
            .eq('email', normalizedEmail)
            .eq('code', code)
            .eq('used', false)
            .single();

        if (fetchError || !verificationRecord) {
            return NextResponse.json(
                { error: 'Code invalide ou expiré' },
                { status: 400 }
            );
        }

        // 2. Vérifier l'expiration
        if (new Date(verificationRecord.expires_at) < new Date()) {
            return NextResponse.json(
                { error: 'Code expiré. Veuillez en demander un nouveau.' },
                { status: 400 }
            );
        }

        // 3. Marquer le code comme utilisé
        await supabase
            .from('email_verification_codes')
            .update({ used: true })
            .eq('id', verificationRecord.id);

        // 4. Créer le compte via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
                data: {
                    company_name: companyName || 'Mon Entreprise',
                },
                emailRedirectTo: undefined, // Pas besoin de confirmation email, on l'a déjà fait
            }
        });

        if (authError) {
            console.log('Supabase Auth signup error:', authError.message);

            if (authError.message.includes('already registered')) {
                // L'utilisateur existe déjà, on le marque comme vérifié
                const { error: updateError } = await supabase
                    .from('clients')
                    .update({ is_verified: true })
                    .eq('email', normalizedEmail);

                if (updateError) {
                    console.error('Error updating client:', updateError);
                }

                return NextResponse.json(
                    { error: 'Cet email est déjà utilisé. Essayez de vous connecter.' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Erreur lors de la création du compte' },
                { status: 500 }
            );
        }

        console.log('User created successfully:', authData.user.id);

        // 5. Attendre que le trigger crée le client
        await new Promise(resolve => setTimeout(resolve, 500));

        // 6. Marquer comme vérifié
        const { error: verifyError } = await supabase
            .from('clients')
            .update({ is_verified: true })
            .eq('auth_uid', authData.user.id);

        if (verifyError) {
            console.error('Error marking client as verified:', verifyError);
        }

        // 7. Ajouter à la liste des leads
        const { error: leadError } = await supabase
            .from('leads')
            .upsert({
                email: normalizedEmail,
                name: companyName || null,
                source: 'register',
                subscribed: true,
            }, {
                onConflict: 'email',
            });

        if (leadError) {
            console.error('Error adding lead:', leadError);
            // Non bloquant, on continue
        }

        // 8. Récupérer les infos du client
        const { data: client } = await supabase
            .from('clients')
            .select('*')
            .eq('auth_uid', authData.user.id)
            .single();

        return NextResponse.json({
            success: true,
            user: client ? {
                id: client.id,
                email: client.email,
                company_name: client.company_name,
            } : {
                id: authData.user.id,
                email: authData.user.email,
            },
            token: authData.session?.access_token,
            message: 'Compte créé et vérifié avec succès !',
        });

    } catch (error) {
        console.error('Verify code error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
