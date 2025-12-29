'use client';

import { useEffect, useState } from 'react';
import {
    Search,
    Bell,
    Plus,
    FileText,
    ExternalLink,
    Edit,
    Trash2,
    Copy,
    Loader2,
    ToggleLeft,
    ToggleRight,
    Check,
    Link as LinkIcon,
} from 'lucide-react';

interface FormField {
    id: string;
    type: 'text' | 'email' | 'phone' | 'file' | 'textarea' | 'select';
    label: string;
    required: boolean;
    options?: string[];
}

interface PublicForm {
    id: string;
    title: string;
    description: string;
    fields: FormField[];
    is_active: boolean;
    created_at: string;
}

export default function FormsPage() {
    const [forms, setForms] = useState<PublicForm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        loadForms();
    }, []);

    const loadForms = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/forms', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setForms(data);
            }
        } catch (error) {
            console.error('Failed to load forms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createForm = async (data: Partial<PublicForm>) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/forms', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                await loadForms();
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error('Failed to create form:', error);
        }
    };

    const deleteForm = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            await fetch(`/api/forms/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            await loadForms();
        } catch (error) {
            console.error('Failed to delete form:', error);
        }
    };

    const toggleFormActive = async (form: PublicForm) => {
        try {
            const token = localStorage.getItem('auth_token');
            await fetch(`/api/forms/${form.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...form, is_active: !form.is_active }),
            });
            await loadForms();
        } catch (error) {
            console.error('Failed to toggle form:', error);
        }
    };

    const copyFormLink = (formId: string) => {
        const url = `${window.location.origin}/apply/${formId}`;
        navigator.clipboard.writeText(url);
        setCopiedId(formId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const openFormLink = (formId: string) => {
        window.open(`/apply/${formId}`, '_blank');
    };

    const filteredForms = forms.filter(f =>
        f.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
            {/* Header Bar */}
            <header className="cvp-header">
                <div>
                    <h1 className="cvp-header-title">Formulaires</h1>
                    <p className="cvp-header-subtitle">{forms.length} formulaire{forms.length > 1 ? 's' : ''}</p>
                </div>

                <div className="cvp-header-actions">
                    <div className="cvp-search">
                        <Search className="cvp-search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="cvp-search-input"
                        />
                    </div>

                    <button className="cvp-notif-btn">
                        <Bell size={20} />
                    </button>

                    <button onClick={() => setShowCreateModal(true)} className="cvp-primary-btn">
                        <Plus size={16} />
                        Nouveau Formulaire
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="cvp-content">
                {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
                        <Loader2 className="dashboard-loader-icon" />
                    </div>
                ) : filteredForms.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                        {filteredForms.map((form) => (
                            <div key={form.id} className="cvp-card" style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                    <div className="cvp-stat-icon violet">
                                        <FileText size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
                                            {form.title}
                                        </h3>
                                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                                            {form.description || 'Aucune description'}
                                        </p>
                                    </div>
                                </div>

                                {/* Public Link */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 12px',
                                    background: '#f8fafc',
                                    borderRadius: '8px',
                                    marginBottom: '12px'
                                }}>
                                    <LinkIcon size={14} color="#64748b" />
                                    <span style={{ flex: 1, fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {window.location.origin}/apply/{form.id}
                                    </span>
                                    <button
                                        onClick={() => copyFormLink(form.id)}
                                        style={{
                                            padding: '4px 8px',
                                            background: copiedId === form.id ? '#dcfce7' : '#e2e8f0',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: copiedId === form.id ? '#166534' : '#374151'
                                        }}
                                    >
                                        {copiedId === form.id ? <Check size={12} /> : <Copy size={12} />}
                                        {copiedId === form.id ? 'Copié!' : 'Copier'}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                                    <button
                                        onClick={() => toggleFormActive(form)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        {form.is_active ? (
                                            <>
                                                <ToggleRight size={20} color="#059669" />
                                                <span style={{ fontSize: '13px', color: '#059669' }}>Actif</span>
                                            </>
                                        ) : (
                                            <>
                                                <ToggleLeft size={20} color="#94a3b8" />
                                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Inactif</span>
                                            </>
                                        )}
                                    </button>

                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={() => openFormLink(form.id)}
                                            style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                            title="Ouvrir"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteForm(form.id)}
                                            style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="cvp-card" style={{ textAlign: 'center', padding: '64px' }}>
                        <div className="cvp-stat-icon violet" style={{ margin: '0 auto 16px auto' }}>
                            <FileText size={24} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
                            Aucun formulaire
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
                            Créez des formulaires publics pour recevoir des candidatures
                        </p>
                        <button onClick={() => setShowCreateModal(true)} className="cvp-primary-btn">
                            <Plus size={16} />
                            Créer un formulaire
                        </button>
                    </div>
                )}

                {/* Info Card */}
                <div className="cvp-card" style={{ marginTop: '24px', background: '#f0fdf4', border: '1px solid #86efac' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#166534', margin: '0 0 8px 0' }}>
                        📋 Comment ça marche ?
                    </h3>
                    <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#166534', lineHeight: 1.8 }}>
                        <li>Créez un formulaire personnalisé avec les champs de votre choix</li>
                        <li>Partagez le lien public avec vos candidats</li>
                        <li>Les candidatures sont automatiquement importées dans CV Profiler</li>
                        <li>L'IA analyse les CVs reçus et extrait les informations clés</li>
                    </ol>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <CreateFormModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={createForm}
                />
            )}
        </div>
    );
}

function CreateFormModal({
    onClose,
    onSave,
}: {
    onClose: () => void;
    onSave: (data: Partial<PublicForm>) => Promise<void>;
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<FormField[]>([
        { id: '1', type: 'text', label: 'Nom complet', required: true },
        { id: '2', type: 'email', label: 'Email', required: true },
        { id: '3', type: 'file', label: 'CV (PDF)', required: true },
    ]);
    const [isSaving, setIsSaving] = useState(false);

    const addField = () => {
        setFields([
            ...fields,
            { id: Math.random().toString(), type: 'text', label: '', required: false },
        ]);
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({ title, description, fields, is_active: true });
        setIsSaving(false);
    };

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
            onClick={onClose}
        >
            <div
                style={{ background: 'white', borderRadius: '16px', maxWidth: '600px', width: '100%', margin: '16px', maxHeight: '90vh', overflow: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#0f172a' }}>
                        Nouveau formulaire
                    </h2>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Titre du formulaire
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Ex: Candidature Développeur Full-Stack"
                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            placeholder="Description du poste ou instructions..."
                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                                Champs du formulaire
                            </label>
                            <button
                                type="button"
                                onClick={addField}
                                style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Plus size={14} />
                                Ajouter
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {fields.map((field, index) => (
                                <div key={field.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <span style={{ width: '24px', fontSize: '12px', color: '#64748b' }}>{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                        placeholder="Nom du champ"
                                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}
                                    />
                                    <select
                                        value={field.type}
                                        onChange={(e) => updateField(field.id, { type: e.target.value as FormField['type'] })}
                                        style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}
                                    >
                                        <option value="text">Texte</option>
                                        <option value="email">Email</option>
                                        <option value="phone">Téléphone</option>
                                        <option value="textarea">Zone de texte</option>
                                        <option value="file">Fichier</option>
                                        <option value="select">Liste déroulante</option>
                                    </select>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                        />
                                        Requis
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => removeField(field.id)}
                                        style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                        >
                            Annuler
                        </button>
                        <button type="submit" disabled={isSaving} className="cvp-primary-btn">
                            {isSaving ? 'Création...' : 'Créer le formulaire'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
