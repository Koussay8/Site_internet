-- ============================================
-- MISE À JOUR SCHÉMA POUR FORMULAIRES PUBLICS
-- ============================================

-- Ajouter colonne slug aux formulaires
ALTER TABLE forms ADD COLUMN IF NOT EXISTS slug TEXT;

-- Ajouter source des candidats (formulaire public)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS source_form_id UUID REFERENCES forms(id) ON DELETE SET NULL;

-- Index pour recherche par slug
CREATE INDEX IF NOT EXISTS idx_forms_slug ON forms(slug);
