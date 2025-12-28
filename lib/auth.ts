import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export interface AuthUser {
    userId: string;
    email: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);
        const { payload } = await jwtVerify(token, JWT_SECRET);

        if (!payload.userId || !payload.email) {
            return null;
        }

        return {
            userId: payload.userId as string,
            email: payload.email as string,
        };
    } catch (error) {
        console.error('Auth verification failed:', error);
        return null;
    }
}

export function unauthorizedResponse() {
    return Response.json({ error: 'Non autorisé' }, { status: 401 });
}
