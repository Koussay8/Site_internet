-- ============================================
-- SYSTÈME EMAIL & NEWSLETTER
-- Tables pour leads, vérification, newsletters
-- ============================================

-- 1. TABLE LEADS (Newsletter)
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    source TEXT DEFAULT 'website', -- 'website', 'chatbot', 'register', 'contact'
    subscribed BOOLEAN DEFAULT true,
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_subscribed ON leads(subscribed);

-- 2. TABLE EMAIL_VERIFICATION_CODES
-- ============================================
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_code ON email_verification_codes(code);

-- 3. TABLE NEWSLETTER_CAMPAIGNS
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    sent_by UUID REFERENCES clients(id),
    recipients_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft', -- 'draft', 'sending', 'sent', 'failed'
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MODIFIER TABLE CLIENTS
-- ============================================
-- Ajouter les colonnes si elles n'existent pas

DO $$ 
BEGIN
    -- Ajouter is_verified si n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'is_verified') THEN
        ALTER TABLE clients ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;

    -- Ajouter is_admin si n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'is_admin') THEN
        ALTER TABLE clients ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 5. POLICIES (permettre l'accès)
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Policies permissives (l'API gère la sécurité)
DROP POLICY IF EXISTS "Allow all leads" ON leads;
DROP POLICY IF EXISTS "Allow all verification" ON email_verification_codes;
DROP POLICY IF EXISTS "Allow all newsletters" ON newsletter_campaigns;

CREATE POLICY "Allow all leads" ON leads FOR ALL USING (true);
CREATE POLICY "Allow all verification" ON email_verification_codes FOR ALL USING (true);
CREATE POLICY "Allow all newsletters" ON newsletter_campaigns FOR ALL USING (true);

-- 6. FONCTION DE NETTOYAGE DES CODES EXPIRÉS
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verification_codes 
    WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGER UPDATE TIMESTAMP POUR LEADS
-- ============================================
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TERMINÉ !
-- ============================================
