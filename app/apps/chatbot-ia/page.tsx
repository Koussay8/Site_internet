'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Loader2,
    ArrowLeft,
    Plus,
    Copy,
    Check,
    Trash2,
    MessageSquare,
    Settings,
    Code,
    Eye,
    X
} from 'lucide-react';

interface ChatbotWidget {
    id: string;
    name: string;
    company_name: string;
    welcome_message: string;
    function_preset: 'accueil' | 'support' | 'vente' | 'custom';
    api_key: string;
    is_active: boolean;
    created_at: string;
}

const FUNCTION_PRESETS = {
    accueil: {
        name: '🏠 Accueil',
        description: 'Répond aux questions, oriente vers les services, propose des RDV'
    },
    support: {
        name: '🛠️ Support',
        description: 'Aide technique, résolution de problèmes, escalade si nécessaire'
    },
    vente: {
        name: '💰 Vente',
        description: 'Qualifie les prospects, présente les offres, pousse vers la conversion'
    },
    custom: {
        name: '⚙️ Personnalisé',
        description: 'Comportement entièrement défini par votre prompt'
    }
};

export default function ChatbotIAPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ id: string; email: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [widgets, setWidgets] = useState<ChatbotWidget[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formCompanyName, setFormCompanyName] = useState('');
    const [formWelcomeMessage, setFormWelcomeMessage] = useState('Bonjour ! Comment puis-je vous aider ?');
    const [formPrompt, setFormPrompt] = useState('');
    const [formKnowledge, setFormKnowledge] = useState('');
    const [formPreset, setFormPreset] = useState<'accueil' | 'support' | 'vente' | 'custom'>('accueil');

    // Integration settings (optional)
    const [showIntegrations, setShowIntegrations] = useState(false);
    const [formOwnerEmail, setFormOwnerEmail] = useState('');
    const [formSmtpHost, setFormSmtpHost] = useState('');
    const [formSmtpUser, setFormSmtpUser] = useState('');
    const [formSmtpPassword, setFormSmtpPassword] = useState('');
    const [formGoogleCalendarId, setFormGoogleCalendarId] = useState('');
    const [formGoogleSheetId, setFormGoogleSheetId] = useState('');

    // Check auth
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(storedUser);
        setUser(userData);
        loadWidgets(userData.id);
    }, [router]);

    const loadWidgets = useCallback(async (userId: string) => {
        try {
            const response = await fetch('/api/chatbot-widgets', {
                headers: { 'x-user-id': userId }
            });
            const data = await response.json();
            if (data.widgets) {
                setWidgets(data.widgets);
            }
        } catch (error) {
            console.error('Error loading widgets:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createWidget = async () => {
        if (!formName.trim() || !user) return;

        setCreating(true);
        try {
            // Parse knowledge base
            const knowledgeEntries = formKnowledge.trim()
                ? formKnowledge.split('\n').filter(line => line.trim()).map(line => {
                    const parts = line.split('|');
                    if (parts.length >= 2) {
                        return { question: parts[0].trim(), answer: parts[1].trim() };
                    }
                    return line.trim();
                })
                : [];

            const response = await fetch('/api/chatbot-widgets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({
                    name: formName.trim(),
                    companyName: formCompanyName.trim(),
                    welcomeMessage: formWelcomeMessage.trim(),
                    systemPrompt: formPrompt.trim(),
                    knowledgeBase: knowledgeEntries,
                    functionPreset: formPreset,
                    // Integration settings (optional)
                    ownerEmail: formOwnerEmail.trim() || null,
                    smtpHost: formSmtpHost.trim() || null,
                    smtpUser: formSmtpUser.trim() || null,
                    smtpPassword: formSmtpPassword || null,
                    googleCalendarId: formGoogleCalendarId.trim() || null,
                    googleSheetId: formGoogleSheetId.trim() || null,
                })
            });

            if (response.ok) {
                // Reset form
                setFormName('');
                setFormCompanyName('');
                setFormWelcomeMessage('Bonjour ! Comment puis-je vous aider ?');
                setFormPrompt('');
                setFormKnowledge('');
                setFormPreset('accueil');
                setShowIntegrations(false);
                setFormOwnerEmail('');
                setFormSmtpHost('');
                setFormSmtpUser('');
                setFormSmtpPassword('');
                setFormGoogleCalendarId('');
                setFormGoogleSheetId('');
                setShowCreateForm(false);
                await loadWidgets(user.id);
            } else {
                const error = await response.json();
                alert(error.error || 'Erreur de création');
            }
        } catch (error) {
            console.error('Create error:', error);
            alert('Erreur de connexion');
        } finally {
            setCreating(false);
        }
    };

    const deleteWidget = async (widgetId: string) => {
        if (!confirm('Supprimer ce chatbot définitivement ?') || !user) return;

        try {
            await fetch(`/api/chatbot-widgets/${widgetId}`, {
                method: 'DELETE',
                headers: { 'x-user-id': user.id }
            });
            await loadWidgets(user.id);
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const copyScript = (widget: ChatbotWidget) => {
        const script = `<script src="${window.location.origin}/embed/chatbot.js" data-widget-key="${widget.api_key}"></script>`;
        navigator.clipboard.writeText(script);
        setCopiedId(widget.id);
        setTimeout(() => setCopiedId(null), 2000);
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
                <Loader2 size={32} color="#a78bfa" className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            padding: '20px',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => router.push('/dashboard')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            <ArrowLeft size={18} />
                            Retour
                        </button>
                        <div>
                            <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                                💬 Chatbot IA Multi-Canal
                            </h1>
                            <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>
                                Créez des chatbots IA pour vos sites web
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        <Plus size={18} />
                        Créer un Chatbot
                    </button>
                </div>

                {/* Widgets List */}
                {widgets.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        border: '1px dashed rgba(255,255,255,0.2)',
                    }}>
                        <MessageSquare size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: 'white', marginBottom: '8px' }}>Aucun chatbot créé</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                            Créez votre premier chatbot IA en quelques clics
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            <Plus size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Créer mon premier chatbot
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '20px',
                    }}>
                        {widgets.map(widget => (
                            <div
                                key={widget.id}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div>
                                        <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>
                                            {widget.name}
                                        </h3>
                                        <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '13px' }}>
                                            {widget.company_name || 'Sans nom d\'entreprise'}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: '4px 12px',
                                        background: widget.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: widget.is_active ? '#6ee7b7' : '#fca5a5',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                    }}>
                                        {widget.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '16px',
                                }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        background: 'rgba(139, 92, 246, 0.2)',
                                        color: '#a78bfa',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                    }}>
                                        {FUNCTION_PRESETS[widget.function_preset]?.name || 'Custom'}
                                    </span>
                                </div>

                                {/* Script Code */}
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    marginBottom: '16px',
                                    fontFamily: 'monospace',
                                    fontSize: '11px',
                                    color: '#94a3b8',
                                    wordBreak: 'break-all',
                                }}>
                                    <Code size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                    {`<script src="...chatbot.js" data-widget-key="${widget.api_key.slice(0, 8)}..."></script>`}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => copyScript(widget)}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            padding: '10px',
                                            background: copiedId === widget.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: copiedId === widget.id ? '#6ee7b7' : '#a78bfa',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {copiedId === widget.id ? <Check size={14} /> : <Copy size={14} />}
                                        {copiedId === widget.id ? 'Copié !' : 'Copier le script'}
                                    </button>
                                    <button
                                        onClick={() => deleteWidget(widget.id)}
                                        style={{
                                            padding: '10px',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fca5a5',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px',
                    }}
                    onClick={() => setShowCreateForm(false)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                            borderRadius: '16px',
                            padding: '24px',
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ color: 'white', margin: 0, fontSize: '20px' }}>
                                ✨ Créer un Chatbot
                            </h2>
                            <button onClick={() => setShowCreateForm(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Name */}
                            <div>
                                <label style={{ display: 'block', color: '#a78bfa', fontSize: '14px', marginBottom: '6px' }}>
                                    📝 Nom du chatbot *
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    placeholder="Ex: Assistant Site Web"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '14px',
                                    }}
                                />
                            </div>

                            {/* Company Name */}
                            <div>
                                <label style={{ display: 'block', color: '#a78bfa', fontSize: '14px', marginBottom: '6px' }}>
                                    🏢 Nom de l&apos;entreprise
                                </label>
                                <input
                                    type="text"
                                    value={formCompanyName}
                                    onChange={e => setFormCompanyName(e.target.value)}
                                    placeholder="Ex: NovaSolutions"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '14px',
                                    }}
                                />
                            </div>

                            {/* Function Preset */}
                            <div>
                                <label style={{ display: 'block', color: '#a78bfa', fontSize: '14px', marginBottom: '6px' }}>
                                    🎯 Fonction du chatbot
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                    {Object.entries(FUNCTION_PRESETS).map(([key, preset]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setFormPreset(key as typeof formPreset)}
                                            style={{
                                                padding: '12px',
                                                background: formPreset === key ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)',
                                                border: formPreset === key ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '8px',
                                                color: 'white',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{preset.name}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{preset.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Welcome Message */}
                            <div>
                                <label style={{ display: 'block', color: '#a78bfa', fontSize: '14px', marginBottom: '6px' }}>
                                    👋 Message de bienvenue
                                </label>
                                <input
                                    type="text"
                                    value={formWelcomeMessage}
                                    onChange={e => setFormWelcomeMessage(e.target.value)}
                                    placeholder="Bonjour ! Comment puis-je vous aider ?"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '14px',
                                    }}
                                />
                            </div>

                            {/* Custom Prompt */}
                            <div>
                                <label style={{ display: 'block', color: '#a78bfa', fontSize: '14px', marginBottom: '6px' }}>
                                    💡 Instructions supplémentaires (optionnel)
                                </label>
                                <textarea
                                    value={formPrompt}
                                    onChange={e => setFormPrompt(e.target.value)}
                                    placeholder="Ex: Mentionne toujours que nous offrons une garantie 30 jours..."
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '14px',
                                        resize: 'vertical',
                                    }}
                                />
                            </div>

                            {/* Knowledge Base */}
                            <div>
                                <label style={{ display: 'block', color: '#a78bfa', fontSize: '14px', marginBottom: '6px' }}>
                                    📚 Base de connaissances
                                </label>
                                <textarea
                                    value={formKnowledge}
                                    onChange={e => setFormKnowledge(e.target.value)}
                                    placeholder="Format: Question | Réponse (une par ligne)&#10;Ex: Quels sont vos horaires ? | Nous sommes ouverts de 9h à 18h"
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '14px',
                                        resize: 'vertical',
                                    }}
                                />
                            </div>

                            {/* Integration Settings (Collapsible) */}
                            <div style={{ marginTop: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowIntegrations(!showIntegrations)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        borderRadius: '8px',
                                        color: '#6ee7b7',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span>📅 Prise de RDV & Emails (optionnel)</span>
                                    <span>{showIntegrations ? '▲' : '▼'}</span>
                                </button>

                                {showIntegrations && (
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '16px',
                                        background: 'rgba(0,0,0,0.2)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                    }}>
                                        <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                                            💡 Remplissez ces champs pour activer la prise de RDV automatique et l&apos;envoi d&apos;emails de confirmation.
                                        </p>

                                        {/* Owner Email */}
                                        <div>
                                            <label style={{ display: 'block', color: '#6ee7b7', fontSize: '13px', marginBottom: '4px' }}>
                                                📧 Votre email (pour recevoir les RDV)
                                            </label>
                                            <input
                                                type="email"
                                                value={formOwnerEmail}
                                                onChange={e => setFormOwnerEmail(e.target.value)}
                                                placeholder="votre@email.com"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    borderRadius: '6px',
                                                    color: 'white',
                                                    fontSize: '13px',
                                                }}
                                            />
                                        </div>

                                        {/* SMTP Settings */}
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                                            <p style={{ color: '#a78bfa', fontSize: '12px', margin: '0 0 8px 0' }}>
                                                📤 Configuration SMTP (pour envoyer les emails)
                                            </p>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <input
                                                    type="text"
                                                    value={formSmtpHost}
                                                    onChange={e => setFormSmtpHost(e.target.value)}
                                                    placeholder="smtp.gmail.com"
                                                    style={{
                                                        padding: '10px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        fontSize: '13px',
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    value={formSmtpUser}
                                                    onChange={e => setFormSmtpUser(e.target.value)}
                                                    placeholder="Utilisateur SMTP"
                                                    style={{
                                                        padding: '10px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        fontSize: '13px',
                                                    }}
                                                />
                                            </div>
                                            <input
                                                type="password"
                                                value={formSmtpPassword}
                                                onChange={e => setFormSmtpPassword(e.target.value)}
                                                placeholder="Mot de passe SMTP (sera chiffré)"
                                                style={{
                                                    width: '100%',
                                                    marginTop: '8px',
                                                    padding: '10px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    borderRadius: '6px',
                                                    color: 'white',
                                                    fontSize: '13px',
                                                }}
                                            />
                                        </div>

                                        {/* Google Integration */}
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                                            <p style={{ color: '#a78bfa', fontSize: '12px', margin: '0 0 8px 0' }}>
                                                📊 Google Calendar & Sheets (IDs)
                                            </p>
                                            <input
                                                type="text"
                                                value={formGoogleCalendarId}
                                                onChange={e => setFormGoogleCalendarId(e.target.value)}
                                                placeholder="ID Google Calendar (ex: xxx@group.calendar.google.com)"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    borderRadius: '6px',
                                                    color: 'white',
                                                    fontSize: '13px',
                                                }}
                                            />
                                            <input
                                                type="text"
                                                value={formGoogleSheetId}
                                                onChange={e => setFormGoogleSheetId(e.target.value)}
                                                placeholder="ID Google Sheet (dans l'URL du sheet)"
                                                style={{
                                                    width: '100%',
                                                    marginTop: '8px',
                                                    padding: '10px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    borderRadius: '6px',
                                                    color: 'white',
                                                    fontSize: '13px',
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Create Button */}
                            <button
                                onClick={createWidget}
                                disabled={creating || !formName.trim()}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: creating || !formName.trim()
                                        ? '#4b5563'
                                        : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: 'white',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: creating || !formName.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    marginTop: '8px',
                                }}
                            >
                                {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                {creating ? 'Création...' : 'Créer le Chatbot'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
