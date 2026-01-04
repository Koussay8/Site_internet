'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lead {
    id: string;
    email: string;
    name: string | null;
    source: string;
    subscribed: boolean;
    created_at: string;
}

interface Campaign {
    id: string;
    subject: string;
    recipients_count: number;
    sent_count: number;
    failed_count: number;
    status: string;
    sent_at: string | null;
    created_at: string;
}

export default function NewsletterAdminPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Newsletter form
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');

    // Data
    const [leads, setLeads] = useState<Lead[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState({ total: 0, subscribed: 0, unsubscribed: 0 });

    // Status
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Check admin auth
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const response = await fetch('/api/leads', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 403) {
                    setError('Accès réservé aux administrateurs');
                    setLoading(false);
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    setLeads(data.leads || []);
                    setStats(data.stats || { total: 0, subscribed: 0, unsubscribed: 0 });
                    setIsAdmin(true);
                }

                // Load campaigns
                const campaignsRes = await fetch('/api/newsletter', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (campaignsRes.ok) {
                    const campaignsData = await campaignsRes.json();
                    setCampaigns(campaignsData.campaigns || []);
                }
            } catch (err) {
                setError('Erreur de connexion');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    // Send newsletter
    const handleSend = async () => {
        if (!subject || !content) {
            setError('Sujet et contenu requis');
            return;
        }

        setSending(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ subject, htmlContent: content }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'envoi');
            }

            setSuccess(`Newsletter envoyée à ${data.stats.sent} personnes !`);
            setSubject('');
            setContent('');

            // Refresh campaigns
            const campaignsRes = await fetch('/api/newsletter', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (campaignsRes.ok) {
                const campaignsData = await campaignsRes.json();
                setCampaigns(campaignsData.campaigns || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading">Chargement...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="admin-page">
                <div className="hero-bg"></div>
                <div className="container">
                    <div className="card error-card">
                        <h1>Accès refusé</h1>
                        <p>{error || 'Vous devez être administrateur pour accéder à cette page.'}</p>
                        <Link href="/dashboard" className="btn btn-outline">
                            Retour au dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="hero-bg"></div>

            <div className="container">
                <header className="admin-header">
                    <h1>📧 Newsletter Admin</h1>
                    <Link href="/dashboard" className="btn btn-outline">
                        ← Dashboard
                    </Link>
                </header>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-label">Total Leads</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{stats.subscribed}</span>
                        <span className="stat-label">Abonnés</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{stats.unsubscribed}</span>
                        <span className="stat-label">Désabonnés</span>
                    </div>
                </div>

                {/* Newsletter Form */}
                <section className="card">
                    <h2>Nouvelle Newsletter</h2>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-group">
                        <label>Sujet</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Sujet de l'email..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Contenu (HTML supporté)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="<h2>Titre</h2><p>Votre message...</p>"
                            rows={10}
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={sending || !subject || !content}
                        className="btn btn-primary"
                    >
                        {sending ? 'Envoi en cours...' : `Envoyer à ${stats.subscribed} abonnés`}
                    </button>
                </section>

                {/* Campaigns History */}
                <section className="card">
                    <h2>Historique des campagnes</h2>
                    {campaigns.length === 0 ? (
                        <p className="muted">Aucune campagne envoyée</p>
                    ) : (
                        <table className="campaigns-table">
                            <thead>
                                <tr>
                                    <th>Sujet</th>
                                    <th>Envoyés</th>
                                    <th>Échoués</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map((campaign) => (
                                    <tr key={campaign.id}>
                                        <td>{campaign.subject}</td>
                                        <td>{campaign.sent_count}</td>
                                        <td>{campaign.failed_count}</td>
                                        <td>
                                            <span className={`status ${campaign.status}`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td>
                                            {campaign.sent_at
                                                ? new Date(campaign.sent_at).toLocaleString('fr-FR')
                                                : '-'
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Leads List */}
                <section className="card">
                    <h2>Liste des Leads ({leads.length})</h2>
                    <div className="leads-list">
                        {leads.slice(0, 20).map((lead) => (
                            <div key={lead.id} className={`lead-item ${!lead.subscribed ? 'unsubscribed' : ''}`}>
                                <div className="lead-info">
                                    <span className="lead-email">{lead.email}</span>
                                    <span className="lead-meta">
                                        {lead.name && `${lead.name} • `}
                                        {lead.source} • {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <span className={`lead-status ${lead.subscribed ? 'active' : 'inactive'}`}>
                                    {lead.subscribed ? '✓ Abonné' : '✕ Désabonné'}
                                </span>
                            </div>
                        ))}
                        {leads.length > 20 && (
                            <p className="muted">...et {leads.length - 20} autres</p>
                        )}
                    </div>
                </section>
            </div>

            <style jsx>{`
                .admin-page {
                    min-height: 100vh;
                    padding: 2rem;
                }

                .hero-bg {
                    position: fixed;
                    inset: 0;
                    background: linear-gradient(135deg, #0a0118 0%, #1a0f2e 50%, #0a0118 100%);
                    z-index: -1;
                }

                .container {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .admin-header h1 {
                    font-size: 1.75rem;
                    color: white;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 1.5rem;
                    text-align: center;
                }

                .stat-number {
                    display: block;
                    font-size: 2rem;
                    font-weight: 700;
                    color: #8b5cf6;
                }

                .stat-label {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9rem;
                }

                .card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 1.5rem;
                }

                .card h2 {
                    font-size: 1.25rem;
                    margin-bottom: 1.5rem;
                    color: white;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.9rem;
                }

                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: white;
                    font-family: inherit;
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 150px;
                }

                .error-message {
                    padding: 1rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #fca5a5;
                    margin-bottom: 1rem;
                }

                .success-message {
                    padding: 1rem;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 8px;
                    color: #10b981;
                    margin-bottom: 1rem;
                }

                .campaigns-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .campaigns-table th,
                .campaigns-table td {
                    padding: 0.75rem;
                    text-align: left;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .campaigns-table th {
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 500;
                    font-size: 0.85rem;
                }

                .status {
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                }

                .status.sent { background: rgba(16, 185, 129, 0.2); color: #10b981; }
                .status.sending { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
                .status.failed { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

                .leads-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .lead-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 8px;
                }

                .lead-item.unsubscribed {
                    opacity: 0.5;
                }

                .lead-email {
                    color: white;
                    font-weight: 500;
                }

                .lead-meta {
                    display: block;
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                }

                .lead-status {
                    font-size: 0.8rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }

                .lead-status.active { background: rgba(16, 185, 129, 0.2); color: #10b981; }
                .lead-status.inactive { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

                .muted {
                    color: rgba(255, 255, 255, 0.4);
                    text-align: center;
                    padding: 1rem;
                }

                .loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    color: white;
                }

                .error-card {
                    max-width: 400px;
                    margin: 10vh auto;
                    text-align: center;
                }

                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .admin-header {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
}
