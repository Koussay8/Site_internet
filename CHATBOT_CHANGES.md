# Modifications du Chatbot

Ce document recense les modifications effectuées sur le composant Chatbot depuis le dernier commit git.

## Composant `components/Chatbot.tsx`

### Améliorations Responsive (Mobile)

Des ajustements importants ont été faits pour améliorer l'expérience sur mobile :

1.  **Positionnement du bouton et de la fenêtre :**
    *   Modification des classes de positionnement pour s'adapter aux petits écrans.
    *   Utilisation de `fixed bottom-4 right-4` sur mobile (vs `bottom-6 right-6` sur desktop).
    *   Taille du bouton réduite sur mobile (`w-14 h-14`) vs desktop (`w-16 h-16`).

2.  **Fenêtre de Chat :**
    *   Largeur dynamique : `w-[calc(100vw-2rem)]` sur mobile pour prendre presque toute la largeur, vs fixe `w-[400px]` sur desktop.
    *   Hauteur dynamique : `h-[60dvh]` sur mobile pour éviter les problèmes de barre d'adresse, vs `h-[650px]` sur desktop.
    *   Ajustement du `max-height` pour tenir compte des claviers virtuels et barres de navigation.
    *   Arrondissement des bordures réduit sur mobile (`rounded-[16px]`) vs desktop (`rounded-[30px]`).
    *   Fond opaque sur mobile (`bg-[rgb(10,10,10)]`) pour meilleure lisibilité, vs semi-transparent avec flou sur desktop.

3.  **Zone de Messages :**
    *   Ajout de `overscroll-contain` et `touch-action: pan-y` pour améliorer le défilement tactile.
    *   Support spécifique pour iOS avec `WebkitOverflowScrolling: 'touch'`.
    *   Ajustement des paddings et espacements (`p-4` et `space-y-4` sur mobile).

4.  **Champ de Saisie :**
    *   Augmentation de la taille de police à `text-base` (16px) sur mobile pour empêcher le zoom automatique du navigateur lors du focus sur l'input.
    *   Sur desktop, la police reste à `text-sm`.
