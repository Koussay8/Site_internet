-- Table pour gérer les accès aux applications
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table app_access
CREATE TABLE IF NOT EXISTS app_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  app_name TEXT NOT NULL,
  access_level TEXT DEFAULT 'demo' CHECK (access_level IN ('demo', 'standard', 'admin')),
  bot_limit INTEGER DEFAULT 1,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by TEXT,
  notes TEXT,
  UNIQUE(user_email, app_name)
);

-- 2. Créer index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_app_access_user_email ON app_access(user_email);
CREATE INDEX IF NOT EXISTS idx_app_access_app_name ON app_access(app_name);

-- 3. Enable RLS
ALTER TABLE app_access ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Admin peut tout voir
CREATE POLICY "Admin full access" ON app_access
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@nova.com');

-- 5. Policy: Users voient leurs propres accès
CREATE POLICY "Users see own access" ON app_access
  FOR SELECT
  TO authenticated
  USING (user_email = auth.jwt() ->> 'email');

-- 6. Fonction pour vérifier l'accès
CREATE OR REPLACE FUNCTION check_app_access(user_email_param TEXT, app_name_param TEXT)
RETURNS TABLE (
  has_access BOOLEAN,
  access_level TEXT,
  bot_limit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as has_access,
    aa.access_level,
    aa.bot_limit
  FROM app_access aa
  WHERE aa.user_email = user_email_param 
    AND aa.app_name = app_name_param;
  
  -- Si pas de résultat, retourner demo par défaut
  IF NOT FOUND THEN
    RETURN QUERY SELECT TRUE, 'demo'::TEXT, 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Accorder l'accès admin à admin@nova.com pour Agent WhatsApp
INSERT INTO app_access (user_email, app_name, access_level, bot_limit, granted_by)
VALUES ('admin@nova.com', 'agent-whatsapp', 'admin', 999, 'system')
ON CONFLICT (user_email, app_name) DO UPDATE 
SET access_level = 'admin', bot_limit = 999;
