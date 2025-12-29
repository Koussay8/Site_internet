# 🔧 Instructions pour voir les nouveaux boutons

## ✅ Statut : Tout le code est en place

Les fichiers suivants ont été vérifiés et sont corrects :

- ✅ `CandidateSelector.tsx` (11 632 bytes)
- ✅ `JobSelector.tsx` (11 589 bytes)  
- ✅ `jobs/[id]/page.tsx` (562 lignes avec UserPlus, activeTab, jobCandidates)
- ✅ `playgrounds/[id]/page.tsx` (avec FolderPlus, showCandidateSelector, showJobSelector)

## 🚨 Le problème : Cache Safari

Safari garde une version ancienne de la page en cache. Voici la solution :

### Étapes à suivre DANS L'ORDRE

1. **Ferme complètement Safari** (Cmd + Q)

2. **Vide le cache Safari** :
   - Rouvre Safari
   - Menu Safari → Réglages (ou Préférences)
   - Onglet "Avancées"
   - Coche "Afficher le menu Développement"
   - Puis : Menu Développement → Vider les caches
   - OU utilise directement : `Option` + `Cmd` + `E`

3. **Recharge la page** :
   - Va sur <http://localhost:3000/cv-profiler/jobs>
   - Clique sur un poste existant
   - Tu DOIS voir : bouton **"Ajouter des candidats"**

4. **Pour Playgrounds** :
   - Va sur <http://localhost:3000/cv-profiler/playgrounds>
   - Clique sur un playground
   - Tu DOIS voir : boutons **"+ Candidats"** et **"+ Postes"**

## 🎯 Ce que tu vas voir exactement

### Sur la page d'un Poste

- En haut à droite : bouton **"Ajouter des candidats"** (icône UserPlus)
- Deux onglets :
  - **"Candidats associés"** (violet quand sélectionné)
  - **"Matching IA"**

### Sur la page d'un Playground

- En haut :
  - Bouton **"+ Candidats"** (icône UserPlus)
  - Bouton **"+ Postes"** (icône FolderPlus)
- Panel avec les tags de candidats et postes sélectionnés

## ⚠️ Si ça ne marche toujours pas

Utilise Chrome ou Firefox à la place (Safari a des problèmes de cache connus avec Next.js en développement).
