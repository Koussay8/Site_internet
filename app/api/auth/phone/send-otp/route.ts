import { NextRequest, NextResponse } from 'next/server';

// Mock OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json(
                { error: 'Numéro de téléphone requis' },
                { status: 400 }
            );
        }

        // Validate phone format (basic validation)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return NextResponse.json(
                { error: 'Format de numéro invalide' },
                { status: 400 }
            );
        }

        // Generate 6-digit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with 10 minutes expiration
        const expiresAt = Date.now() + 10 * 60 * 1000;
        otpStore.set(phone, { code, expiresAt });

        // MOCK: Display code in console instead of sending SMS
        console.log('=====================================');
        console.log(`📱 OTP CODE FOR ${phone}: ${code}`);
        console.log('=====================================');

        // Clean up expired OTPs
        setTimeout(() => {
            const stored = otpStore.get(phone);
            if (stored && stored.expiresAt < Date.now()) {
                otpStore.delete(phone);
            }
        }, 10 * 60 * 1000);

        return NextResponse.json({
            success: true,
            message: 'Code envoyé (vérifiez la console serveur)',
            // In MOCK mode, return the code for easy testing
            mockCode: process.env.NODE_ENV === 'development' ? code : undefined,
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
