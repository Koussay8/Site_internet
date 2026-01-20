# Guide de Style Vextra Tech

Ce document définit les standards de design pour le site Vextra Tech, basés sur l'analyse de l'implémentation actuelle.

## 1. Palette de Couleurs

### Couleurs Principales
- **Background**: `#1E1E1E` (rgb(30,30,30)) - Utilisé pour le fond général.
- **Foreground (Texte)**: `#FFFFFF` - Texte principal.
- **Accent**: `#F97316` (Orange 500) / `#FF6B00` (Variable CSS) - Utilisé pour les mises en valeur, points, et éléments interactifs.

### Couleurs Secondaires
- **Texte Secondaire**: `text-gray-400` (#9CA3AF) - Paragraphes et descriptions.
- **Texte Tertiaire**: `text-gray-300` (#D1D5DB) - Labels et détails mineurs.

### Couleurs de Statut (Dashboard/Stats)
- **Bleu**: `text-blue-500` (Productivité)
- **Vert**: `text-green-500` (Précision)
- **Violet**: `text-purple-500` (Économies)
- **Rose**: `text-pink-500` (Disponibilité)

## 2. Typographie

**Police Principale**: `Inter` (sans-serif)

### Hiérarchie
- **H1 (Hero)**:
  - Taille: `text-4xl` (mobile), `md:text-5xl` (tablette), `lg:text-6xl` (desktop)
  - Poids: `font-bold`
  - Letter-spacing: `tracking-tight`
  - Line-height: `leading-[1.1]`
- **Chiffres Clés (Stats)**:
  - Taille: `text-3xl`, `lg:text-4xl`
  - Poids: `font-bold`
- **Navigation**:
  - Taille: `text-lg` (Logo), Default (Menu)
  - Poids: `font-bold` (Logo), `font-medium` (Menu)
- **Corps de texte**:
  - Taille: `text-base`, `md:text-lg`
  - Poids: Regular

## 3. Espacement et Layout

- **Container Principal**: `max-w-7xl mx-auto`
- **Padding Horizontal**: `px-6` (mobile), `md:px-12` (desktop)
- **Padding Vertical**:
  - Header: `py-6`
  - Section Top: `pt-24`
- **Arrondis (Border Radius)**:
  - Boutons: `rounded-full`
  - Cartes/Containers: `rounded-3xl`
  - Éléments internes: `rounded-xl`

## 4. Effets Visuels

- **Glassmorphism**:
  - Background: `bg-white/10` ou `bg-gradient-to-br from-white/10 to-white/5`
  - Blur: `backdrop-blur-sm`, `backdrop-blur-md`
  - Border: `border-white/20`, `border-gray-800/50`
- **Ombres**: `shadow-2xl`, `hover:shadow-orange-500/20` (Glow effect)
- **Gradients Texte**: `bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent`

## 5. Composants

### Header
- Position: `fixed top-0 left-0 w-full`
- Z-Index: `z-50`
- Fond: `bg-transparent` (avec mix-blend-difference pour la lisibilité)

### Boutons
- Style: `rounded-full`, `border border-white/20`
- Interaction: `hover:bg-white/20`, `transition-all`
