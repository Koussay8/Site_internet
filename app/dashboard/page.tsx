'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Loader2, ArrowRight, LogOut, Sparkles, Plus, X, Mic, Calendar, ExternalLink, Play, MessageSquare, Mail, Globe, FileText, Box, Video, Image as ImageIcon, MessageCircle } from 'lucide-react';
import Chatbot from '@/components/Chatbot';

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
    demoHref?: string;
    externalDemo?: boolean;
}

interface AppRequest {
    id: string;
    app_id: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

const ALL_APPS: Record<string, Application> = {
    'agent-whatsapp': {
        id: 'agent-whatsapp',
        name: 'Agent WhatsApp',
        description: 'Bot WhatsApp intelligent pour votre entreprise. Transcription vocale, facturation auto, et réponses IA 24h/24.',
        icon: <MessageCircle className="w-8 h-8" />,
        href: '/apps/agent-whatsapp',
        demoHref: '/apps/agent-whatsapp?demo=true',
    },
    'cv-profiler': {
        id: 'cv-profiler',
        name: 'CV Profiler',
        description: 'Recrutez 3x plus vite. L\'IA analyse, trie et matche automatiquement vos CVs avec vos postes.',
        icon: <Users className="w-8 h-8" />,
        href: '/cv-profiler',
        demoHref: '/cv-profiler',
    },
    'agent-telephonique': {
        id: 'agent-telephonique',
        name: 'Agent Téléphonique IA 24/7',
        description: 'Réceptionniste IA 24h/24 qui qualifie vos prospects et prend des RDV. Dupliquez votre propre voix ou choisissez parmi des centaines.',
        icon: <Mic className="w-8 h-8" />,
        href: 'https://aivoicedemo.vercel.app',
        demoHref: 'https://aivoicedemo.vercel.app',
        externalDemo: true,
    },
    'chatbot-ia': {
        id: 'chatbot-ia',
        name: 'Chatbot IA Multi-Canal',
        description: 'Assistant IA sur votre site, Instagram, WhatsApp ou Messenger. Répond, rassure vos clients et prend des RDV 24h/24.',
        icon: <MessageSquare className="w-8 h-8" />,
        href: '#',
        demoHref: '#',
    },
    'qualification-dossiers': {
        id: 'qualification-dossiers',
        name: 'Qualification de Dossiers IA',
        description: 'Qualifiez automatiquement les dossiers clients avant la première visite. L\'IA vérifie l\'éligibilité et prépare un résumé complet.',
        icon: <FileText className="w-8 h-8" />,
        href: '#',
        demoHref: '#',
    },
    'email-automation': {
        id: 'email-automation',
        name: 'Emailing IA Personnalisé',
        description: 'Emails qui convertissent vraiment. L\'IA rédige des messages hyper-personnalisés pour chaque contact.',
        icon: <Mail className="w-8 h-8" />,
        href: '#',
        demoHref: '#',
    },
    'site-web-premium': {
        id: 'site-web-premium',
        name: 'Site Web Premium',
        description: 'Votre site en 1ère page Google. Design sur-mesure, SEO 100% optimisé, espace client, e-commerce possible.',
        icon: <Globe className="w-8 h-8" />,
        href: '#',
        demoHref: '#',
    },
    'automatisation-rdv': {
        id: 'automatisation-rdv',
        name: 'Automatisation RDV & Tâches',
        description: 'Libérez 10h par semaine. Automatisez la prise de RDV, les rappels, les tâches récurrentes.',
        icon: <Calendar className="w-8 h-8" />,
        href: '#',
        demoHref: '#',
    },
    'calculateur-devis': {
        id: 'calculateur-devis',
        name: 'Calculateur Éligibilité & Devis IA',
        description: 'Pré-qualifiez les clients et générez des devis professionnels en 30 secondes. Ne transmettez que les dossiers finançables.',
        icon: <FileText className="w-8 h-8" />,
        href: '#',
        demoHref: '#',
    },
    'visualiseur-3d': {
        id: 'visualiseur-3d',
        name: 'Visualiseur 3D Architecture',
        description: 'Transformez vos plans en visites virtuelles époustouflantes. Rendu haute résolution.',
        icon: <Box className="w-8 h-8" />,
        href: '#',
        demoHref: '#',
    },
    'video-marketing-ia': {
        id: 'video-marketing-ia',
        name: 'Vidéos Marketing IA 4K',
        description: 'Créez des pubs virales sans équipe vidéo. Vidéos 4K hyper-réalistes avec technologies Veo.',
        icon: <Video className="w-8 h-8" />,
        href: '#',
        demoHref: '#',
    },
    'avant-apres-medical': {
        id: 'avant-apres-medical',
        name: 'Simulation Avant/Après',
        description: 'Rassurez vos patients avec des simulations photo-réalistes. +40% de conversions.',
        icon: <ImageIcon className="w-8 h-8" />,
        href: '#',
        demoHref: '#',
    },
    'lead-gen-ads': {
        id: 'lead-gen-ads',
        name: 'Génération Leads Meta/TikTok/Google',
        description: 'Campagnes publicitaires IA optimisées. Génération de leads qualifiés sur toutes les plateformes.',
        icon: <Sparkles className="w-8 h-8" />,
        href: '#',
        demoHref: '#',
    },
    'analyse-data-ia': {
        id: 'analyse-data-ia',
        name: 'Analyse de Données & Amélioration IA',
        description: 'Analyse poussée de vos données métier. Amélioration continue de vos IA avec nos data scientists.',
        icon: <Box className="w-8 h-8" />,
        href: '#',
        demoHref: '#',
    },
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userApps, setUserApps] = useState<Application[]>([]);
    const [pendingRequests, setPendingRequests] = useState<AppRequest[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [showRdvForm, setShowRdvForm] = useState(false);
    const [rdvData, setRdvData] = useState({ date: '', contact: '', message: '' });
    const [submitLoading, setSubmitLoading] = useState(false);

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

            // Apps que l'utilisateur possède
            const apps = (userData.applications || [])
                .map(appId => ALL_APPS[appId])
                .filter(Boolean);
            setUserApps(apps);

            // Récupérer les demandes en cours
            try {
                const res = await fetch(`/api/app-requests?clientId=${userData.id}`);
                const data = await res.json();
                if (data.requests) {
                    setPendingRequests(data.requests.filter((r: AppRequest) => r.status === 'pending'));
                }
            } catch (e) {
                console.log('Could not fetch requests:', e);
            }

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

    const handleAppClick = (app: Application) => {
        const hasAccess = userApps.some(a => a.id === app.id);
        if (hasAccess) {
            if (app.externalDemo) {
                window.open(app.href, '_blank');
            } else {
                router.push(app.href);
            }
        } else {
            setSelectedApp(app);
            setShowModal(true);
        }
    };

    const handleDemo = () => {
        if (!selectedApp) return;
        if (selectedApp.externalDemo) {
            window.open(selectedApp.demoHref, '_blank');
        } else {
            router.push(selectedApp.demoHref || selectedApp.href);
        }
        setShowModal(false);
    };

    const handleRequestAccess = () => {
        setShowRdvForm(true);
    };

    const submitRequest = async () => {
        if (!selectedApp || !user) return;
        setSubmitLoading(true);

        try {
            const response = await fetch('/api/app-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: user.id,
                    appId: selectedApp.id,
                    message: rdvData.message,
                    rdvDate: rdvData.date || null,
                    rdvContact: rdvData.contact || user.email,
                }),
            });

