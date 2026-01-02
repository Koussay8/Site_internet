'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, X, Clock, Building2, Mail, MessageSquare, Calendar, RefreshCw } from 'lucide-react';

interface AppRequest {
    id: string;
    app_id: string;
    status: 'pending' | 'approved' | 'rejected';
    message?: string;
    rdv_date?: string;
    rdv_contact?: string;
    created_at: string;
    reviewed_at?: string;
    clients?: {
        id: string;
        email: string;
        company_name: string;
    };
}

const APP_NAMES: Record<string, string> = {
    'cv-profiler': 'CV Profiler',
    'agent-telephonique': 'Agent Téléphonique IA 24/7',
    'chatbot-ia': 'Chatbot IA Multi-Canal',
    'qualification-dossiers': 'Qualification de Dossiers IA',
    'email-automation': 'Emailing IA Personnalisé',
    'site-web-premium': 'Site Web Premium',
    'automatisation-rdv': 'Automatisation RDV & Tâches',
    'calculateur-devis': 'Calculateur Éligibilité & Devis IA',
    'visualiseur-3d': 'Visualiseur 3D Architecture',
    'video-marketing-ia': 'Vidéos Marketing IA 4K',
    'avant-apres-medical': 'Simulation Avant/Après',
    'whatsapp-agent-b2b': 'Agent WhatsApp B2B',
    'lead-gen-ads': 'Génération Leads Meta/TikTok/Google',
    'analyse-data-ia': 'Analyse de Données & Amélioration IA',
};

export default function AdminAppRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<AppRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        checkAdminAndLoad();
    }, [filter]);

    const checkAdminAndLoad = async () => {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
            router.push('/login');
            return;
        }

        // Basic check - in production, verify on server
        const userData = JSON.parse(user);
        // For now, allow access (server will verify properly)
        setIsAdmin(true);

        try {
            const response = await fetch(`/api/admin/app-requests?status=${filter}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 401) {
                setIsAdmin(false);
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setRequests(data.requests || []);
            }
        } catch (error) {
            console.error('Error loading requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
        setProcessing(requestId);
        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch('/api/admin/app-requests', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ requestId, action }),
            });

            if (response.ok) {
                // Remove from list or update status
                setRequests(prev => prev.filter(r => r.id !== requestId));
            }
        } catch (error) {
            console.error('Error processing request:', error);
        } finally {
            setProcessing(null);
        }
    };

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Loader2 size={32} color="#a78bfa" className="dashboard-loader-icon" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Accès non autorisé</h1>
                    <p style={{ color: '#94a3b8' }}>Vous n'avez pas les permissions admin.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            padding: '32px',
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <a
                        href="/dashboard"
                        style={{
                            padding: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            textDecoration: 'none',
                        }}
                    >
                        ←
                    </a>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>
                            Panel Admin
                        </h1>
                        <p style={{ color: '#94a3b8', margin: 0 }}>
                            Gérez les demandes et les accès utilisateurs
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <span
                        style={{
                            padding: '8px 16px',
                            background: '#8B5CF6',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: 500,
                        }}
                    >
                        📋 Demandes
                    </span>
                    <a
                        href="/admin/users"
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: 500,
                            textDecoration: 'none',
                        }}
                    >
                        👥 Utilisateurs
                    </a>
                    <a
                        href="/admin/whatsapp-bots"
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: 500,
                            textDecoration: 'none',
                        }}
                    >
                        🤖 WhatsApp Bots
                    </a>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {(['pending', 'approved', 'rejected'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            style={{
                                padding: '8px 16px',
                                background: filter === status ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {status === 'pending' && '⏳ En attente'}
                            {status === 'approved' && '✓ Approuvées'}
                            {status === 'rejected' && '✗ Rejetées'}
                        </button>
                    ))}
                    <button
                        onClick={() => { setIsLoading(true); checkAdminAndLoad(); }}
                        style={{
                            marginLeft: 'auto',
                            padding: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                {/* Requests List */}
                {requests.length === 0 ? (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '48px',
                        textAlign: 'center',
                        color: '#94a3b8',
                    }}>
                        <Clock size={40} style={{ opacity: 0.5, marginBottom: '16px' }} />
                        <p>Aucune demande {filter === 'pending' ? 'en attente' : filter === 'approved' ? 'approuvée' : 'rejetée'}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {requests.map(request => (
                            <div
                                key={request.id}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    {/* App Icon */}
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '20px',
                                    }}>
                                        {request.app_id === 'cv-profiler' ? '📄' : '📞'}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'white' }}>
                                                {APP_NAMES[request.app_id] || request.app_id}
                                            </h3>
                                            <span style={{
                                                padding: '4px 8px',
                                                background: request.status === 'pending' ? 'rgba(245,158,11,0.2)'
                                                    : request.status === 'approved' ? 'rgba(16,185,129,0.2)'
                                                        : 'rgba(239,68,68,0.2)',
                                                borderRadius: '50px',
                                                fontSize: '11px',
                                                color: request.status === 'pending' ? '#fbbf24'
                                                    : request.status === 'approved' ? '#34d399'
                                                        : '#f87171',
                                            }}>
                                                {request.status === 'pending' ? 'En attente' : request.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                                            </span>
                                        </div>

                                        {/* Client info */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#94a3b8' }}>
                                            {request.clients && (
                                                <>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Building2 size={14} />
                                                        {request.clients.company_name}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Mail size={14} />
                                                        {request.clients.email}
                                                    </span>
                                                </>
                                            )}
                                            {request.rdv_date && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={14} />
                                                    {new Date(request.rdv_date).toLocaleString('fr-FR')}
                                                </span>
                                            )}
                                        </div>

                                        {request.message && (
                                            <div style={{
                                                marginTop: '12px',
                                                padding: '12px',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                color: '#cbd5e1',
                                            }}>
                                                <MessageSquare size={12} style={{ marginRight: '8px', opacity: 0.6 }} />
                                                {request.message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {request.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleAction(request.id, 'approve')}
                                                disabled={processing === request.id}
                                                style={{
                                                    padding: '10px 16px',
                                                    background: '#10b981',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    opacity: processing === request.id ? 0.6 : 1,
                                                }}
                                            >
                                                {processing === request.id ? <Loader2 size={14} className="dashboard-loader-icon" /> : <Check size={14} />}
                                                Approuver
                                            </button>
                                            <button
                                                onClick={() => handleAction(request.id, 'reject')}
                                                disabled={processing === request.id}
                                                style={{
                                                    padding: '10px 16px',
                                                    background: 'rgba(239,68,68,0.2)',
                                                    border: '1px solid rgba(239,68,68,0.3)',
                                                    borderRadius: '8px',
                                                    color: '#f87171',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    opacity: processing === request.id ? 0.6 : 1,
                                                }}
                                            >
                                                <X size={14} />
                                                Rejeter
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Timestamp */}
                                <div style={{ marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
                                    Demandé le {new Date(request.created_at).toLocaleString('fr-FR')}
                                    {request.reviewed_at && ` • Traité le ${new Date(request.reviewed_at).toLocaleString('fr-FR')}`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
