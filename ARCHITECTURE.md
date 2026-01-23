# Site Vextra Tech - Documentation Technique

## 📊 Performance Optimale

### Métriques actuelles (Production)
- **TTFB**: 4-6ms
- **Bundle JS**: 186KB (gzipped) / 613KB (non-compressé)
- **Scripts**: 11 fichiers
- **HTML initial**: 60KB

### Optimisations implémentées

#### ✅ Server Components
Les composants suivants sont rendus **côté serveur** pour réduire le bundle JS :
- `Advantages` - Section avantages (100% statique)
- `Footer` - Footer avec animations CSS pures
- `PricingSection` - Tarification (calcul serveur)
- `TestimonialsSection` - Témoignages statiques
- `RoadmapSection` - Roadmap transformation

**Impact** : Réduit le bundle client de ~40KB

#### ✅ Code Splitting
- `MobileMenu` : Lazy-loaded uniquement quand ouvert (~41KB motion/react)
- Custom hook `useCountUp` : Extrait dans `/lib/hooks/use-count-up.ts`
- Imports optimisés avec `optimizePackageImports`

#### ✅ Next.js Configuration (`next.config.js`)
```javascript
{
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'motion',
      '@supabase/supabase-js'
    ]
  },
  compiler: {
    removeConsole: { exclude: ['error', 'warn'] } // Prod only
  },
  images: {
    minimumCacheTTL: 31536000 // 1 an
  }
}
```

## 🏗️ Architecture

### Structure des composants

```
components/
├── Hero.tsx              [Client] - Animations complexes
├── MobileHome.tsx        [Client] - Gestion état menu
├── MobileMenu.tsx        [Client] - Menu animé (lazy-loaded)
├── Advantages.tsx        [Server] - Contenu statique ✨
├── Footer.tsx            [Server] - Contenu statique ✨
├── PricingSection.tsx    [Server] - Calcul côté serveur ✨
├── TestimonialsSection.tsx [Server] - Contenu statique ✨
└── RoadmapSection.tsx    [Server] - Contenu statique ✨

lib/
├── hooks/
│   └── use-count-up.ts   - Custom hook animations
├── auth-helpers.ts        - Helpers auth
├── supabase-client.ts     - Client Supabase
└── utils.ts               - Utilitaires
```

### Bonnes pratiques adoptées

#### 1. Server vs Client Components
- **Server par défaut** : Contenu statique, calculs serveur
- **Client uniquement si** : Hooks, événements, animations complexes

#### 2. Lazy Loading
- Composants rarement utilisés (menu mobile)
- Chargement à la demande pour réduire le bundle initial

#### 3. Custom Hooks
- Logique réutilisable extraite (ex: `useCountUp`)
- Testable et maintenable

#### 4. Optimisation images
```tsx
<Image
  src="/logo.png"
  alt="Logo"
  width={32}
  height={32}
  priority // Pour images above-the-fold
/>
```

## 🚀 Commandes

### Développement
```bash
npm run dev        # Dev avec Turbopack
```

### Production
```bash
npm run build      # Build optimisé
npm run start      # Serveur production
```

### Tests performance mobile
```bash
# En local (via réseau WiFi)
# Mobile : http://10.192.34.112:3000

# Pour tester la vraie performance, déployer sur Vercel
vercel --prod
```

## 📱 Optimisation Mobile

### Détection User-Agent (Server-Side)
```typescript
// app/page.tsx
const headers = await headers();
const userAgent = headers.get('user-agent') || '';
const isMobile = /mobile|android|iphone/i.test(userAgent);

return isMobile ? <MobileHome /> : <DesktopHome />;
```

### Pourquoi mode dev est lent ?
- **Compilation à la volée** : Turbopack compile à chaque requête (~500ms)
- **Mode développement** : Pas de compression, source maps inclus
- **Solution** : Tester en **production** (`npm run build && npm run start`)

## 🔧 Prochaines optimisations

### Recommandations futures

1. **Service Worker** : Cache assets statiques
2. **Preconnect DNS** : `<link rel="preconnect" href="https://supabase.co">`
3. **Image CDN** : Utiliser Vercel Image Optimization
4. **Analytics légers** : Éviter Google Analytics (trop lourd), utiliser Plausible/Umami
5. **Bundle Analyzer** : 
   ```bash
   npm i @next/bundle-analyzer
   ANALYZE=true npm run build
   ```

### Checklist déploiement production

- [ ] Variables d'env configurées (Supabase)
- [ ] Build sans erreurs
- [ ] TTFB < 100ms
- [ ] Lighthouse score > 90
- [ ] Test mobile réel (4G/5G)

## 📈 Monitoring

### Métriques à surveiller
- **TTFB** : < 200ms
- **FCP** : < 1.8s
- **LCP** : < 2.5s
- **CLS** : < 0.1
- **FID** : < 100ms

### Outils recommandés
- Vercel Analytics (intégré)
- Lighthouse CI
- WebPageTest.org

## 🐛 Troubleshooting

### "Site lent sur mobile en dev"
→ **Normal**. Tester en production avec `npm run build && npm run start`

### "Bundle trop gros"
→ Vérifier avec `ANALYZE=true npm run build` et supprimer imports inutiles

### "Hydration mismatch"
→ Vérifier que Server/Client Components renvoient le même HTML

## 📚 Ressources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Web Vitals](https://web.dev/vitals/)
