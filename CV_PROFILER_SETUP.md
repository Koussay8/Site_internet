# CV Profiler - Guide de Configuration

## Tables Supabase Requises

Pour que l'application fonctionne, vous devez créer les tables suivantes dans Supabase.
Exécutez le script SQL dans `/scripts/database-schema.sql` dans l'éditeur SQL de Supabase.

### Tables à créer

1. **candidates** - Stocke les candidats importés
2. **jobs** - Stocke les postes/offres d'emploi
3. **playgrounds** - Groupes pour organiser les candidats
4. **public_forms** - Formulaires publics de candidature
5. **upload_status** - Suivi du statut des uploads

## Variables d'environnement

Ajoutez ces variables à votre `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
JWT_SECRET=un-secret-tres-securise-pour-jwt

# Optionnel - pour la recherche IA
GROQ_API_KEY=votre_cle_groq_api
```

## Obtenir une clé API Groq (pour la recherche IA)

1. Allez sur <https://console.groq.com/>
2. Créez un compte gratuit
3. Générez une API key
4. Ajoutez-la à `.env.local` sous `GROQ_API_KEY`

Sans cette clé, la recherche IA utilisera une recherche par mots-clés en fallback.

## Fonctionnalités Implémentées

### APIs

- ✅ `/api/candidates` - GET (liste), POST (création)
- ✅ `/api/candidates/[id]` - GET, PUT, DELETE
- ✅ `/api/jobs` - GET (liste), POST (création)
- ✅ `/api/jobs/[id]` - GET, PUT, DELETE
- ✅ `/api/playgrounds` - GET (liste), POST (création)
- ✅ `/api/playgrounds/[id]` - GET, PUT, DELETE
- ✅ `/api/playgrounds/[id]/candidates` - POST (ajouter), DELETE (retirer)
- ✅ `/api/upload` - POST (upload de CVs avec extraction)
- ✅ `/api/upload/status` - GET (statut des uploads)
- ✅ `/api/ai-search` - POST (recherche IA avec Groq/Llama-3)
- ✅ `/api/stats` - GET (statistiques dashboard)

### Pages

- ✅ `/dashboard` - Sélection d'applications (sans redirection auto)
- ✅ `/cv-profiler` - Dashboard avec stats dynamiques et graphiques
- ✅ `/cv-profiler/candidates` - Liste des candidats avec modal détail
- ✅ `/cv-profiler/jobs` - Gestion des postes avec création/édition
- ✅ `/cv-profiler/playgrounds` - Groupes de candidats
- ✅ `/cv-profiler/upload` - Upload de CVs avec drag & drop
- ✅ `/cv-profiler/forms` - Formulaires publics (structure prête)

### Design

- ✅ Design SaaS premium avec fond beige `#FAFAF9`
- ✅ Sidebar sombre minimaliste
- ✅ Header Bar avec recherche IA intégrée
- ✅ Graphiques Recharts (Area Chart, Donut Chart)
- ✅ Ombres douces et coins arrondis

## Lancer l'application

```bash
npm run dev
```

Puis ouvrir <http://localhost:3000>

## Tester l'upload de CVs

1. Aller sur `/cv-profiler/upload`
2. Glisser-déposer un fichier PDF, DOCX ou TXT
3. Cliquer sur "Importer"
4. Le candidat sera créé automatiquement avec extraction des infos

## Tester la recherche IA

1. Dans le dashboard CV Profiler
2. Taper une recherche comme "développeur Python avec 3 ans d'expérience"
3. Appuyer sur Entrée
4. Les candidats correspondants apparaîtront
