'use client';

import { useState, useEffect } from 'react';
import { X, Search, Check, Users, Loader2 } from 'lucide-react';

interface Candidate {
    id: string;
    name: string;
    email: string;
    skills: string[];
}

interface CandidateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (candidateIds: string[]) => void;
    excludeIds?: string[];
    title?: string;
}

export default function CandidateSelector({
    isOpen,
    onClose,
    onSelect,
    excludeIds = [],
    title = 'Sélectionner des candidats'
}: CandidateSelectorProps) {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            loadCandidates();
            setSelected(new Set());
            setSearch('');
        }
    }, [isOpen]);

    const loadCandidates = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/candidates');
            if (res.ok) {
                const data = await res.json();
                setCandidates(data.filter((c: Candidate) => !excludeIds.includes(c.id)));
            }
        } catch (err) {
            console.error('Error loading candidates:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleCandidate = (id: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const selectAll = () => {
        const filteredIds = filteredCandidates.map(c => c.id);
        if (filteredIds.every(id => selected.has(id))) {
            // Deselect all
            setSelected(new Set());
        } else {
            // Select all
            setSelected(new Set(filteredIds));
        }
    };

    const handleConfirm = () => {
        onSelect(Array.from(selected));
        onClose();
    };

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '600px', maxHeight: '80vh' }}
            >
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} />
                        {title}
                    </h3>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email ou compétence..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '40px', width: '100%' }}
                        />
                    </div>
                </div>

                <div style={{
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-secondary)'
                }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {selected.size} sélectionné{selected.size > 1 ? 's' : ''}
                    </span>
                    <button
                        className="btn-secondary"
                        onClick={selectAll}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                    >
                        {filteredCandidates.every(c => selected.has(c.id)) ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                </div>

                <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '0.5rem'
                }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '2rem',
                            color: 'var(--text-muted)'
                        }}>
                            <Loader2 className="spin" size={24} />
                        </div>
                    ) : filteredCandidates.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'var(--text-muted)'
                        }}>
                            Aucun candidat trouvé
                        </div>
                    ) : (
                        filteredCandidates.map(candidate => (
                            <div
                                key={candidate.id}
                                onClick={() => toggleCandidate(candidate.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: selected.has(candidate.id)
                                        ? 'rgba(139, 92, 246, 0.1)'
                                        : 'transparent',
                                    border: selected.has(candidate.id)
                                        ? '1px solid var(--primary)'
                                        : '1px solid transparent',
                                    marginBottom: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    border: selected.has(candidate.id)
                                        ? '2px solid var(--primary)'
                                        : '2px solid var(--border)',
                                    background: selected.has(candidate.id)
                                        ? 'var(--primary)'
                                        : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {selected.has(candidate.id) && (
                                        <Check size={14} color="white" />
                                    )}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '500' }}>{candidate.name}</div>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--text-muted)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {candidate.email}
                                    </div>
                                    {candidate.skills?.length > 0 && (
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.25rem',
                                            flexWrap: 'wrap',
                                            marginTop: '0.25rem'
                                        }}>
                                            {candidate.skills.slice(0, 4).map((skill, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        padding: '0.125rem 0.5rem',
                                                        background: 'var(--bg-tertiary)',
                                                        borderRadius: '4px',
                                                        color: 'var(--text-muted)'
                                                    }}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {candidate.skills.length > 4 && (
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    +{candidate.skills.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Annuler
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleConfirm}
                        disabled={selected.size === 0}
                    >
                        Ajouter {selected.size > 0 ? `(${selected.size})` : ''}
                    </button>
                </div>
            </div>
        </div>
    );
}
