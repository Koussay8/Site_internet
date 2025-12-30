# Spécification Projet NovaSolutions

## Vision Produit

**Mission** : Créer la plateforme digitale de référence pour NovaSolutions, l'agence d'automatisation IA pour TPE/PME.

**Objectifs** :

1. Convertir les visiteurs en leads qualifiés
2. Démontrer l'expertise IA par l'exemple (chatbot intégré)
3. Générer de la confiance via témoignages et cas d'usage

---

## Fonctionnalités Core

### 1. Site Vitrine

| Feature | Priorité | Status |
|---------|----------|--------|
| Page d'accueil avec proposition de valeur | P0 | ✅ |
| Pages secteurs (12) | P1 | En cours |
| Page produits/services | P1 | En cours |
| Page contact / prise de RDV | P0 | ✅ |

### 2. Chatbot IA 24/7

| Feature | Priorité | Status |
|---------|----------|--------|
| Chatbot intégré au site | P0 | ✅ |
| Knowledge base secteurs | P0 | ✅ |
| Qualification leads | P0 | ✅ |
| Prise de RDV intégrée | P1 | En cours |
| Widget embeddable clients | P1 | ✅ |

### 3. CV Profiler (Outil Demo)

| Feature | Priorité | Status |
|---------|----------|--------|
| Upload et analyse CV | P1 | ✅ |
| Scoring candidats | P1 | ✅ |
| Dashboard admin | P2 | En cours |

---

## Stack Technique

```yaml
Frontend:
  - Next.js 16.1.1 (App Router)
  - React 19.2.3
  - TailwindCSS 4.x
  - TypeScript 5.x

Backend:
  - Next.js API Routes
  - Supabase (PostgreSQL + Auth)
  - Edge Functions (si besoin)

IA:
  - Groq API (LLaMA 3)
  - OpenAI API (backup)
  - Knowledge base JSON

Déploiement:
  - Vercel (production)
  - Supabase Cloud (BDD)
```

---

## Contraintes

### Performance

- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3.5s
- Réponse chatbot < 2s

### SEO

- Score Lighthouse > 90
- Meta tags sur toutes les pages
- Sitemap généré automatiquement
- Schema.org structured data

### Accessibilité

- WCAG 2.1 niveau AA minimum
- Navigation clavier complète
- Contraste couleurs suffisant

### Sécurité

- HTTPS obligatoire
- CORS configuré
- Rate limiting APIs
- RLS Supabase activé

---

## Secteurs Métier

Les 12 secteurs avec leurs spécificités :

1. **Esthéticiens & Médecine Esthétique**
2. **Dentistes & Orthodontistes**
3. **Spas & Bien-Être**
4. **Artisans & Bâtiment**
5. **Solaire & Photovoltaïque**
6. **Fournisseurs Matériaux**
7. **Avocats & Notaires**
8. **Nettoyage Industriel**
9. **Immobilier & Habitat**
10. **Logistique & Grossistes**
11. **Écoles Privées & Formation**
12. **Événementiel & Traiteurs**

Chaque secteur a :

- Problèmes spécifiques identifiés
- Solution IA adaptée
- Argument commercial clé

Référence : `knowledge-base.json`
