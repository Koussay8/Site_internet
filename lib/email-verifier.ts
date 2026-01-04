/**
 * Email Verifier - Vérification SMTP gratuite
 * Vérifie si un email existe réellement
 */

import dns from 'dns';
import { promisify } from 'util';
import net from 'net';

const resolveMx = promisify(dns.resolveMx);

export interface EmailVerificationResult {
    valid: boolean;
    deliverable: boolean;
    reason?: 'invalid_format' | 'no_mx' | 'smtp_error' | 'mailbox_not_found' | 'catch_all' | 'timeout';
    mxHost?: string;
}

/**
 * Vérifier le format d'un email
 */
function isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Récupérer les MX records d'un domaine
 */
async function getMxRecords(domain: string): Promise<string | null> {
    try {
        const records = await resolveMx(domain);
        if (records && records.length > 0) {
            // Trier par priorité et retourner le premier
            records.sort((a, b) => a.priority - b.priority);
            return records[0].exchange;
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Vérifier un email via SMTP (sans envoyer)
 */
async function smtpCheck(email: string, mxHost: string): Promise<{ valid: boolean; reason?: string }> {
    return new Promise((resolve) => {
        const timeout = 10000; // 10 secondes
        let responded = false;

        const socket = new net.Socket();
        socket.setTimeout(timeout);

        const cleanup = () => {
            if (!responded) {
                responded = true;
                socket.destroy();
            }
        };

        socket.on('timeout', () => {
            cleanup();
            resolve({ valid: false, reason: 'timeout' });
        });

        socket.on('error', () => {
            cleanup();
            resolve({ valid: false, reason: 'smtp_error' });
        });

        socket.on('connect', () => {
            let step = 0;
            let buffer = '';

            socket.on('data', (data) => {
                buffer += data.toString();

                // Attendre la réponse complète
                if (!buffer.includes('\r\n')) return;

                const lines = buffer.split('\r\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const code = parseInt(line.substring(0, 3));

                    if (step === 0 && code === 220) {
                        // Serveur prêt, envoyer HELO
                        socket.write('HELO verify.novasolutions.fr\r\n');
                        step = 1;
                    } else if (step === 1 && code === 250) {
                        // HELO accepté, envoyer MAIL FROM
                        socket.write('MAIL FROM:<verify@novasolutions.fr>\r\n');
                        step = 2;
                    } else if (step === 2 && code === 250) {
                        // MAIL FROM accepté, envoyer RCPT TO
                        socket.write(`RCPT TO:<${email}>\r\n`);
                        step = 3;
                    } else if (step === 3) {
                        // Réponse RCPT TO
                        socket.write('QUIT\r\n');
                        cleanup();

                        if (code === 250) {
                            resolve({ valid: true });
                        } else if (code === 550 || code === 551 || code === 552 || code === 553) {
                            resolve({ valid: false, reason: 'mailbox_not_found' });
                        } else if (code === 252) {
                            // Catch-all ou impossible de vérifier
                            resolve({ valid: true, reason: 'catch_all' });
                        } else {
                            resolve({ valid: false, reason: 'smtp_error' });
                        }
                    }
                }
            });
        });

        socket.connect(25, mxHost);
    });
}

/**
 * Vérifier un email complet
 */
export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
    // 1. Vérifier le format
    if (!isValidEmailFormat(email)) {
        return {
            valid: false,
            deliverable: false,
            reason: 'invalid_format',
        };
    }

    const domain = email.split('@')[1];

    // 2. Vérifier les MX records
    const mxHost = await getMxRecords(domain);
    if (!mxHost) {
        return {
            valid: false,
            deliverable: false,
            reason: 'no_mx',
        };
    }

    // 3. Vérification SMTP (optionnelle - peut être bloquée par certains serveurs)
    try {
        const smtpResult = await smtpCheck(email, mxHost);

        if (smtpResult.valid) {
            return {
                valid: true,
                deliverable: true,
                mxHost,
                reason: smtpResult.reason === 'catch_all' ? 'catch_all' : undefined,
            };
        } else {
            return {
                valid: false,
                deliverable: false,
                reason: smtpResult.reason as EmailVerificationResult['reason'],
                mxHost,
            };
        }
    } catch {
        // En cas d'erreur SMTP, on considère l'email comme valide si MX existe
        // (beaucoup de serveurs bloquent la vérification SMTP)
        return {
            valid: true,
            deliverable: true,
            mxHost,
            reason: 'catch_all', // On ne peut pas être sûr
        };
    }
}

/**
 * Vérification rapide (format + MX seulement, pas de SMTP)
 * Plus fiable car beaucoup de serveurs bloquent la vérification SMTP
 */
export async function verifyEmailQuick(email: string): Promise<EmailVerificationResult> {
    // 1. Vérifier le format
    if (!isValidEmailFormat(email)) {
        return {
            valid: false,
            deliverable: false,
            reason: 'invalid_format',
        };
    }

    const domain = email.split('@')[1];

    // 2. Vérifier les MX records
    const mxHost = await getMxRecords(domain);
    if (!mxHost) {
        return {
            valid: false,
            deliverable: false,
            reason: 'no_mx',
        };
    }

    // Si MX existe, on considère l'email comme probablement valide
    return {
        valid: true,
        deliverable: true,
        mxHost,
    };
}

/**
 * Générer un code de vérification 6 digits
 */
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
