'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
    Settings
} from 'lucide-react';
import type { WhatsAppBot, BotType } from '@/types/whatsapp-bot';
import { BOT_TYPE_LABELS } from '@/types/whatsapp-bot';

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

export default function WhatsAppBotsPage() {
    const router = useRouter();
    const [bots, setBots] = useState<WhatsAppBot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Form state
    const [newBotName, setNewBotName] = useState('');
    const [botType, setBotType] = useState<BotType>('invoice');
    const [customPrompt, setCustomPrompt] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [knowledgeText, setKnowledgeText] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [creating, setCreating] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);
    const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
    const [countdown, setCountdown] = useState(5);
    const [backendAvailable, setBackendAvailable] = useState(true);

    // Load bots
    const loadBots = useCallback(async () => {
        try {
            const response = await fetch('/api/whatsapp-bots');
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
    }, []);

    // Load QR code for a bot
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
        loadBots();
    }, [router, loadBots]);

    // Auto-refresh countdown
    useEffect(() => {
        if (!isAdmin) return;

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    loadBots();
                    return 5;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isAdmin, loadBots]);

    // Create bot with options
    const createBot = async () => {
        if (!newBotName.trim()) return;

        setCreating(true);
        try {
            // Parse knowledge text into entries
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newBotName.trim(),
                    options: {
                        botType,
                        customPrompt: customPrompt.trim() || undefined,
                        knowledge: knowledgeEntries.length > 0 ? knowledgeEntries : undefined,
                        welcomeMessage: welcomeMessage.trim() || undefined,
                        language: 'fr',
                    },
                }),
            });

            if (response.ok) {
                // Reset form
                setNewBotName('');
                setBotType('invoice');
                setCustomPrompt('');
                setWelcomeMessage('');
                setKnowledgeText('');
                setShowAdvanced(false);
                await loadBots();
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
        } catch (error) {
            console.error('Error starting bot:', error);
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
        } catch (error) {
            console.error('Error stopping bot:', error);
        } finally {
            setProcessing(null);
        }
    };

    // Toggle bot enabled
    const toggleBot = async (botId: string, currentEnabled: boolean) => {
        setProcessing(botId);
        try {
            await fetch(`/api/whatsapp-bots/${botId}/enable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !currentEnabled }),
            });
            await loadBots();
        } catch (error) {
            console.error('Error toggling bot:', error);
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
        } catch (error) {
            console.error('Error deleting bot:', error);
        } finally {
            setProcessing(null);
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
                    <p style={{ color: '#94a3b8' }}>Vous n&apos;avez pas les permissions admin.</p>
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
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <a
                        href="/admin/users"
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
                            🤖 WhatsApp Bots
                        </h1>
                        <p style={{ color: '#94a3b8', margin: 0 }}>
                            Gérez vos bots WhatsApp pour la génération de factures
                        </p>
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
                        🤖 WhatsApp Bots
                    </span>
                </div>

                {/* Backend unavailable warning */}
                {!backendAvailable && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        color: '#fca5a5',
                    }}>
                        <strong>⚠️ Backend non disponible</strong>
                        <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#94a3b8' }}>
                            Le serveur WhatsApp Bot n&apos;est pas accessible. Vérifiez que le backend est déployé sur Railway.
                        </p>
                    </div>
                )}

                {/* Create Bot Form */}
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

                    {/* Row 1: Name + Type */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            value={newBotName}
                            onChange={(e) => setNewBotName(e.target.value)}
                            placeholder="Nom du bot (ex: Bot Client A)"
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

                    {/* Advanced Options */}
                    {showAdvanced && (
                        <div style={{
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px',
                        }}>
                            {/* Custom Prompt */}
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                                    📝 Prompt personnalisé (optionnel)
                                </label>
                                <textarea
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="Laissez vide pour utiliser le prompt par défaut du type de bot sélectionné"
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

                            {/* Welcome Message */}
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                                    👋 Message d&apos;accueil (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={welcomeMessage}
                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                    placeholder="Ex: Bonjour ! Je suis votre assistant..."
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

                            {/* Knowledge Base */}
                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                                    📚 Base de connaissances (optionnel)
                                </label>
                                <textarea
                                    value={knowledgeText}
                                    onChange={(e) => setKnowledgeText(e.target.value)}
                                    placeholder="Une entrée par ligne. Format: Question | Réponse&#10;Ex: Quels sont vos horaires ? | Du lundi au vendredi, 9h-18h"
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
                        </div>
                    )}

                    {/* Create Button */}
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
                        Créer le bot {BOT_TYPE_LABELS[botType]}
                    </button>
                </div>

                {/* Info Box */}
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                    color: '#93c5fd',
                }}>
                    <strong>💡 Comment ça marche :</strong>
                    <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                        1. Créer un bot → 2. Cliquer &quot;Démarrer&quot; → 3. Scanner le QR avec WhatsApp → 4. Activer le bot
                    </p>
                </div>

                {/* Bots Grid */}
                <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: 'white', fontWeight: 600 }}>
                    📋 Mes Bots ({bots.length})
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
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {/* Bot Header */}
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

                                    {/* Enabled Status */}
                                    <p style={{
                                        margin: '0 0 12px',
                                        fontSize: '13px',
                                        color: bot.enabled ? '#10b981' : '#94a3b8',
                                    }}>
                                        {bot.enabled ? '✅ Bot activé' : '⏸ Bot désactivé'}
                                    </p>

                                    {/* QR Code */}
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
                                                📱 Scannez avec WhatsApp → Appareils connectés
                                            </p>
                                        </div>
                                    )}

                                    {/* Actions */}
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
