-- ============================================
-- SCRIPT SQL COMPLET ET CORRIGÉ
-- CV Profiler - Schéma de Base de Données
-- ============================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TABLE CLIENTS (Authentification Custom)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    applications JSONB DEFAULT '["cv-profiler"]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- ============================================
-- 3. TABLE CANDIDATES
-- ============================================
DROP TABLE IF EXISTS candidates CASCADE;
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    skills TEXT[] DEFAULT '{}',
    experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    cv_url TEXT,
    cv_text TEXT,
    match_score NUMERIC(5,2),
    psychological_profile JSONB,
    playground_ids TEXT[] DEFAULT '{}',
    source_form_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON candidates USING gin (skills);

-- ============================================
-- 4. TABLE JOBS
-- ============================================
DROP TABLE IF EXISTS jobs CASCADE;
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    required_skills JSONB DEFAULT '[]',
    min_experience INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);

-- ============================================
-- 5. TABLE PLAYGROUNDS
-- ============================================
DROP TABLE IF EXISTS playgrounds CASCADE;
CREATE TABLE playgrounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#8B5CF6',
    candidate_ids TEXT[] DEFAULT '{}',
    job_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playgrounds_user_id ON playgrounds(user_id);

-- ============================================
-- 6. TABLE FORMS
-- ============================================
DROP TABLE IF EXISTS forms CASCADE;
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    job_id UUID,
    fields JSONB DEFAULT '[]',
    slug TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_slug ON forms(slug);

-- ============================================
-- 7. TABLE FORM_SUBMISSIONS
-- ============================================
DROP TABLE IF EXISTS form_submissions CASCADE;
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. TABLE UPLOAD_STATUS
-- ============================================
DROP TABLE IF EXISTS upload_status CASCADE;
CREATE TABLE upload_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    candidate_id UUID,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. ROW LEVEL SECURITY (Désactivé pour simplifier)
-- ============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_status ENABLE ROW LEVEL SECURITY;

-- Policies permissives (l'API gère la sécurité)
CREATE POLICY "Allow all" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all" ON candidates FOR ALL USING (true);
CREATE POLICY "Allow all" ON jobs FOR ALL USING (true);
CREATE POLICY "Allow all" ON playgrounds FOR ALL USING (true);
CREATE POLICY "Allow all" ON forms FOR ALL USING (true);
CREATE POLICY "Allow all" ON form_submissions FOR ALL USING (true);
CREATE POLICY "Allow all" ON upload_status FOR ALL USING (true);

-- ============================================
-- 10. FONCTION UPDATE TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS update_playgrounds_updated_at ON playgrounds;
DROP TRIGGER IF EXISTS update_forms_updated_at ON forms;

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_playgrounds_updated_at BEFORE UPDATE ON playgrounds FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 11. DONNÉES INITIALES
-- ============================================
-- L'admin sera créé via le script node scripts/add-admin.js
-- après l'exécution de ce script SQL

-- ============================================
-- TERMINÉ !
-- ============================================
