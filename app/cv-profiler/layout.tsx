'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Loader2 } from 'lucide-react';
import CVProfilerSidebar from '@/components/cv-profiler/layout/CVProfilerSidebar';

interface User {
    id: string;
    email: string;
    applications?: string[];
}

// Context pour le mode démo
interface DemoContextType {
    isDemo: boolean;
    ocrUsage: number;
    maxOcr: number;
    incrementUsage: () => void;
    canUseOcr: boolean;
}

const DemoContext = createContext<DemoContextType>({
    isDemo: false,
    ocrUsage: 0,
    maxOcr: 3,
    incrementUsage: () => { },
    canUseOcr: true,
});

export const useDemoMode = () => useContext(DemoContext);

export default function CVProfilerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isDemo, setIsDemo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [ocrUsage, setOcrUsage] = useState(0);
    const maxOcr = 3;

    useEffect(() => {
        checkAccess();
        loadDemoUsage();
    }, []);

    const loadDemoUsage = () => {
        const stored = localStorage.getItem('cvprofiler_demo_ocr');
        if (stored) {
            setOcrUsage(parseInt(stored, 10));
        }
    };

    const incrementUsage = () => {
        const newUsage = ocrUsage + 1;
        setOcrUsage(newUsage);
        localStorage.setItem('cvprofiler_demo_ocr', newUsage.toString());
    };

    const checkAccess = () => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('auth_token');

        // Pas connecté → Rediriger vers login
        if (!storedToken || !storedUser) {
            router.replace('/login');
            return;
        }

        const userData: User = JSON.parse(storedUser);

        // Admin → Accès complet (pas de mode démo)
        if (userData.email === 'admin@nova.com') {
            setIsDemo(false);
            setIsLoading(false);
            return;
        }

        // Utilisateur avec accès approuvé → Accès complet
        const hasAccess = userData.applications?.includes('cv-profiler');

        if (hasAccess) {
            setIsDemo(false);
        } else {
            // Utilisateur connecté mais sans accès → Mode démo
            setIsDemo(true);
        }
        setIsLoading(false);
    };

    const canUseOcr = isDemo ? ocrUsage < maxOcr : true;

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} className="dashboard-loader-icon" style={{ color: '#8B5CF6' }} />
            </div>
        );
    }

    return (
        <DemoContext.Provider value={{ isDemo, ocrUsage, maxOcr, incrementUsage, canUseOcr }}>
            <div className="cv-profiler-app" style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF9' }}>
                <CVProfilerSidebar isDemo={isDemo} />
                <main className="cvp-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Bannière Mode Démo - seulement pour utilisateurs connectés sans accès */}
                    {isDemo && (
                        <div style={{
                            background: 'linear-gradient(90deg, #f97316, #ea580c)',
                            padding: '12px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <AlertTriangle size={20} color="white" />
                                <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                    MODE DÉMO — {maxOcr - ocrUsage} analyse{maxOcr - ocrUsage > 1 ? 's' : ''} restante{maxOcr - ocrUsage > 1 ? 's' : ''} sur {maxOcr}
                                </span>
                            </div>
                            <Link
                                href="/dashboard"
                                style={{
                                    background: 'white',
                                    color: '#ea580c',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                }}
                            >
                                Débloquer l'accès illimité →
                            </Link>
                        </div>
                    )}
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </DemoContext.Provider>
    );
}
