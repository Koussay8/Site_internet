'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Users, Check, X, Plus, Minus, ArrowLeft, RefreshCw } from 'lucide-react';

interface Client {
    id: string;
    email: string;
    company_name?: string;
    applications: string[];
    created_at: string;
    last_login?: string;
}

const AVAILABLE_APPS = [
    { id: 'cv-profiler', name: 'CV Profiler' },
];

export default function AdminUsersPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(user);
        if (userData.email !== 'admin@nova.com') {
            setIsAdmin(false);
            setIsLoading(false);
            return;
        }

        setIsAdmin(true);

        try {
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setClients(data.clients || []);
            }
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAccess = async (clientId: string, appId: string, currentlyHasAccess: boolean) => {
        setProcessing(`${clientId}-${appId}`);
        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId,
                    appId,
                    action: currentlyHasAccess ? 'remove' : 'add',
                }),
            });

            if (response.ok) {
                // Refresh the list
                await loadClients();
            }
        } catch (error) {
            console.error('Error toggling access:', error);
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
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <a
                        href="/admin/app-requests"
                        style={{
                            padding: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            textDecoration: 'none',
                        }}
                    >
                        <ArrowLeft size={20} />
                    </a>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>
                            Gestion des Utilisateurs
                        </h1>
                        <p style={{ color: '#94a3b8', margin: 0 }}>
                            Gérez les accès aux applications
                        </p>
                    </div>
                    <button
                        onClick={loadClients}
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

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <a
                        href="/admin/app-requests"
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
                        📋 Demandes
                    </a>
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
                        👥 Utilisateurs
                    </span>
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

                {/* Clients List */}
                {clients.length === 0 ? (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '48px',
                        textAlign: 'center',
                        color: '#94a3b8',
                    }}>
                        <Users size={40} style={{ opacity: 0.5, marginBottom: '16px' }} />
                        <p>Aucun utilisateur enregistré</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {clients.map(client => (
                            <div
                                key={client.id}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                                    {/* Client Info */}
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: 'white' }}>
                                            {client.company_name || client.email}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                                            {client.email}
                                        </p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                                            Inscrit le {new Date(client.created_at).toLocaleDateString('fr-FR')}
                                            {client.last_login && ` • Dernière connexion: ${new Date(client.last_login).toLocaleDateString('fr-FR')}`}
                                        </p>
                                    </div>

                                    {/* Access Toggles */}
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {AVAILABLE_APPS.map(app => {
                                            const hasAccess = client.applications?.includes(app.id);
                                            const isProcessing = processing === `${client.id}-${app.id}`;

                                            return (
                                                <button
                                                    key={app.id}
                                                    onClick={() => toggleAccess(client.id, app.id, hasAccess)}
                                                    disabled={isProcessing}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '8px 16px',
                                                        background: hasAccess
                                                            ? 'rgba(16, 185, 129, 0.2)'
                                                            : 'rgba(100, 116, 139, 0.2)',
                                                        border: `1px solid ${hasAccess
                                                            ? 'rgba(16, 185, 129, 0.4)'
                                                            : 'rgba(100, 116, 139, 0.3)'}`,
                                                        borderRadius: '8px',
                                                        color: hasAccess ? '#34d399' : '#94a3b8',
                                                        fontSize: '13px',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        opacity: isProcessing ? 0.6 : 1,
                                                    }}
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 size={14} className="dashboard-loader-icon" />
                                                    ) : hasAccess ? (
                                                        <Check size={14} />
                                                    ) : (
                                                        <Plus size={14} />
                                                    )}
                                                    {app.name}
                                                    {hasAccess && !isProcessing && (
                                                        <Minus size={12} style={{ opacity: 0.6 }} />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
