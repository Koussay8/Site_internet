'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Loader2, ArrowRight, LogOut, Sparkles } from 'lucide-react';

interface User {
    id: string;
    email: string;
    company_name?: string;
    applications?: string[];
}

interface Application {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    href: string;
}

const AVAILABLE_APPS: Record<string, Application> = {
    'cv-profiler': {
        id: 'cv-profiler',
        name: 'CV Profiler',
        description: 'Gestion intelligente des candidatures et recrutement par IA',
        icon: <Users className="w-8 h-8" />,
        href: '/cv-profiler',
    },
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userApps, setUserApps] = useState<Application[]>([]);

    useEffect(() => {
        checkAuthAndApps();
    }, []);

    const checkAuthAndApps = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const storedUser = localStorage.getItem('user');

            if (!token || !storedUser) {
                router.push('/login');
                return;
            }

            const userData: User = JSON.parse(storedUser);
            setUser(userData);

            const apps = (userData.applications || [])
                .map(appId => AVAILABLE_APPS[appId])
                .filter(Boolean);

            setUserApps(apps);
            // PAS de redirection automatique - l'utilisateur choisit

        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <Loader2 className="dashboard-loader-icon" />
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <div className="dashboard-brand-icon">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h1 className="dashboard-brand-name">NovaSolutions</h1>
                        <p className="dashboard-brand-subtitle">Espace Client</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="dashboard-logout-btn">
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                </button>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-welcome">
                    <div className="dashboard-status-badge">
                        <span className="dashboard-status-dot" />
                        Connecté en tant que {user?.company_name || user?.email}
                    </div>
                    <h2 className="dashboard-title">
                        Bienvenue dans votre
                        <span className="dashboard-title-gradient"> Espace Client</span>
                    </h2>
                    <p className="dashboard-subtitle">
                        Sélectionnez une application pour commencer
                    </p>
                </div>

                {/* Applications Grid */}
                {userApps.length > 0 ? (
                    <div className="dashboard-apps-grid">
                        {userApps.map((app) => (
                            <button
                                key={app.id}
                                onClick={() => router.push(app.href)}
                                className="dashboard-app-card"
                            >
                                <div className="dashboard-app-icon">
                                    {app.icon}
                                </div>
                                <div className="dashboard-app-content">
                                    <h3 className="dashboard-app-name">
                                        {app.name}
                                        <ArrowRight size={20} className="dashboard-app-arrow" />
                                    </h3>
                                    <p className="dashboard-app-desc">{app.description}</p>
                                </div>
                                <span className="dashboard-app-badge">Actif</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="dashboard-empty">
                        <div className="dashboard-empty-icon">
                            <Users size={40} />
                        </div>
                        <h3>Aucune application disponible</h3>
                        <p>Contactez votre administrateur pour obtenir l'accès aux applications.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
