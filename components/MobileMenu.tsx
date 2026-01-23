'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
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
}
