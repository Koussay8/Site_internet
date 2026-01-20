import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');

    if (error) {
        console.error('OAuth error:', error, errorDescription);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || error)}`);
    }

    if (!code) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`);
    }

    try {
        // Create a Supabase client with the auth code
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Exchange the code for a session
        const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError || !session) {
            console.error('Session exchange error:', sessionError);
            return NextResponse.redirect(`${requestUrl.origin}/login?error=session_error`);
        }

        const user = session.user;
        console.log('OAuth user:', user.id, user.email);

        // Check if client already exists in our database
        const { data: existingClient, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('auth_uid', user.id)
            .single();

        if (clientError && clientError.code !== 'PGRST116') {
            // PGRST116 = not found, which is ok
            console.error('Error checking existing client:', clientError);
        }

        if (!existingClient) {
            // Create new client record
            const { error: insertError } = await supabase
                .from('clients')
                .insert({
                    auth_uid: user.id,
                    email: user.email,
                    company_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Mon Entreprise',
                    is_verified: true, // OAuth emails are pre-verified
                    password_hash: null, // No password for OAuth users
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString(),
                });

            if (insertError) {
                console.error('Error creating client:', insertError);
                return NextResponse.redirect(`${requestUrl.origin}/login?error=database_error`);
            }

            console.log('Created new client for OAuth user:', user.email);
        } else {
            // Update last login
            await supabase
                .from('clients')
                .update({ last_login: new Date().toISOString() })
                .eq('id', existingClient.id);
        }

        // Redirect to dashboard with session tokens
        const redirectUrl = new URL('/dashboard', requestUrl.origin);
        redirectUrl.searchParams.set('access_token', session.access_token);
        redirectUrl.searchParams.set('refresh_token', session.refresh_token);

        const response = NextResponse.redirect(redirectUrl);

        // Set cookies for server-side session management
        response.cookies.set('sb-access-token', session.access_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        response.cookies.set('sb-refresh-token', session.refresh_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return response;

    } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=server_error`);
    }
}
