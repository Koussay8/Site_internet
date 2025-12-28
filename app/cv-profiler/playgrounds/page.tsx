'use client';

import { useEffect, useState } from 'react';
import {
    Search,
    Bell,
    Plus,
    FolderKanban,
    Users,
    Edit,
    Trash2,
    Loader2,
} from 'lucide-react';
import type { Playground, Candidate } from '@/types/cv-profiler';

const COLORS = [
    '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'
];

export default function PlaygroundsPage() {
    const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPlayground, setEditingPlayground] = useState<Playground | null>(null);
    const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const [playgroundsRes, candidatesRes] = await Promise.all([
                fetch('/api/playgrounds', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/candidates', { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            if (playgroundsRes.ok) setPlaygrounds(await playgroundsRes.json());
            if (candidatesRes.ok) setCandidates(await candidatesRes.json());
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createPlayground = async (data: Partial<Playground>) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/playgrounds', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                await loadData();
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error('Failed to create playground:', error);
        }
    };

    const deletePlayground = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce playground ?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            await fetch(`/api/playgrounds/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            await loadData();
        } catch (error) {
            console.error('Failed to delete playground:', error);
        }
    };

    const addCandidateToPlayground = async (playgroundId: string, candidateId: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            await fetch(`/api/playgrounds/${playgroundId}/candidates`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ candidate_id: candidateId }),
            });
            await loadData();
        } catch (error) {
            console.error('Failed to add candidate:', error);
        }
    };

    const removeCandidateFromPlayground = async (playgroundId: string, candidateId: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            await fetch(`/api/playgrounds/${playgroundId}/candidates?candidate_id=${candidateId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            await loadData();
        } catch (error) {
            console.error('Failed to remove candidate:', error);
        }
    };

    const filteredPlaygrounds = playgrounds.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const getCandidatesForPlayground = (playground: Playground) => {
        return candidates.filter(c =>
            (playground.candidate_ids || []).includes(c.id)
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
            {/* Header Bar */}
            <header className="cvp-header">
                <div>
                    <h1 className="cvp-header-title">Playgrounds</h1>
                    <p className="cvp-header-subtitle">{playgrounds.length} groupe{playgrounds.length > 1 ? 's' : ''}</p>
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
                        Nouveau Playground
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="cvp-content">
                {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
                        <Loader2 className="dashboard-loader-icon" />
                    </div>
                ) : filteredPlaygrounds.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {filteredPlaygrounds.map((playground) => {
                            const pgCandidates = getCandidatesForPlayground(playground);
                            return (
                                <div
                                    key={playground.id}
                                    className="cvp-card"
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                    onClick={() => setSelectedPlayground(playground)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: playground.color || '#8B5CF6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <FolderKanban size={20} color="white" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
                                                {playground.name}
                                            </h3>
                                            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                                                {playground.description || 'Aucune description'}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                                        <Users size={16} color="#64748b" />
                                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                                            {pgCandidates.length} candidat{pgCandidates.length > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Avatars */}
                                    {pgCandidates.length > 0 && (
                                        <div style={{ display: 'flex', marginTop: '12px' }}>
                                            {pgCandidates.slice(0, 5).map((c, i) => (
                                                <div
                                                    key={c.id}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: COLORS[i % COLORS.length],
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        marginLeft: i > 0 ? '-8px' : 0,
                                                        border: '2px solid white',
                                                    }}
                                                >
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>
                                            ))}
                                            {pgCandidates.length > 5 && (
                                                <div
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: '#e2e8f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#64748b',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        marginLeft: '-8px',
                                                        border: '2px solid white',
                                                    }}
                                                >
                                                    +{pgCandidates.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div
                                        style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '4px' }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => setEditingPlayground(playground)}
                                            style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => deletePlayground(playground.id)}
                                            style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="cvp-card" style={{ textAlign: 'center', padding: '64px' }}>
                        <div className="cvp-stat-icon emerald" style={{ margin: '0 auto 16px auto' }}>
                            <FolderKanban size={24} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
                            Aucun playground
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
                            Créez des groupes pour organiser vos candidats
                        </p>
                        <button onClick={() => setShowCreateModal(true)} className="cvp-primary-btn">
                            <Plus size={16} />
                            Créer un playground
                        </button>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingPlayground) && (
                <PlaygroundModal
                    playground={editingPlayground}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingPlayground(null);
                    }}
                    onSave={async (data) => {
                        if (editingPlayground) {
                            const token = localStorage.getItem('auth_token');
                            await fetch(`/api/playgrounds/${editingPlayground.id}`, {
                                method: 'PUT',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify(data),
                            });
                            await loadData();
                            setEditingPlayground(null);
                        } else {
                            await createPlayground(data);
                        }
                    }}
                />
            )}

            {/* Playground Detail Modal */}
            {selectedPlayground && (
                <PlaygroundDetailModal
                    playground={selectedPlayground}
                    candidates={candidates}
                    playgroundCandidates={getCandidatesForPlayground(selectedPlayground)}
                    onClose={() => setSelectedPlayground(null)}
                    onAddCandidate={(candidateId) => addCandidateToPlayground(selectedPlayground.id, candidateId)}
                    onRemoveCandidate={(candidateId) => removeCandidateFromPlayground(selectedPlayground.id, candidateId)}
                />
            )}
        </div>
    );
}

