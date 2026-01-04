/**
 * Email Sender - Dual System
 * 
 * TRANSACTIONNELS (double opt-in, confirmations) → Google Apps Script (Gmail IP)
 * MARKETING (newsletters) → Postal (IP dédiée 104.155.124.69)
 */

// Types
export interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
}

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// Configuration
const POSTAL_API_URL = process.env.POSTAL_API_URL || 'http://104.155.124.69:5000';
const POSTAL_API_KEY = process.env.POSTAL_API_KEY || '';
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'contact@novasolutions.fr';

/**
 * ============================================
 * EMAILS TRANSACTIONNELS (via Google Apps Script)
 * - Double opt-in
 * - Confirmations RDV
 * - Reset mot de passe
 * ============================================
 */
export async function sendTransactionalEmail(options: EmailOptions): Promise<EmailResult> {
    if (!GOOGLE_SCRIPT_URL) {
        console.error('GOOGLE_SCRIPT_URL not configured, falling back to Postal');
        return sendMarketingEmail(options);
    }

    const payload = {
        type: 'send_email',
        to: Array.isArray(options.to) ? options.to[0] : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || '',
    };

    console.log('📧 Sending transactional email to:', payload.to);
    console.log('📧 Subject:', payload.subject);
    console.log('📧 Using Google Script URL:', GOOGLE_SCRIPT_URL.substring(0, 50) + '...');

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        console.log('📧 Google Script raw response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            console.error('📧 Failed to parse Google Script response as JSON');
            // Si on reçoit une réponse mais pas du JSON, considérer comme succès partiel
            if (response.ok) {
                return { success: true };
            }
            throw new Error('Invalid response from Google Script');
        }

        if (data.success) {
            console.log('✅ Email sent successfully via Google Script');
            return { success: true };
        } else {
            console.error('❌ Google Script returned error:', data.error);
            return { success: false, error: data.error || 'Google Script error' };
        }
    } catch (error) {
        console.error('❌ Transactional email error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
        };
    }
}

/**
 * ============================================
 * EMAILS MARKETING (via Postal)
 * - Newsletters
 * - Prospection
 * - Campagnes masse
 * ============================================
 */
export async function sendMarketingEmail(options: EmailOptions): Promise<EmailResult> {
    if (!POSTAL_API_KEY) {
        console.error('POSTAL_API_KEY not configured');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const response = await fetch(`${POSTAL_API_URL}/api/v1/send/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Server-API-Key': POSTAL_API_KEY,
            },
            body: JSON.stringify({
                to: Array.isArray(options.to) ? options.to : [options.to],
                from: options.from || SENDER_EMAIL,
                subject: options.subject,
                html_body: options.html,
                plain_body: options.text,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de l\'envoi');
        }

        return {
            success: true,
            messageId: data.message_id,
        };
    } catch (error) {
        console.error('Marketing email error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
        };
    }
}

/**
 * Alias pour compatibilité - utilise Postal par défaut
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
    return sendMarketingEmail(options);
}

/**
 * Envoyer en masse (newsletters) - toujours via Postal
 */
export async function sendBulkEmails(
    recipients: string[],
    subject: string,
    html: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = { sent: 0, failed: 0, errors: [] as string[] };
    const batchSize = 50;

    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);

        const promises = batch.map(async (to) => {
            const result = await sendMarketingEmail({ to, subject, html });
            if (result.success) {
                results.sent++;
            } else {
                results.failed++;
                results.errors.push(`${to}: ${result.error}`);
            }
        });

        await Promise.all(promises);

        if (i + batchSize < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
}

/**
 * Générer un token de désabonnement
 */
export function generateUnsubscribeToken(email: string): string {
    const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret';
    const data = `${email}:${secret}`;
    return Buffer.from(data).toString('base64url');
}

/**
 * Valider un token de désabonnement
 */
export function validateUnsubscribeToken(token: string): string | null {
    try {
        const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret';
        const decoded = Buffer.from(token, 'base64url').toString();
        const [email, tokenSecret] = decoded.split(':');
        if (tokenSecret === secret) {
            return email;
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Templates d'emails
 */
export const emailTemplates = {
    verificationCode: (code: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0118; color: #fff; padding: 40px; }
        .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a0f2e 0%, #0a0118 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(139, 92, 246, 0.3); }
        .logo { font-size: 24px; font-weight: 700; margin-bottom: 24px; }
        .logo span { color: #a78bfa; }
        .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-align: center; padding: 20px; border: 2px dashed rgba(139, 92, 246, 0.5); border-radius: 12px; margin: 24px 0; }
        .footer { color: #888; font-size: 12px; margin-top: 32px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Nova<span>Solutions</span></div>
        <h2>Vérifiez votre email</h2>
        <p>Voici votre code de vérification :</p>
        <div class="code">${code}</div>
        <p>Ce code expire dans 10 minutes.</p>
        <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
        <div class="footer">© 2025 NovaSolutions. Tous droits réservés.</div>
    </div>
</body>
</html>`,

    rdvConfirmation: (data: { name: string; date: string; contact: string }) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0118; color: #fff; padding: 40px; }
        .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a0f2e 0%, #0a0118 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(16, 185, 129, 0.3); }
        .logo { font-size: 24px; font-weight: 700; margin-bottom: 24px; }
        .logo span { color: #a78bfa; }
        .highlight { color: #10b981; font-weight: 600; }
        .footer { color: #888; font-size: 12px; margin-top: 32px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Nova<span>Solutions</span></div>
        <h2>✅ Rendez-vous confirmé !</h2>
        <p>Bonjour <span class="highlight">${data.name}</span>,</p>
        <p>Votre rendez-vous a bien été enregistré pour le <span class="highlight">${data.date}</span>.</p>
        <p>Un membre de notre équipe vous contactera à l'adresse/numéro : <span class="highlight">${data.contact}</span></p>
        <p>À très bientôt !</p>
        <div class="footer">© 2025 NovaSolutions. Tous droits réservés.</div>
    </div>
</body>
</html>`,

    newsletter: (content: string, unsubscribeUrl: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0118; color: #fff; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0f2e 0%, #0a0118 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(139, 92, 246, 0.3); }
        .logo { font-size: 24px; font-weight: 700; margin-bottom: 24px; }
        .logo span { color: #a78bfa; }
        .content { line-height: 1.8; }
        .footer { color: #888; font-size: 12px; margin-top: 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
        .unsubscribe { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Nova<span>Solutions</span></div>
        <div class="content">${content}</div>
        <div class="footer">
            © 2025 NovaSolutions. Tous droits réservés.<br>
            <a href="${unsubscribeUrl}" class="unsubscribe">Se désinscrire de la newsletter</a>
        </div>
    </div>
</body>
</html>`,
};
