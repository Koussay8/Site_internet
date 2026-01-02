'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Loader2,
    ArrowLeft,
    RefreshCw,
    Plus,
    Play,
    Square,
    Power,
    Trash2,
    Smartphone,
    QrCode,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    Settings,
    Lock,
    Unlock,
    Crown
} from 'lucide-react';
import type { WhatsAppBot, BotType } from '@/types/whatsapp-bot';
import { BOT_TYPE_LABELS } from '@/types/whatsapp-bot';
import { checkAppAccess, type AccessLevel } from '@/lib/supabase/app-access';

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

const ACCESS_BADGES = {
    demo: { label: 'Mode Démo', color: '#f59e0b', icon: <Lock size={14} /> },
    standard: { label: 'Accès Standard', color: '#10b981', icon: <Unlock size={14} /> },
    admin: { label: 'Administrateur', color: '#8B5CF6', icon: <Crown size={14} /> },
};

export default function AgentWhatsAppPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isDemo = searchParams.get('demo') === 'true';

    const [bots, setBots] = useState<WhatsAppBot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<{ email: string; applications?: string[] } | null>(null);
    const [accessLevel, setAccessLevel] = useState<AccessLevel>('demo');
    const [botLimit, setBotLimit] = useState(1);

    // Form state
    const [newBotName, setNewBotName] = useState('');
    const [botType, setBotType] = useState<BotType>('invoice');
    const [customPrompt, setCustomPrompt] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [knowledgeText, setKnowledgeText] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Activation modes
    const [activateOnReceive, setActivateOnReceive] = useState(true);
    const [activateOnSend, setActivateOnSend] = useState(false);
    const [receiveFromNumbers, setReceiveFromNumbers] = useState('');
    const [sendToNumbers, setSendToNumbers] = useState('');

    const [creating, setCreating] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);
    const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
    const [countdown, setCountdown] = useState(10);
    const [backendAvailable, setBackendAvailable] = useState(true);

    const isAdmin = accessLevel === 'admin';
    const canCreateMore = isAdmin || bots.length < botLimit;

    // Load bots
    const loadBots = useCallback(async () => {
        if (!user?.email) return;

        try {
            const response = await fetch('/api/whatsapp-bots', {
                headers: {
                    'X-User-Email': user.email,
                    'X-Is-Admin': isAdmin.toString(),
                },
            });
            const data = await response.json();

            if (response.status === 503) {
                setBackendAvailable(false);
                setBots([]);
            } else {
                setBackendAvailable(true);
                setBots(data.bots || []);

                // Load QR codes for bots waiting for QR
                for (const bot of (data.bots || [])) {
                    if (bot.status === 'waiting_qr' || bot.hasQR) {
                        loadQRCode(bot.id);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading bots:', error);
            setBackendAvailable(false);
        } finally {
            setIsLoading(false);
        }
    }, [user?.email, isAdmin]);

    // Load QR code
    const loadQRCode = async (botId: string) => {
        try {
            const response = await fetch(`/api/whatsapp-bots/${botId}/qr`);
            const data = await response.json();
            if (data.qrCode) {
                setQrCodes(prev => ({ ...prev, [botId]: data.qrCode }));
            }
        } catch (error) {
            console.error('Error loading QR code:', error);
        }
    };

    // Check user auth and access
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token');
            const userData = localStorage.getItem('user');

            if (!token || !userData) {
                router.push('/login?redirect=/apps/agent-whatsapp');
                return;
            }

            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Demo mode - anyone with session can use (1 bot limit)
            if (isDemo) {
                setAccessLevel('demo');
                setBotLimit(1);
                return;
            }

            // Check if user is admin
            if (parsedUser.email === 'admin@nova.com') {
                setAccessLevel('admin');
                setBotLimit(999);
                return;
            }

            // Check if user has the app in their applications
            const userApps = parsedUser.applications || [];
            if (userApps.includes('agent-whatsapp')) {
                setAccessLevel('standard');
                setBotLimit(1); // 1 bot for standard users
                return;
            }

            // Check database for app_access (fallback)
            const access = await checkAppAccess(parsedUser.email, 'agent-whatsapp');
            if (access.accessLevel !== 'demo') {
                setAccessLevel(access.accessLevel);
                setBotLimit(access.botLimit);
            } else {
                // User doesn't have access, redirect to dashboard
                router.push('/dashboard');
            }
        };

        checkAuth();
    }, [router]);

    // Load bots when user is set
    useEffect(() => {
        if (user?.email) {
            loadBots();
        }
    }, [user?.email, loadBots]);

    // Auto-refresh
    useEffect(() => {
        if (!user?.email) return;

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    loadBots();
                    return 10;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [user?.email, loadBots]);

    // Create bot
    const createBot = async () => {
        if (!newBotName.trim() || !user?.email) return;

        setCreating(true);
        try {
            const knowledgeEntries = knowledgeText.trim()
                ? knowledgeText.split('\n').filter(line => line.trim()).map(line => {
                    const parts = line.split('|');
                    if (parts.length >= 2) {
                        return { question: parts[0].trim(), answer: parts[1].trim() };
                    }
                    return line.trim();
                })
                : [];

            const response = await fetch('/api/whatsapp-bots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': user.email,
                    'X-Is-Admin': isAdmin.toString(),
                    'X-Bot-Limit': botLimit.toString(),
                },
                body: JSON.stringify({
                    name: newBotName.trim(),
                    options: {
                        botType,
                        customPrompt: customPrompt.trim() || undefined,
                        knowledge: knowledgeEntries.length > 0 ? knowledgeEntries : undefined,
                        welcomeMessage: welcomeMessage.trim() || undefined,
                        language: 'fr',
                        activateOnReceive,
                        activateOnSend,
                        receiveFromNumbers: receiveFromNumbers.trim()
                            ? receiveFromNumbers.split(',').map(n => n.trim()).filter(Boolean)
                            : [],
                        sendToNumbers: sendToNumbers.trim()
                            ? sendToNumbers.split(',').map(n => n.trim()).filter(Boolean)
                            : [],
                    },
                }),
            });

            if (response.ok) {
                setNewBotName('');
                setBotType('invoice');
                setCustomPrompt('');
                setWelcomeMessage('');
                setKnowledgeText('');
                setShowAdvanced(false);
                setActivateOnReceive(true);
                setActivateOnSend(false);
                setReceiveFromNumbers('');
                setSendToNumbers('');
                await loadBots();
            } else {
                const error = await response.json();
                alert(error.error || 'Erreur lors de la création');
            }
        } catch (error) {
            console.error('Error creating bot:', error);
        } finally {
            setCreating(false);
        }
    };

    // Start bot
    const startBot = async (botId: string) => {
        setProcessing(botId);
        try {
            await fetch(`/api/whatsapp-bots/${botId}/start`, { method: 'POST' });
            await loadBots();
        } finally {
            setProcessing(null);
        }
    };

    // Stop bot  
    const stopBot = async (botId: string) => {
        setProcessing(botId);
        try {
            await fetch(`/api/whatsapp-bots/${botId}/stop`, { method: 'POST' });
            setQrCodes(prev => {
                const updated = { ...prev };
                delete updated[botId];
                return updated;
            });
            await loadBots();
        } finally {
            setProcessing(null);
        }
    };

    // Toggle bot
    const toggleBot = async (botId: string, currentEnabled: boolean) => {
        setProcessing(botId);
        try {
            await fetch(`/api/whatsapp-bots/${botId}/enable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !currentEnabled }),
            });
            await loadBots();
        } finally {
            setProcessing(null);
        }
    };

    // Delete bot
    const deleteBot = async (botId: string) => {
        if (!confirm('Supprimer ce bot définitivement ?')) return;

        setProcessing(botId);
        try {
            await fetch(`/api/whatsapp-bots/${botId}`, { method: 'DELETE' });
            await loadBots();
        } finally {
            setProcessing(null);
        }
    };

    // Loading
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

    const accessBadge = ACCESS_BADGES[accessLevel];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            padding: '32px',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <a
                        href="/"
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
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>
                            🤖 Agent WhatsApp
                        </h1>
                        <p style={{ color: '#94a3b8', margin: 0 }}>
                            Créez des bots WhatsApp intelligents pour votre entreprise
                        </p>
                    </div>

                    {/* Access badge */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: `${accessBadge.color}20`,
                        borderRadius: '999px',
                        color: accessBadge.color,
                        fontSize: '13px',
                        fontWeight: 500,
                    }}>
                        {accessBadge.icon}
                        {accessBadge.label}
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

                {/* Demo mode warning */}
                {accessLevel === 'demo' && (
                    <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        color: '#fcd34d',
                    }}>
                        <strong>🔒 Mode Démo</strong>
                        <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#94a3b8' }}>
                            Vous pouvez créer {botLimit} bot pour tester. Pour un accès complet,
                            <a href="/apply" style={{ color: '#8B5CF6', marginLeft: '4px' }}>demandez l&apos;accès</a>.
                        </p>
                    </div>
                )}

                {/* Backend unavailable */}
                {!backendAvailable && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        color: '#fca5a5',
                    }}>
                        <strong>⚠️ Service non disponible</strong>
                        <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#94a3b8' }}>
                            Le serveur WhatsApp Bot n&apos;est pas accessible.
                        </p>
                    </div>
                )}

                {/* Create Bot Form - Only if can create more */}
                {canCreateMore && (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '24px',
                    }}>
                        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#8B5CF6', fontWeight: 600 }}>
                            ➕ Créer un nouveau bot
                        </h2>

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                value={newBotName}
                                onChange={(e) => setNewBotName(e.target.value)}
                                placeholder="Nom du bot"
                                disabled={!backendAvailable}
                                style={{
                                    flex: 2,
                                    minWidth: '200px',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                            />
                            <select
                                value={botType}
                                onChange={(e) => setBotType(e.target.value as BotType)}
                                disabled={!backendAvailable}
                                style={{
                                    flex: 1,
                                    minWidth: '150px',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                {Object.entries(BOT_TYPE_LABELS).map(([key, label]) => (
                                    <option key={key} value={key} style={{ background: '#1e1b4b', color: 'white' }}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Advanced Options Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: '#94a3b8',
                                fontSize: '13px',
                                cursor: 'pointer',
                                marginBottom: showAdvanced ? '12px' : '16px',
                            }}
                        >
                            <Settings size={14} />
                            Options avancées
                            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {showAdvanced && (
                            <div style={{
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '16px',
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                                        📝 Prompt personnalisé
                                    </label>
                                    <textarea
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        placeholder="Instructions pour l'IA..."
                                        style={{
                                            width: '100%',
                                            minHeight: '80px',
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '13px',
                                            outline: 'none',
                                            resize: 'vertical',
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                                        👋 Message d&apos;accueil
                                    </label>
                                    <input
                                        type="text"
                                        value={welcomeMessage}
                                        onChange={(e) => setWelcomeMessage(e.target.value)}
                                        placeholder="Ex: Bonjour ! Comment puis-je vous aider ?"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '13px',
                                            outline: 'none',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                                        📚 Base de connaissances
                                    </label>
                                    <textarea
                                        value={knowledgeText}
                                        onChange={(e) => setKnowledgeText(e.target.value)}
                                        placeholder="Question | Réponse (une par ligne)"
                                        style={{
                                            width: '100%',
                                            minHeight: '80px',
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '13px',
                                            outline: 'none',
                                            resize: 'vertical',
                                        }}
                                    />
                                </div>

                                {/* Activation Modes */}
                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <label style={{ display: 'block', color: '#a78bfa', fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>
                                        🎯 Modes d&apos;activation vocale
                                    </label>

                                    {/* Activate on Receive */}
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={activateOnReceive}
                                                onChange={(e) => setActivateOnReceive(e.target.checked)}
                                                style={{ width: '18px', height: '18px', accentColor: '#8B5CF6' }}
                                            />
                                            <span style={{ color: 'white', fontSize: '14px' }}>
                                                📥 Activation à la réception
                                            </span>
                                        </label>
                                        {activateOnReceive && (
                                            <input
                                                type="text"
                                                value={receiveFromNumbers}
                                                onChange={(e) => setReceiveFromNumbers(e.target.value)}
                                                placeholder="Numéros sources (ex: 33612345678, 33698765432) - Vide = tous"
                                                style={{
                                                    width: '100%',
                                                    marginTop: '8px',
                                                    marginLeft: '28px',
                                                    padding: '10px 12px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    fontSize: '12px',
                                                    outline: 'none',
                                                    maxWidth: 'calc(100% - 28px)',
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Activate on Send */}
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={activateOnSend}
                                                onChange={(e) => setActivateOnSend(e.target.checked)}
                                                style={{ width: '18px', height: '18px', accentColor: '#8B5CF6' }}
                                            />
                                            <span style={{ color: 'white', fontSize: '14px' }}>
                                                📤 Activation à l&apos;envoi
                                            </span>
                                        </label>
                                        {activateOnSend && (
                                            <input
                                                type="text"
                                                value={sendToNumbers}
                                                onChange={(e) => setSendToNumbers(e.target.value)}
                                                placeholder="Numéros destinataires (ex: 33612345678) - Vide = tous"
                                                style={{
                                                    width: '100%',
                                                    marginTop: '8px',
                                                    marginLeft: '28px',
                                                    padding: '10px 12px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    fontSize: '12px',
                                                    outline: 'none',
                                                    maxWidth: 'calc(100% - 28px)',
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={createBot}
                            disabled={creating || !newBotName.trim() || !backendAvailable}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                background: creating || !backendAvailable ? '#4b5563' : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '15px',
                                fontWeight: 600,
                                cursor: creating || !backendAvailable ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            Créer le bot
                        </button>
                    </div>
                )}

                {/* Bot limit reached */}
                {!canCreateMore && !isAdmin && (
                    <div style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        color: '#a78bfa',
                        textAlign: 'center',
                    }}>
                        <strong>🎯 Limite atteinte</strong>
                        <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                            Vous avez créé {bots.length}/{botLimit} bot(s).
                            <a href="/apply" style={{ color: '#8B5CF6', marginLeft: '4px' }}>Demander plus de bots</a>
                        </p>
                    </div>
                )}

                {/* Bots Grid */}
                <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: 'white', fontWeight: 600 }}>
                    📋 Mes Bots ({bots.length}{!isAdmin && `/${botLimit}`})
                </h2>

                {bots.length === 0 ? (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '48px',
                        textAlign: 'center',
                        color: '#94a3b8',
                    }}>
                        <Smartphone size={40} style={{ opacity: 0.5, marginBottom: '16px' }} />
                        <p>Aucun bot. Créez votre premier bot ci-dessus ☝️</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '16px',
                    }}>
                        {bots.map(bot => {
                            const statusConfig = STATUS_CONFIG[bot.status] || STATUS_CONFIG.disconnected;
                            const isProcessing = processing === bot.id;
                            const canStart = ['created', 'disconnected', 'logged_out'].includes(bot.status);
                            const qrCode = qrCodes[bot.id];

                            return (
                                <div
                                    key={bot.id}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        padding: '20px',
                                    }}
                                >
                                    <div style={{ marginBottom: '12px' }}>
                                        <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600, color: 'white' }}>
                                            {bot.name || bot.id}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                                            {bot.phoneNumber && (
                                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                                                    📱 {bot.phoneNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p style={{
                                        margin: '0 0 12px',
                                        fontSize: '13px',
                                        color: bot.enabled ? '#10b981' : '#94a3b8',
                                    }}>
                                        {bot.enabled ? '✅ Bot activé' : '⏸ Bot désactivé'}
                                    </p>

                                    {(bot.status === 'waiting_qr' || bot.hasQR) && qrCode && (
                                        <div style={{
                                            background: 'white',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            textAlign: 'center',
                                            marginBottom: '16px',
                                        }}>
                                            <img
                                                src={qrCode}
                                                alt="QR Code"
                                                style={{ maxWidth: '200px', margin: '0 auto', display: 'block' }}
                                            />
                                            <p style={{ color: '#374151', fontSize: '12px', margin: '12px 0 0' }}>
                                                📱 Scannez avec WhatsApp
                                            </p>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {canStart ? (
                                            <button
                                                onClick={() => startBot(bot.id)}
                                                disabled={isProcessing}
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    padding: '10px 16px',
                                                    background: isProcessing ? '#4b5563' : '#10b981',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                                Démarrer
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => stopBot(bot.id)}
                                                disabled={isProcessing}
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    padding: '10px 16px',
                                                    background: isProcessing ? '#4b5563' : '#ef4444',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Square size={14} />}
                                                Arrêter
                                            </button>
                                        )}

                                        <button
                                            onClick={() => toggleBot(bot.id, bot.enabled)}
                                            disabled={isProcessing}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                padding: '10px 16px',
                                                background: 'rgba(255,255,255,0.1)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: 'white',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            <Power size={14} />
                                            {bot.enabled ? 'Désactiver' : 'Activer'}
                                        </button>

                                        <button
                                            onClick={() => deleteBot(bot.id)}
                                            disabled={isProcessing}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '10px',
                                                background: 'rgba(239, 68, 68, 0.2)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fca5a5',
                                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
