# NovaSolutions - Mémoire Projet Claude

Ce fichier est automatiquement chargé par Claude pour fournir le contexte du projet.

## Commandes Courantes

```bash
# Développement
npm run dev          # Démarre le serveur de développement (localhost:3000)
npm run build        # Build de production
npm run lint         # Vérification ESLint

# Base de données
# Supabase Dashboard : https://supabase.com/dashboard
```

## Architecture du Projet

```
Site_internet/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Page d'accueil NovaSolutions
│   ├── api/               # API Routes
│   │   ├── chat/          # API Chatbot principal
│   │   └── embed/         # API Chatbot embeddable
│   └── [secteurs]/        # Pages secteurs (esthétique, dentistes, etc.)
├── components/             # Composants React réutilisables
│   ├── Chatbot.tsx        # Composant chatbot IA
│   └── Typewriter.tsx     # Animation de texte
├── lib/                    # Utilitaires et configuration
│   ├── supabase.ts        # Client Supabase
│   └── auth.ts            # Authentification
├── knowledge-base.json     # Base de connaissances NovaSolutions
└── scripts/               # Scripts utilitaires et SQL
```

## Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 16.1.1 | Framework React full-stack |
| React | 19.2.3 | Librairie UI |
| TypeScript | 5.x | Typage statique |
| TailwindCSS | 4.x | Styling utilitaire |
| Supabase | 2.89.0 | Backend-as-a-Service (Auth, DB) |
| Recharts | 3.6.0 | Graphiques et visualisations |

## Contexte Métier NovaSolutions

**Mission** : Automatisation IA pour TPE/PME
**Approche** : Assistants IA travaillant 24/7 pour libérer du temps et ne plus perdre de clients

### Secteurs Cibles (12)

1. **Esthéticiens & Médecine Esthétique** - Chatbot 24/7, pré-qualification prospects
2. **Dentistes & Orthodontistes** - Rappel RDV automatique, réduction no-show
3. **Spas & Bien-Être** - Yield management IA, promos flash SMS
4. **Artisans & Bâtiment** - Répondeur IA vocal, qualification leads
5. **Solaire & Photovoltaïque** - Calculateur solaire, pré-qualification leads
6. **Fournisseurs Matériaux** - Agent conversationnel connecté au stock
7. **Avocats & Notaires** - Chatbot empathique, collecte info préliminaire
8. **Nettoyage Industriel** - Génération leads B2B
9. **Immobilier & Habitat** - Sites mandataires, assistants locataires
10. **Logistique & Grossistes** - WhatsApp Business + agent IA
11. **Écoles Privées** - Chatbot pédagogique parents
12. **Événementiel & Traiteurs** - Automatisation réponses rapides

### Produits Phares

- **Agent CV Profiler** : Analyse automatique CVs, scoring candidats
- **Chatbot IA Site Web** : Assistant 24/7, qualification leads
- **Transcription Réunions** : Résumés intelligents, points d'action
- **Automatisation Email IA** : Personnalisation à grande échelle

## Standards de Code

### TypeScript

- Mode strict activé
- Typage explicite pour les fonctions publiques
- Éviter `any`, préférer `unknown` si nécessaire
- Interfaces pour les props React

### React/Next.js

- Server Components par défaut
- Client Components avec `'use client'` explicite
- Imports dynamiques pour le code splitting
- Metadata SEO sur chaque page

### Conventions de Nommage

- **Fichiers** : `kebab-case.tsx` pour les routes, `PascalCase.tsx` pour les composants
- **Variables** : `camelCase`
- **Constantes** : `UPPER_SNAKE_CASE`
- **Types/Interfaces** : `PascalCase`

### Git

- Commits atomiques et descriptifs
- Format : `type(scope): description` (ex: `feat(chatbot): add typing animation`)

## Fichiers Critiques

- `knowledge-base.json` : Base de connaissances complète NovaSolutions
- `.env.local` : Variables d'environnement (API keys, Supabase)
- `components/Chatbot.tsx` : Composant chatbot principal
- `app/api/chat/route.ts` : API endpoint chatbot

## Notes Importantes

> ⚠️ Le fichier `.env.local` n'est JAMAIS commité. Contient les clés API sensibles.

> 💡 Pour tester le chatbot en local, utiliser `npm run dev` et accéder à localhost:3000

> 🔧 Les scripts SQL sont dans `scripts/` pour la gestion de la base Supabase
