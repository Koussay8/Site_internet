import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyEmailQuick, generateVerificationCode } from '@/lib/email-verifier';
import { sendEmail, emailTemplates } from '@/lib/email-sender';

export async function POST(request: NextRequest) {
    try {
        const { email, password, companyName } = await request.json();

        console.log('Register attempt for email:', email);

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 6 caractères' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Vérifier si l'email existe déjà
        const { data: existingUser } = await supabase
            .from('clients')
            .select('id, is_verified')
            .eq('email', normalizedEmail)
            .single();

        if (existingUser) {
            if (existingUser.is_verified) {
                return NextResponse.json(
                    { error: 'Cet email est déjà utilisé' },
                    { status: 400 }
                );
            }
            // Si pas vérifié, on renvoie un code
        }

        // 2. Vérifier que l'email est valide (MX records)
        const emailCheck = await verifyEmailQuick(normalizedEmail);
        if (!emailCheck.valid) {
            return NextResponse.json(
                { error: 'Cet email semble invalide. Vérifiez l\'adresse.' },
                { status: 400 }
            );
        }

        // 3. Générer un code de vérification
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 4. Sauvegarder le code en base
        await supabase
            .from('email_verification_codes')
            .delete()
            .eq('email', normalizedEmail); // Supprimer les anciens codes

        const { error: codeError } = await supabase
            .from('email_verification_codes')
            .insert({
                email: normalizedEmail,
                code: verificationCode,
                expires_at: expiresAt.toISOString(),
            });

        if (codeError) {
            console.error('Error saving verification code:', codeError);
            return NextResponse.json(
                { error: 'Erreur lors de la création du code de vérification' },
                { status: 500 }
            );
        }

        // 5. Sauvegarder les données d'inscription temporaires en session
        // On utilise une table temporaire ou on stocke dans email_verification_codes
        const { error: updateCodeError } = await supabase
            .from('email_verification_codes')
            .update({
                // Stocker les infos d'inscription dans les métadonnées
            })
            .eq('email', normalizedEmail);

        // 6. Envoyer le code par email via Postal
        const emailResult = await sendEmail({
            to: normalizedEmail,
            subject: 'Vérifiez votre email - NovaSolutions',
            html: emailTemplates.verificationCode(verificationCode),
        });

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            // On continue quand même, le code est en base
        }

        // 7. Stocker les infos d'inscription en localStorage côté client
        // On retourne les données pour que le client les stocke temporairement
        return NextResponse.json({
            success: true,
            needsVerification: true,
            email: normalizedEmail,
            tempData: {
                password: password, // Sera stocké temporairement côté client
                companyName: companyName || 'Mon Entreprise',
            },
            message: 'Un code de vérification a été envoyé à votre email.',
        });

    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
