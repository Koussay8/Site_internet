import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailQuick } from '@/lib/email-verifier';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email requis' },
                { status: 400 }
            );
        }

        const result = await verifyEmailQuick(email.toLowerCase().trim());

        return NextResponse.json({
            valid: result.valid,
            deliverable: result.deliverable,
            reason: result.reason,
            mxHost: result.mxHost,
        });
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la vérification' },
            { status: 500 }
        );
    }
}
