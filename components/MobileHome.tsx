'use client';

import { useState, Suspense, lazy } from 'react';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import Hero from '@/components/Hero';

// ===== OPTIMISATION BUNDLE JS =====
// Menu mobile - lazy car rarement utilisé
const MobileMenuLazy = lazy(() => import('@/components/MobileMenu'));

// Sections statiques (Server Components) - pas de lazy load nécessaire
// Importées directement car rendues côté serveur
import Advantages from '@/components/Advantages';
import ProblemsSection from '@/components/ProblemsSection';
import ServicesSection from '@/components/ServicesSection';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import RoadmapSection from '@/components/RoadmapSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

// --- Header Mobile avec Menu Hamburger (statique, pas d'animation) ---
const MobileHeader = ({ onOpenMenu }: { onOpenMenu: () => void }) => (
  <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-2">
      <Image
        src="/logo-white.png"
        alt="Vextra Tech Logo"
        width={32}
        height={32}
        className="object-contain"
        priority
      />
      <span className="font-heading font-bold text-lg tracking-tight text-white">Vextra Tech</span>
    </div>
    <button onClick={onOpenMenu} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
      <Menu size={24} />
    </button>
  </header>
);

// --- Composant Principal Mobile ---
export default function MobileHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">
      <MobileHeader onOpenMenu={() => setIsMenuOpen(true)} />
      
      {/* Menu chargé seulement quand nécessaire */}
      {isMenuOpen && (
        <Suspense fallback={null}>
          <MobileMenuLazy isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </Suspense>
      )}

      <main>
        {/* Above the fold - chargement immédiat */}
        <Hero />
        
        {/* Below the fold - Server Components (pas de lazy load) */}
        <Advantages />
        <ProblemsSection />
        <ServicesSection />
        <PricingSection />
        <TestimonialsSection />
        <RoadmapSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
