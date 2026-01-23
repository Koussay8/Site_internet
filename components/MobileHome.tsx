'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight } from 'lucide-react';
import Hero from '@/components/Hero';
import Advantages from '@/components/Advantages';
import ProblemsSection from '@/components/ProblemsSection';
import ServicesSection from '@/components/ServicesSection';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import RoadmapSection from '@/components/RoadmapSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

// --- Header Mobile avec Menu Hamburger ---
const MobileHeader = ({ onOpenMenu }: { onOpenMenu: () => void }) => (
  <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-2">
      <Image
        src="/logo-white.png"
        alt="Vextra Tech Logo"
        width={32}
        height={32}
        className="object-contain"
      />
      <span className="font-heading font-bold text-lg tracking-tight text-white">Vextra Tech</span>
    </div>
    <button onClick={onOpenMenu} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
      <Menu size={24} />
    </button>
  </header>
);

// --- Menu Latéral (Slide-in) ---
const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[60] bg-[#0F0F10] p-6 flex flex-col"
      >
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-white.png"
              alt="Vextra Tech Logo"
              width={28}
              height={28}
              className="object-contain opacity-80"
            />
            <span className="font-bold text-2xl text-white">Menu</span>
          </div>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white bg-white/5 rounded-full">
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col gap-6 text-xl font-medium text-white/90">
          <a href="#hero" onClick={onClose} className="flex items-center justify-between border-b border-white/10 pb-4">
            Accueil <ArrowRight size={16} className="opacity-50" />
          </a>
          <a href="#services" onClick={onClose} className="flex items-center justify-between border-b border-white/10 pb-4">
            Services <ArrowRight size={16} className="opacity-50" />
          </a>
          <a href="#contact" onClick={onClose} className="flex items-center justify-between border-b border-white/10 pb-4 text-orange-500">
            Contact <ArrowRight size={16} />
          </a>
        </nav>
        <div className="mt-auto">
          <button className="w-full py-4 bg-white text-black font-bold rounded-xl mb-4">
            Espace Client
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Composant Principal Mobile ---
export default function MobileHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">
      <MobileHeader onOpenMenu={() => setIsMenuOpen(true)} />
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main>
        {/* Reusing Shared Components */}
        <Hero />
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
