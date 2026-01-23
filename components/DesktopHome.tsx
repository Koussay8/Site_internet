'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Advantages from '@/components/Advantages';
import ProblemsSection from '@/components/ProblemsSection';
import ServicesSection from '@/components/ServicesSection';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import RoadmapSection from '@/components/RoadmapSection';
import ContactSection from '@/components/ContactSection';
import dynamic from 'next/dynamic';

// Dynamic import for Chatbot to avoid SSR issues
const Chatbot = dynamic(() => import('@/components/Chatbot'), { ssr: false });

export default function DesktopHome() {
    // Force scroll to top on page load
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Remove any hash from URL
            if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname);
            }
            // Force scroll to top immediately
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            // Enable smooth scrolling after page has loaded
            setTimeout(() => {
                document.documentElement.classList.add('loaded');
            }, 100);
        }
    }, []);

    return (
        <>
            <main className="min-h-screen bg-[rgb(30,30,30)]">
                <Header />

                {/* 1. HERO SECTION */}
                <Hero />

                {/* 2. ADVANTAGES */}
                <Advantages />

                {/* 3. PROBLEM-AGITATE SECTION */}
                <ProblemsSection />

                {/* 4. SERVICES/SOLUTIONS SECTION */}
                <ServicesSection />

                {/* 5. PRICING / VALUE STACK */}
                <PricingSection />

                {/* 6. TESTIMONIALS SECTION */}
                <TestimonialsSection />

                {/* 7. TRANSFORMATION SECTION */}
                <RoadmapSection />

                {/* 8. CONTACT SECTION - CONVERTING & WELCOMING */}
                <ContactSection />

                {/* 10. FOOTER */}
                <Footer />

                {/* Chatbot */}
                <Chatbot />
            </main>
        </>
    );
}
