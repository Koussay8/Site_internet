import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Get Supabase Admin client (uses SERVICE_ROLE_KEY for full access)
 * Only use in server-side API routes!
 */
export function getSupabaseAdmin(): SupabaseClient {
    if (!supabaseAdminInstance) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !key) {
            throw new Error(`Supabase config missing: URL=${!!url}, KEY=${!!key}`);
        }

        supabaseAdminInstance = createClient(url, key);
    }
    return supabaseAdminInstance;
}