            if (response.ok) {
                setPendingRequests(prev => [...prev, {
                    id: 'temp',
                    app_id: selectedApp.id,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                }]);
                setShowModal(false);
                setShowRdvForm(false);
                setRdvData({ date: '', contact: '', message: '' });
            }
        } catch (error) {
            console.error('Error submitting request:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const getAvailableApps = () => {
        const ownedIds = userApps.map(a => a.id);
        const pendingIds = pendingRequests.map(r => r.app_id);
        return Object.values(ALL_APPS).filter(app =>
            !ownedIds.includes(app.id) && !pendingIds.includes(app.id)
        );
    };

    const hasPendingRequest = (appId: string) => {
        return pendingRequests.some(r => r.app_id === appId);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user?.email === 'admin@nova.com' && (
                        <a href="/admin/app-requests" className="dashboard-logout-btn" style={{ background: 'rgba(139, 92, 246, 0.3)' }}>
                            <span>⚙️ Admin</span>
                        </a>
                    )}
                    <button onClick={handleLogout} className="dashboard-logout-btn">
                        <LogOut size={18} />
                        <span>Déconnexion</span>
                    </button>
                </div>
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
                        Vos applications et services NovaSolutions
                    </p>
                </div>

                {/* Applications Grid */}
                <div className="dashboard-apps-grid">
                    {/* Apps que l'utilisateur possède */}
                    {userApps.map((app) => (
                        <button
                            key={app.id}
                            onClick={() => handleAppClick(app)}
                            className="dashboard-app-card"
                        >
                            <div className="dashboard-app-icon">
                                {app.icon}
                            </div>
                            <div className="dashboard-app-content">
                                <h3 className="dashboard-app-name">
                                    {app.name}
                                    {app.externalDemo ? (
                                        <ExternalLink size={18} className="dashboard-app-arrow" />
                                    ) : (
                                        <ArrowRight size={20} className="dashboard-app-arrow" />
                                    )}
                                </h3>
                                <p className="dashboard-app-desc">{app.description}</p>
                            </div>
                            <span className="dashboard-app-badge">Actif</span>
                        </button>
                    ))}

                    {/* Apps en attente */}
                    {pendingRequests.map((req) => {
                        const app = ALL_APPS[req.app_id];
                        if (!app) return null;
                        return (
                            <div key={req.id} className="dashboard-app-card dashboard-app-pending">
                                <div className="dashboard-app-icon dashboard-app-icon-pending">
                                    {app.icon}
                                </div>
                                <div className="dashboard-app-content">
                                    <h3 className="dashboard-app-name">{app.name}</h3>
                                    <p className="dashboard-app-desc">{app.description}</p>
                                </div>
                                <span className="dashboard-app-badge-pending">En attente</span>
                            </div>
                        );
                    })}

                    {/* Bouton + pour demander un nouveau service */}
                    <button
                        onClick={() => {
                            setSelectedApp(null);
                            setShowModal(true);
                        }}
                        className="dashboard-add-card"
                    >
                        <div className="dashboard-add-icon">
                            <Plus size={40} />
                        </div>
                        <h3>Demander un nouveau service</h3>
                        <p>Découvrez nos autres solutions IA</p>
                    </button>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="dashboard-modal-overlay" onClick={() => { setShowModal(false); setShowRdvForm(false); }}>
                    <div className="dashboard-modal" onClick={e => e.stopPropagation()}>
                        <button className="dashboard-modal-close" onClick={() => { setShowModal(false); setShowRdvForm(false); }}>
                            <X size={24} />
                        </button>

                        {!selectedApp ? (
                            // Liste des apps disponibles (exclure celles que l'utilisateur possède déjà)
                            <>
                                <h2 className="dashboard-modal-title">Nos Services IA</h2>
                                <p className="dashboard-modal-subtitle">Testez gratuitement ou débloquez l'accès illimité</p>
                                <div className="dashboard-modal-apps">
                                    {Object.values(ALL_APPS)
                                        .filter(app => !userApps.some(a => a.id === app.id))
                                        .map(app => (
                                            <div key={app.id} className="dashboard-modal-app-row">
                                                <div className="dashboard-modal-app-info">
                                                    <div className="dashboard-modal-app-icon">{app.icon}</div>
                                                    <div>
                                                        <h4>{app.name}</h4>
                                                        <p>{app.description}</p>
                                                    </div>
                                                </div>
                                                <div className="dashboard-modal-app-actions">
                                                    {hasPendingRequest(app.id) ? (
                                                        <span className="pending-badge">Demande en cours</span>
                                                    ) : (
                                                        <>
                                                            {/* Afficher bouton démo seulement si une démo existe */}
                                                            {app.demoHref && app.demoHref !== '#' && (
                                                                <button
                                                                    className="dashboard-modal-mini-btn demo"
                                                                    onClick={() => {
                                                                        if (app.externalDemo) {
                                                                            window.open(app.demoHref, '_blank');
                                                                        } else {
                                                                            router.push(app.demoHref!);
                                                                        }
                                                                        setShowModal(false);
                                                                    }}
                                                                >
                                                                    ▶ Démo{app.id === 'cv-profiler' ? ' (3 CV)' : ''}
                                                                </button>
                                                            )}
                                                            <button
                                                                className="dashboard-modal-mini-btn request"
                                                                onClick={() => {
                                                                    setSelectedApp(app);
                                                                    setShowRdvForm(true);
                                                                }}
                                                            >
                                                                Débloquer
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </>
                        ) : !showRdvForm ? (
                            // Options pour l'app sélectionnée
                            <>
                                <div className="dashboard-modal-app-header">
                                    <div className="dashboard-modal-app-icon-large">{selectedApp.icon}</div>
                                    <h2>{selectedApp.name}</h2>
                                    <p>{selectedApp.description}</p>
                                </div>
                                <div className="dashboard-modal-actions">
                                    <button className="dashboard-modal-btn demo" onClick={handleDemo}>
                                        <Play size={20} />
                                        <div className="dashboard-modal-btn-text">
                                            <span>Essayer la Démo</span>
                                            {selectedApp.id === 'cv-profiler' && <small>3 CV maximum</small>}
                                        </div>
                                    </button>
                                    <button className="dashboard-modal-btn request" onClick={handleRequestAccess}>
                                        <Calendar size={20} />
                                        <div className="dashboard-modal-btn-text">
                                            <span>Débloquer l'accès illimité</span>
                                            <small>Réservez votre place • Places limitées</small>
                                        </div>
                                    </button>
                                </div>
                            </>
                        ) : (
                            // Formulaire RDV
                            <>
                                <h2 className="dashboard-modal-title">Demander l'accès</h2>
                                <p className="dashboard-modal-subtitle">
                                    Application : <strong>{selectedApp.name}</strong>
                                </p>
                                <div className="dashboard-modal-form">
                                    <div className="form-group">
                                        <label>Email ou téléphone de contact</label>
                                        <input
                                            type="text"
                                            value={rdvData.contact}
                                            onChange={e => setRdvData({ ...rdvData, contact: e.target.value })}
                                            placeholder="votre@email.com ou 06 XX XX XX XX"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date souhaitée pour le RDV (optionnel)</label>
                                        <input
                                            type="datetime-local"
                                            value={rdvData.date}
                                            onChange={e => setRdvData({ ...rdvData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Message (optionnel)</label>
                                        <textarea
                                            value={rdvData.message}
                                            onChange={e => setRdvData({ ...rdvData, message: e.target.value })}
                                            placeholder="Décrivez votre besoin..."
                                            rows={3}
                                        />
                                    </div>
                                    <button
                                        className="dashboard-modal-submit"
                                        onClick={submitRequest}
                                        disabled={submitLoading}
                                    >
                                        {submitLoading ? 'Envoi...' : 'Envoyer ma demande'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Chatbot */}
            <Chatbot />
        </div>
    );
}
