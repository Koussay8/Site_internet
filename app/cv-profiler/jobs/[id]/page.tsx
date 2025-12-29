'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Users,
    Loader2,
    Filter,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
} from 'lucide-react';

interface Job {
    id: string;
    title: string;
    description: string;
    required_skills: string[];
    min_experience: number;
}

interface CandidateMatch {
    candidate_id: string;
    candidate_name: string;
    candidate_email: string;
    candidate_skills: string[];
    score: {
        value: number;
        explanation: string;
        matchedSkills: string[];
        missingSkills: string[];
    };
}

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [matches, setMatches] = useState<CandidateMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);
    const [filterAll, setFilterAll] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        loadJob();
    }, [jobId]);

    const loadJob = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/jobs/${jobId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setJob(data);
            } else {
                router.push('/cv-profiler/jobs');
            }
        } catch (error) {
            console.error('Failed to load job:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateMatching = async () => {
        if (!job) return;

        setIsCalculating(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/matching', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    job_id: jobId,
                    filter_all: filterAll,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMatches(data.results || []);
            }
        } catch (error) {
            console.error('Failed to calculate matching:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return { bg: '#dcfce7', text: '#166534' };
        if (score >= 60) return { bg: '#dbeafe', text: '#1e40af' };
        if (score >= 40) return { bg: '#fef3c7', text: '#92400e' };
        return { bg: '#fee2e2', text: '#991b1b' };
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="dashboard-loader-icon" />
            </div>
        );
    }

    if (!job) {
        return null;
    }

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
            {/* Header */}
            <header className="cvp-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/cv-profiler/jobs" style={{ color: '#64748b', display: 'flex' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="cvp-header-title">{job.title}</h1>
                        <p className="cvp-header-subtitle">
                            {job.required_skills?.length || 0} compétences • {job.min_experience || 0} ans min
                        </p>
                    </div>
                </div>

                <div className="cvp-header-actions">
                    <button
                        onClick={() => setFilterAll(!filterAll)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: filterAll ? '#ede9fe' : 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: filterAll ? '#7c3aed' : '#374151',
                            cursor: 'pointer',
                        }}
                    >
                        <Filter size={16} />
                        {filterAll ? 'Tous les candidats' : 'Candidats assignés'}
                    </button>

                    <button
                        onClick={calculateMatching}
                        disabled={isCalculating}
                        className="cvp-primary-btn"
                    >
                        {isCalculating ? (
                            <>
                                <Loader2 size={16} className="dashboard-loader-icon" />
                                Calcul en cours...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Calculer compatibilité
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="cvp-content">
                {/* Job Info */}
                <div className="cvp-card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                        Description du poste
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                        {job.description || 'Aucune description'}
                    </p>

                    {job.required_skills && job.required_skills.length > 0 && (
                        <>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                                Compétences requises
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {job.required_skills.map((skill: any, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            padding: '4px 10px',
                                            background: '#ede9fe',
                                            color: '#7c3aed',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {typeof skill === 'string' ? skill : skill.name}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Matching Results */}
                {matches.length > 0 ? (
                    <div className="cvp-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                                Classement par compatibilité ({matches.length})
                            </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {matches.map((match, index) => {
                                const colors = getScoreColor(match.score.value);
                                const isExpanded = expandedId === match.candidate_id;

                                return (
                                    <div
                                        key={match.candidate_id}
                                        style={{
                                            background: '#f8fafc',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            onClick={() => setExpandedId(isExpanded ? null : match.candidate_id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '14px 16px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {/* Rank */}
                                            <div
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '8px',
                                                    background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#d97706' : '#e2e8f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    color: index < 3 ? 'white' : '#64748b',
                                                }}
                                            >
                                                {index + 1}
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                                                    {match.candidate_name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {match.candidate_email}
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div
                                                style={{
                                                    padding: '6px 14px',
                                                    background: colors.bg,
                                                    color: colors.text,
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {match.score.value}%
                                            </div>

                                            {isExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div style={{ padding: '0 16px 16px', borderTop: '1px solid #e2e8f0' }}>
                                                <p style={{ fontSize: '13px', color: '#374151', margin: '12px 0' }}>
                                                    {match.score.explanation}
                                                </p>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                    {match.score.matchedSkills.length > 0 && (
                                                        <div>
                                                            <div style={{ fontSize: '12px', fontWeight: 500, color: '#059669', marginBottom: '6px' }}>
                                                                ✓ Compétences matchées
                                                            </div>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                {match.score.matchedSkills.map((s, i) => (
                                                                    <span key={i} style={{ padding: '2px 8px', background: '#dcfce7', color: '#166534', fontSize: '11px', borderRadius: '4px' }}>
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {match.score.missingSkills.length > 0 && (
                                                        <div>
                                                            <div style={{ fontSize: '12px', fontWeight: 500, color: '#dc2626', marginBottom: '6px' }}>
                                                                ✗ Compétences manquantes
                                                            </div>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                {match.score.missingSkills.map((s, i) => (
                                                                    <span key={i} style={{ padding: '2px 8px', background: '#fee2e2', color: '#991b1b', fontSize: '11px', borderRadius: '4px' }}>
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="cvp-card" style={{ textAlign: 'center', padding: '48px' }}>
                        <div className="cvp-stat-icon violet" style={{ margin: '0 auto 16px auto' }}>
                            <Users size={24} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
                            Aucun résultat
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
                            {filterAll
                                ? "Cliquez sur 'Calculer compatibilité' pour analyser tous vos candidats"
                                : "Aucun candidat assigné à ce poste ou cliquez sur 'Calculer compatibilité'"
                            }
                        </p>
                        <button onClick={calculateMatching} disabled={isCalculating} className="cvp-primary-btn">
                            <Sparkles size={16} />
                            Calculer la compatibilité
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
