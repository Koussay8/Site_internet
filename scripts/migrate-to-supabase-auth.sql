-- ============================================
-- MIGRATION SUPABASE AUTH HYBRIDE
-- Exécuter ce script dans Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Ajouter la colonne auth_uid pour lier clients à auth.users
ALTER TABLE clients ADD COLUMN IF NOT EXISTS auth_uid UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Créer index pour performance
CREATE INDEX IF NOT EXISTS idx_clients_auth_uid ON clients(auth_uid);

-- 3. Créer la fonction trigger qui sync auth.users → clients
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.clients (auth_uid, email, company_name, password_hash, applications)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mon Entreprise'),
        'SUPABASE_AUTH',  -- Marqueur : auth gérée par Supabase, pas bcrypt local
        '["cv-profiler"]'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Supprimer l'ancien trigger s'il existe et créer le nouveau
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TERMINÉ !
-- Les prochains signUp() créeront automatiquement une entrée dans clients
-- ============================================
