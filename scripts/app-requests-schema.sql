-- ============================================
-- TABLE APP_REQUESTS
-- Demandes d'accès aux applications
-- Exécuter dans Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS app_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    app_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    message TEXT,                  -- Message du client
    rdv_date TIMESTAMPTZ,          -- Date RDV demandée (optionnel)
    rdv_contact TEXT,              -- Email/téléphone pour le RDV
    admin_notes TEXT,              -- Notes de l'admin
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_app_requests_client ON app_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_app_requests_status ON app_requests(status);

-- RLS
ALTER TABLE app_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON app_requests FOR ALL USING (true);

-- ============================================
-- TABLE DEMO_USAGE (suivi limites démo)
-- ============================================

CREATE TABLE IF NOT EXISTS demo_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    app_id TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    max_usage INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_demo_usage_client ON demo_usage(client_id);
ALTER TABLE demo_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON demo_usage FOR ALL USING (true);
