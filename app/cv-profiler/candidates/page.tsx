'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Loader2, Plus, ArrowUpDown, Bell, Mail, Phone, Calendar, Trash2, Edit, X, User } from 'lucide-react';
import Link from 'next/link';
import type { Candidate } from '@/types/cv-profiler';

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [sortBy, setSortBy] = useState<'created_at' | 'match_score'>('created_at');

    useEffect(() => {
        loadCandidates();
    }, []);

    const loadCandidates = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/candidates', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setCandidates(data);
            }
        } catch (error) {
            console.error('Failed to load candidates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCandidate = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            await fetch(`/api/candidates/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            await loadCandidates();
            setSelectedCandidate(null);
        } catch (error) {
            console.error('Failed to delete candidate:', error);
        }
    };

    const filteredCandidates = candidates
        .filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            (c.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'match_score') {
                return (b.match_score || 0) - (a.match_score || 0);
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    const avatarColors = [
        '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
            {/* Header Bar */}
            <header className="cvp-header">
                <div>
                    <h1 className="cvp-header-title">Candidats</h1>
                    <p className="cvp-header-subtitle">{filteredCandidates.length} résultat{filteredCandidates.length > 1 ? 's' : ''}</p>
                </div>

                <div className="cvp-header-actions">
                    <div className="cvp-search">
                        <Search className="cvp-search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email, compétence..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="cvp-search-input"
                            style={{ width: '300px' }}
                        />
                    </div>

                    <button className="cvp-notif-btn">
                        <Bell size={20} />
                    </button>

                    <Link href="/cv-profiler/upload" className="cvp-primary-btn">
                        <Plus size={16} />
                        Ajouter
                    </Link>
                </div>
            </header>

            {/* Content */}
            <div className="cvp-content">
                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setSortBy(sortBy === 'created_at' ? 'match_score' : 'created_at')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#374151',
                            cursor: 'pointer',
                        }}
                    >
                        <ArrowUpDown size={16} />
                        {sortBy === 'created_at' ? 'Date' : 'Score'}
                    </button>
                    <button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#374151',
                            cursor: 'pointer',
                        }}
                    >
                        <Filter size={16} />
                        Filtres
                    </button>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
                        <Loader2 className="dashboard-loader-icon" />
                    </div>
                )}

                {/* Candidates List */}
                {!isLoading && filteredCandidates.length > 0 && (
                    <div className="cvp-card" style={{ padding: 0, overflow: 'hidden' }}>
                        {filteredCandidates.map((candidate, index) => {
                            const initials = candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                            const color = avatarColors[candidate.name.charCodeAt(0) % avatarColors.length];

                            return (
                                <div
                                    key={candidate.id}
                                    onClick={() => setSelectedCandidate(candidate)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px 20px',
                                        borderBottom: index < filteredCandidates.length - 1 ? '1px solid #f1f5f9' : 'none',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* Avatar */}
                                    <div
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {initials}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{candidate.name}</span>
                                            {candidate.match_score !== undefined && candidate.match_score !== null && (
                                                <span
                                                    style={{
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        background: candidate.match_score >= 80 ? '#dcfce7' : candidate.match_score >= 60 ? '#dbeafe' : '#fef3c7',
                                                        color: candidate.match_score >= 80 ? '#166534' : candidate.match_score >= 60 ? '#1e40af' : '#92400e',
                                                    }}
                                                >
                                                    {candidate.match_score}%
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                                            {candidate.email && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Mail size={13} /> {candidate.email}
                                                </span>
                                            )}
                                            {candidate.phone && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Phone size={13} /> {candidate.phone}
                                                </span>
                                            )}
                                        </div>
                                        {/* Skills */}
                                        {candidate.skills && candidate.skills.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                                {candidate.skills.slice(0, 5).map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        style={{
                                                            padding: '3px 8px',
                                                            background: '#ede9fe',
                                                            color: '#7c3aed',
                                                            fontSize: '11px',
                                                            borderRadius: '4px',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {candidate.skills.length > 5 && (
                                                    <span style={{ padding: '3px 8px', background: '#f1f5f9', color: '#64748b', fontSize: '11px', borderRadius: '4px' }}>
                                                        +{candidate.skills.length - 5}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', flexShrink: 0 }}>
                                        <Calendar size={14} />
                                        {new Date(candidate.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredCandidates.length === 0 && (
                    <div className="cvp-card" style={{ textAlign: 'center', padding: '64px' }}>
                        <div className="cvp-stat-icon violet" style={{ margin: '0 auto 16px auto' }}>
                            <User size={24} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
                            {search ? 'Aucun candidat trouvé' : 'Aucun candidat'}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
                            {search ? 'Essayez une autre recherche' : 'Importez vos premiers CVs pour commencer'}
                        </p>
                        {!search && (
                            <Link href="/cv-profiler/upload" className="cvp-primary-btn" style={{ display: 'inline-flex' }}>
                                <Plus size={16} />
                                Importer des CVs
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Candidate Detail Modal */}
            {selectedCandidate && (
                <CandidateDetailModal
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    onDelete={() => deleteCandidate(selectedCandidate.id)}
                />
            )}
        </div>
    );
}

function CandidateDetailModal({
    candidate,
    onClose,
    onDelete,
}: {
    candidate: Candidate;
    onClose: () => void;
    onDelete: () => void;
}) {
    const avatarColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
    const color = avatarColors[candidate.name.charCodeAt(0) % avatarColors.length];
    const initials = candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    maxWidth: '700px',
                    width: '100%',
                    margin: '16px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                background: color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '18px',
                                fontWeight: 600,
                            }}
                        >
                            {initials}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#0f172a' }}>{candidate.name}</h2>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>{candidate.email}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={onDelete}
                            style={{ padding: '8px', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }}
                        >
                            <Trash2 size={18} />
                        </button>
                        <button
                            onClick={onClose}
                            style={{ padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {/* Contact Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                        {candidate.email && (
                            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '10px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Email</div>
                                <div style={{ fontSize: '14px', color: '#0f172a' }}>{candidate.email}</div>
                            </div>
                        )}
                        {candidate.phone && (
                            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '10px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Téléphone</div>
                                <div style={{ fontSize: '14px', color: '#0f172a' }}>{candidate.phone}</div>
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    {candidate.skills && candidate.skills.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Compétences</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {candidate.skills.map((skill, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#ede9fe',
                                            color: '#7c3aed',
                                            fontSize: '13px',
                                            borderRadius: '6px',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {candidate.experience && candidate.experience.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Expérience</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {candidate.experience.map((exp, i) => (
                                    <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{exp.title}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                                            {exp.company} • {exp.startDate} - {exp.endDate || 'Présent'}
                                        </div>
                                        {exp.description && (
                                            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{exp.description}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {candidate.education && candidate.education.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Formation</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {candidate.education.map((edu, i) => (
                                    <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{edu.degree}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>{edu.school} • {edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Psychological Profile */}
                    {candidate.psychological_profile && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Analyse Psychologique</h3>
                            <div style={{ padding: '16px', background: '#faf5ff', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 500 }}>Type de personnalité</span>
                                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{candidate.psychological_profile.personalityType}</div>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 500 }}>Style de communication</span>
                                    <div style={{ fontSize: '14px', color: '#374151' }}>{candidate.psychological_profile.communicationStyle}</div>
                                </div>
                                {candidate.psychological_profile.strengths && candidate.psychological_profile.strengths.length > 0 && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 500 }}>Points forts</span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                            {candidate.psychological_profile.strengths.map((s, i) => (
                                                <span key={i} style={{ padding: '4px 10px', background: '#dcfce7', color: '#166534', fontSize: '12px', borderRadius: '4px' }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
