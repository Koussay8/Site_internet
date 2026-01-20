import { supabaseClient } from './supabase-client';

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/api/auth/oauth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    if (error) {
        console.error('Google OAuth error:', error);
        throw error;
    }

    return data;
}

/**
 * Sign in with Facebook OAuth
 */
export async function signInWithFacebook() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
            redirectTo: `${window.location.origin}/api/auth/oauth/callback`,
        },
    });

    if (error) {
        console.error('Facebook OAuth error:', error);
        throw error;
    }

    return data;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de connexion');
        }

        // Store token and user in localStorage
        if (data.token) {
            localStorage.setItem('auth_token', data.token);
            if (data.refreshToken) {
                localStorage.setItem('refresh_token', data.refreshToken);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        }

        return data;
    } catch (error) {
        console.error('Email sign in error:', error);
        throw error;
    }
}

/**
 * Sign out the current user
 */
export async function signOut() {
    // Clear Supabase session
    await supabaseClient.auth.signOut();

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Redirect to home
    window.location.href = '/';
}

/**
 * Get the current session
 */
export async function getSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error('Error getting session:', error);
        return null;
    }

    return session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error) {
        console.error('Error getting user:', error);
        return null;
    }

    return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const session = await getSession();
    return !!session;
}

/**
 * Send OTP code to phone number
 */
export async function sendPhoneOTP(phone: string) {
  try {
    const response = await fetch('/api/auth/phone/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de l\'envoi du code');
    }

    return data;
  } catch (error) {
    console.error('Phone OTP send error:', error);
    throw error;
  }
}

/**
 * Verify OTP code for phone number
 */
export async function verifyPhoneOTP(phone: string, code: string) {
  try {
    const response = await fetch('/api/auth/phone/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Code incorrect');
    }

    // Store token and user in localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }

    return data;
  } catch (error) {
    console.error('Phone OTP verify error:', error);
    throw error;
  }
}
