-- ============================================
-- FONCTION POUR CRÉER UN UTILISATEUR
-- Exécutez ce script une seule fois dans Supabase SQL Editor
-- ============================================

-- Installer l'extension pgcrypto si pas déjà fait
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Créer la fonction pour ajouter un utilisateur
CREATE OR REPLACE FUNCTION create_client(
    p_email TEXT,
    p_password TEXT,
    p_company_name TEXT DEFAULT 'Ma Société'
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
    hashed_password TEXT;
BEGIN
    -- Hasher le mot de passe avec bcrypt
    hashed_password := crypt(p_password, gen_salt('bf', 10));
    
    -- Insérer l'utilisateur
    INSERT INTO clients (email, password_hash, company_name)
    VALUES (LOWER(p_email), hashed_password, p_company_name)
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- EXEMPLES D'UTILISATION
-- ============================================

-- Créer un utilisateur:
-- SELECT create_client('user@example.com', 'motDePasse123', 'Ma Société');

-- Créer l'admin nova:
-- SELECT create_client('admin@nova.com', 'nova2024', 'NovaSolutions');