// Create/Edit Modal
function PlaygroundModal({
    playground,
    onClose,
    onSave,
}: {
    playground: Playground | null;
    onClose: () => void;
    onSave: (data: Partial<Playground>) => Promise<void>;
}) {
    const [name, setName] = useState(playground?.name || '');
    const [description, setDescription] = useState(playground?.description || '');
    const [color, setColor] = useState(playground?.color || COLORS[0]);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({ name, description, color });
        setIsSaving(false);
    };

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
            onClick={onClose}
        >
            <div
                style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', margin: '16px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 24px 0', color: '#0f172a' }}>
                    {playground ? 'Modifier le playground' : 'Nouveau playground'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Nom</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Couleur</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: c,
                                        border: color === c ? '3px solid #0f172a' : '3px solid transparent',
                                        cursor: 'pointer',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                            Annuler
                        </button>
                        <button type="submit" disabled={isSaving} className="cvp-primary-btn">
                            {isSaving ? 'Enregistrement...' : playground ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Playground Detail Modal
function PlaygroundDetailModal({
    playground,
    candidates,
    playgroundCandidates,
    onClose,
    onAddCandidate,
    onRemoveCandidate,
}: {
    playground: Playground;
    candidates: Candidate[];
    playgroundCandidates: Candidate[];
    onClose: () => void;
    onAddCandidate: (id: string) => void;
    onRemoveCandidate: (id: string) => void;
}) {
    const availableCandidates = candidates.filter(
        c => !playgroundCandidates.some(pc => pc.id === c.id)
    );

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
            onClick={onClose}
        >
            <div
                style={{ background: 'white', borderRadius: '16px', maxWidth: '600px', width: '100%', margin: '16px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: playground.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FolderKanban size={24} color="white" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#0f172a' }}>{playground.name}</h2>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{playground.description}</p>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Candidats dans ce groupe ({playgroundCandidates.length})
                    </h3>

                    {playgroundCandidates.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                            {playgroundCandidates.map((c) => (
                                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 600 }}>
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{c.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{c.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemoveCandidate(c.id)}
                                        style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                                    >
                                        Retirer
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Aucun candidat dans ce groupe</p>
                    )}

                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Ajouter des candidats
                    </h3>

                    {availableCandidates.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {availableCandidates.map((c) => (
                                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{c.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{c.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onAddCandidate(c.id)}
                                        style={{ padding: '6px 12px', background: '#ecfdf5', color: '#059669', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                                    >
                                        Ajouter
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '14px', color: '#94a3b8' }}>Tous les candidats sont déjà dans ce groupe</p>
                    )}
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
                    <button onClick={onClose} style={{ width: '100%', padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
