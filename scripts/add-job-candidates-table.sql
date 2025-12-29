-- ============================================
-- TABLE JOB_CANDIDATES (Relation N-N Jobs-Candidates)
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS job_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2),
    matched_skills TEXT[] DEFAULT '{}',
    missing_skills TEXT[] DEFAULT '{}',
    explanation TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_job_candidates_job ON job_candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_job_candidates_candidate ON job_candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_candidates_score ON job_candidates(match_score DESC);

-- RLS
ALTER TABLE job_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON job_candidates FOR ALL USING (true);
