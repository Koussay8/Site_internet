/**
 * App Access Helper - Gestion des accès aux applications
 */

import { supabase } from '@/lib/supabase';

export type AccessLevel = 'demo' | 'standard' | 'admin';

export interface AppAccess {
    hasAccess: boolean;
    accessLevel: AccessLevel;
    botLimit: number;
}

/**
 * Vérifier l'accès d'un utilisateur à une application
 */
export async function checkAppAccess(
    userEmail: string,
    appName: string
): Promise<AppAccess> {
    try {
        const { data, error } = await supabase
            .from('app_access')
            .select('access_level, bot_limit')
            .eq('user_email', userEmail)
            .eq('app_name', appName)
            .single();

        if (error || !data) {
            // Pas d'accès spécifique = mode demo par défaut
            return {
                hasAccess: true,
                accessLevel: 'demo',
                botLimit: 1,
            };
        }

        return {
            hasAccess: true,
            accessLevel: data.access_level as AccessLevel,
            botLimit: data.bot_limit || 1,
        };
    } catch {
        return {
            hasAccess: true,
            accessLevel: 'demo',
            botLimit: 1,
        };
    }
}

/**
 * Accorder l'accès à une application (admin only)
 */
export async function grantAppAccess(
    userEmail: string,
    appName: string,
    accessLevel: AccessLevel,
    botLimit: number,
    grantedBy: string
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('app_access')
            .upsert({
                user_email: userEmail,
                app_name: appName,
                access_level: accessLevel,
                bot_limit: botLimit,
                granted_by: grantedBy,
                granted_at: new Date().toISOString(),
            }, {
                onConflict: 'user_email,app_name',
            });

        return !error;
    } catch {
        return false;
    }
}

/**
 * Révoquer l'accès à une application (admin only)
 */
export async function revokeAppAccess(
    userEmail: string,
    appName: string
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('app_access')
            .delete()
            .eq('user_email', userEmail)
            .eq('app_name', appName);

        return !error;
    } catch {
        return false;
    }
}

/**
 * Lister tous les accès pour une application (admin only)
 */
export async function listAppAccessByApp(appName: string) {
    try {
        const { data, error } = await supabase
            .from('app_access')
            .select('*')
            .eq('app_name', appName)
            .order('granted_at', { ascending: false });

        if (error) return [];
        return data;
    } catch {
        return [];
    }
}
