'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Loader2,
    ArrowLeft,
    RefreshCw,
    Save,
    Play,
    Square,
    Power,
    Trash2,
    Settings,
    MessageSquare,
    Mail,
    QrCode,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock
} from 'lucide-react';
import type { BotFullConfig, BotStatus } from '@/types/whatsapp-bot';

// Status configuration
const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    created: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.2)', icon: <Clock size={14} />, label: 'Créé' },
    connecting: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)', icon: <Loader2 size={14} className="animate-spin" />, label: 'Connexion...' },
    waiting_qr: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', icon: <QrCode size={14} />, label: 'Scanner QR' },
    connected: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', icon: <CheckCircle size={14} />, label: 'Connecté' },
    disconnected: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', icon: <XCircle size={14} />, label: 'Déconnecté' },
    logged_out: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.2)', icon: <AlertCircle size={14} />, label: 'Déconnecté' },
    error: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', icon: <AlertCircle size={14} />, label: 'Erreur' },
};

export default function WhatsAppBotDetailPage() {
    const router = useRouter();
    const params = useParams();
    const botId = params.id as string;

    const [botConfig, setBotConfig] = useState<BotFullConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'settings' | 'prompt' | 'emails'>('settings');
    const [countdown, setCountdown] = useState(5);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        groqApiKey: '',
        companyName: '',
        companyEmail: '',
        invoicePrefix: '',
        emailUser: '',
        emailPassword: '',
        emailRecipients: '',
        promptSystem: '',
    });

    // Load bot config
    const loadBot = useCallback(async () => {
        try {
            const response = await fetch(`/api/whatsapp-bots/${botId}`);
            if (!response.ok) {
                router.push('/admin/whatsapp-bots');
                return;
            }
            const data: BotFullConfig = await response.json();
            setBotConfig(data);

            // Populate form
            setFormData({
                name: data.config.name || '',
                groqApiKey: data.config.settings?.groqApiKey || '',
                companyName: data.config.settings?.companyName || '',
                companyEmail: data.config.settings?.companyEmail || '',
                invoicePrefix: data.config.settings?.invoicePrefix || 'FAC-',
                emailUser: data.config.settings?.emailUser || '',
                emailPassword: data.config.settings?.emailPassword || '',
                emailRecipients: (data.config.settings?.emailRecipients || []).join(', '),
                promptSystem: data.prompt?.system || '',
            });

            // Load QR code if needed
            if (data.status?.status === 'waiting_qr' || data.status?.hasQR) {
                const qrResponse = await fetch(`/api/whatsapp-bots/${botId}/qr`);
                const qrData = await qrResponse.json();
                if (qrData.qrCode) {
                    setQrCode(qrData.qrCode);
                }
            }
        } catch (error) {
            console.error('Error loading bot:', error);
            router.push('/admin/whatsapp-bots');
        } finally {
            setIsLoading(false);
        }
    }, [botId, router]);

    // Check admin access
    useEffect(() => {
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
        loadBot();
    }, [router, loadBot]);

    // Auto-refresh for QR code
    useEffect(() => {
        if (!isAdmin || !botConfig) return;

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    loadBot();
                    return 5;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isAdmin, botConfig, loadBot]);

    // Save config
    const saveConfig = async () => {
        setSaving(true);
        try {
            await fetch(`/api/whatsapp-bots/${botId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config: {
                        name: formData.name,
                        settings: {
                            groqApiKey: formData.groqApiKey,
                            companyName: formData.companyName,
                            companyEmail: formData.companyEmail,
                            invoicePrefix: formData.invoicePrefix,
                            emailUser: formData.emailUser,
                            emailPassword: formData.emailPassword,
                            emailRecipients: formData.emailRecipients.split(',').map(e => e.trim()).filter(Boolean),
                        },
                    },
                    prompt: {
                        system: formData.promptSystem,
                        createdAt: new Date().toISOString(),
                    },
                }),
            });
            await loadBot();
        } catch (error) {
            console.error('Error saving config:', error);
        } finally {
            setSaving(false);
        }
    };

    // Start bot
    const startBot = async () => {
        setProcessing(true);
        try {
            await fetch(`/api/whatsapp-bots/${botId}/start`, { method: 'POST' });
            await loadBot();
        } catch (error) {
            console.error('Error starting bot:', error);
        } finally {
            setProcessing(false);
        }
    };

    // Stop bot
    const stopBot = async () => {
        setProcessing(true);
        try {
            await fetch(`/api/whatsapp-bots/${botId}/stop`, { method: 'POST' });
            setQrCode(null);
            await loadBot();
        } catch (error) {
            console.error('Error stopping bot:', error);
        } finally {
            setProcessing(false);
        }
    };

    // Toggle enabled
    const toggleBot = async () => {
        if (!botConfig) return;
        setProcessing(true);
        try {
            await fetch(`/api/whatsapp-bots/${botId}/enable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !botConfig.status?.enabled }),
            });
            await loadBot();
        } catch (error) {
            console.error('Error toggling bot:', error);
        } finally {
            setProcessing(false);
        }
    };

    // Delete bot
    const deleteBot = async () => {
        if (!confirm('Supprimer ce bot définitivement ?')) return;
        try {
            await fetch(`/api/whatsapp-bots/${botId}`, { method: 'DELETE' });
            router.push('/admin/whatsapp-bots');
        } catch (error) {
            console.error('Error deleting bot:', error);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Loader2 size={32} color="#a78bfa" className="animate-spin" />
            </div>
        );
    }

    // Not admin
    if (!isAdmin || !botConfig) {
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
                    <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Bot non trouvé</h1>
                    <a href="/admin/whatsapp-bots" style={{ color: '#8B5CF6' }}>← Retour</a>
                </div>
            </div>
        );
    }

    const status = botConfig.status?.status || 'disconnected';
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.disconnected;
    const canStart = ['created', 'disconnected', 'logged_out'].includes(status);

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        outline: 'none',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: 500 as const,
        color: '#94a3b8',
    };

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
                        href="/admin/whatsapp-bots"
                        style={{
                            padding: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <ArrowLeft size={20} />
                    </a>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>
                            {botConfig.config.name}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: statusConfig.color,
                                background: statusConfig.bg,
                            }}>
                                {statusConfig.icon}
                                {statusConfig.label}
                            </span>
                            {botConfig.status?.phoneNumber && (
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                                    📱 {botConfig.status.phoneNumber}
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{
                        padding: '8px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#94a3b8',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        <RefreshCw size={14} />
                        <span>{countdown}s</span>
                    </div>
                </div>

                {/* Actions Bar */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                }}>
                    {canStart ? (
                        <button
                            onClick={startBot}
                            disabled={processing}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: processing ? '#4b5563' : '#10b981',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: processing ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {processing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                            Démarrer
                        </button>
                    ) : (
                        <button
                            onClick={stopBot}
                            disabled={processing}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: processing ? '#4b5563' : '#ef4444',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: processing ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {processing ? <Loader2 size={16} className="animate-spin" /> : <Square size={16} />}
                            Arrêter
                        </button>
                    )}

                    <button
                        onClick={toggleBot}
                        disabled={processing}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: processing ? 'not-allowed' : 'pointer',
                        }}
                    >
                        <Power size={16} />
                        {botConfig.status?.enabled ? 'Désactiver' : 'Activer'}
                    </button>

                    <button
                        onClick={deleteBot}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fca5a5',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            marginLeft: 'auto',
                        }}
                    >
                        <Trash2 size={16} />
                        Supprimer
                    </button>
                </div>

                {/* QR Code Section */}
                {(status === 'waiting_qr' || botConfig.status?.hasQR) && qrCode && (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '24px',
                        textAlign: 'center',
                    }}>
                        <h3 style={{ color: '#1f2937', margin: '0 0 16px', fontSize: '16px' }}>
                            📱 Scannez le QR Code avec WhatsApp
                        </h3>
                        <img
                            src={qrCode}
                            alt="QR Code"
                            style={{ maxWidth: '280px', margin: '0 auto', display: 'block' }}
                        />
                        <p style={{ color: '#6b7280', fontSize: '13px', margin: '16px 0 0' }}>
                            WhatsApp → Paramètres → Appareils connectés → Connecter un appareil
                        </p>
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setActiveTab('settings')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: activeTab === 'settings' ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        <Settings size={16} />
                        Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab('prompt')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: activeTab === 'prompt' ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        <MessageSquare size={16} />
                        Prompt IA
                    </button>
                    <button
                        onClick={() => setActiveTab('emails')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: activeTab === 'emails' ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        <Mail size={16} />
                        Emails
                    </button>
                </div>

                {/* Tab Content */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '24px',
                }}>
                    {activeTab === 'settings' && (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Nom du bot</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Nom de l&apos;entreprise</label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email entreprise</label>
                                    <input
                                        type="email"
                                        value={formData.companyEmail}
                                        onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Clé API Groq</label>
                                <input
                                    type="password"
                                    value={formData.groqApiKey}
                                    onChange={(e) => setFormData({ ...formData, groqApiKey: e.target.value })}
                                    placeholder="gsk_..."
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Préfixe des factures</label>
                                <input
                                    type="text"
                                    value={formData.invoicePrefix}
                                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                                <h4 style={{ color: 'white', margin: '0 0 16px', fontSize: '14px' }}>Configuration Email</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Email (Gmail)</label>
                                        <input
                                            type="email"
                                            value={formData.emailUser}
                                            onChange={(e) => setFormData({ ...formData, emailUser: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Mot de passe d&apos;application</label>
                                        <input
                                            type="password"
                                            value={formData.emailPassword}
                                            onChange={(e) => setFormData({ ...formData, emailPassword: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <label style={labelStyle}>Destinataires des factures (séparés par virgule)</label>
                                    <input
                                        type="text"
                                        value={formData.emailRecipients}
                                        onChange={(e) => setFormData({ ...formData, emailRecipients: e.target.value })}
                                        placeholder="email1@example.com, email2@example.com"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'prompt' && (
                        <div>
                            <label style={labelStyle}>Prompt système pour l&apos;analyse IA</label>
                            <textarea
                                value={formData.promptSystem}
                                onChange={(e) => setFormData({ ...formData, promptSystem: e.target.value })}
                                rows={12}
                                style={{
                                    ...inputStyle,
                                    resize: 'vertical',
                                    fontFamily: 'monospace',
                                }}
                            />
                            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>
                                Ce prompt est utilisé pour analyser les messages vocaux et extraire les données de facture.
                            </p>
                        </div>
                    )}

                    {activeTab === 'emails' && (
                        <div>
                            <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
                                Configuration des templates email avancée (bientôt disponible).
                            </p>
                            <pre style={{
                                background: 'rgba(0,0,0,0.3)',
                                padding: '16px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: '#94a3b8',
                                overflow: 'auto',
                            }}>
                                {JSON.stringify(botConfig.emails, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Save Button */}
                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                            onClick={saveConfig}
                            disabled={saving}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                background: saving ? '#4b5563' : '#8B5CF6',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: saving ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Enregistrer les modifications
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
