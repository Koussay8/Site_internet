'use client';

import { useState, useEffect } from 'react';
import { X, Search, Check, Briefcase, Loader2 } from 'lucide-react';

interface Job {
    id: string;
    title: string;
    description: string;
    required_skills: string[];
}

interface JobSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (jobIds: string[]) => void;
    excludeIds?: string[];
    title?: string;
}

export default function JobSelector({
    isOpen,
    onClose,
    onSelect,
    excludeIds = [],
    title = 'Sélectionner des postes'
}: JobSelectorProps) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            loadJobs();
            setSelected(new Set());
            setSearch('');
        }
    }, [isOpen]);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/jobs');
            if (res.ok) {
                const data = await res.json();
                setJobs(data.filter((j: Job) => !excludeIds.includes(j.id)));
            }
        } catch (err) {
            console.error('Error loading jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleJob = (id: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const selectAll = () => {
        const filteredIds = filteredJobs.map(j => j.id);
        if (filteredIds.every(id => selected.has(id))) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filteredIds));
        }
    };

    const handleConfirm = () => {
        onSelect(Array.from(selected));
        onClose();
    };

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.description?.toLowerCase().includes(search.toLowerCase()) ||
        j.required_skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
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
                        <Briefcase size={20} />
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
                            placeholder="Rechercher par titre ou compétence..."
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
                        {filteredJobs.every(j => selected.has(j.id)) ? 'Tout désélectionner' : 'Tout sélectionner'}
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
                    ) : filteredJobs.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'var(--text-muted)'
                        }}>
                            Aucun poste trouvé
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <div
                                key={job.id}
                                onClick={() => toggleJob(job.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: selected.has(job.id)
                                        ? 'rgba(59, 130, 246, 0.1)'
                                        : 'transparent',
                                    border: selected.has(job.id)
                                        ? '1px solid var(--primary-blue)'
                                        : '1px solid transparent',
                                    marginBottom: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    border: selected.has(job.id)
                                        ? '2px solid var(--primary-blue)'
                                        : '2px solid var(--border)',
                                    background: selected.has(job.id)
                                        ? 'var(--primary-blue)'
                                        : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {selected.has(job.id) && (
                                        <Check size={14} color="white" />
                                    )}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '500' }}>{job.title}</div>
                                    {job.description && (
                                        <div style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--text-muted)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {job.description}
                                        </div>
                                    )}
                                    {job.required_skills?.length > 0 && (
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.25rem',
                                            flexWrap: 'wrap',
                                            marginTop: '0.25rem'
                                        }}>
                                            {job.required_skills.slice(0, 4).map((skill, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        padding: '0.125rem 0.5rem',
                                                        background: 'rgba(59, 130, 246, 0.1)',
                                                        borderRadius: '4px',
                                                        color: 'var(--primary-blue)'
                                                    }}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.required_skills.length > 4 && (
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    +{job.required_skills.length - 4}
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
