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
    UserPlus,
} from 'lucide-react';
import CandidateSelector from '@/components/cv-profiler/CandidateSelector';

interface Job {
    id: string;
    title: string;
    description: string;
    required_skills: string[];
    min_experience: number;
}

interface JobCandidate {
    id: string;
    match_score: number;
    matched_skills: string[];
    missing_skills: string[];
    explanation: string;
    candidate: {
        id: string;
        name: string;
        email: string;
        phone: string;
        skills: string[];
    };
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
    const [jobCandidates, setJobCandidates] = useState<JobCandidate[]>([]);
    const [matches, setMatches] = useState<CandidateMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);
    const [filterAll, setFilterAll] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showSelector, setShowSelector] = useState(false);
    const [activeTab, setActiveTab] = useState<'associated' | 'matching'>('associated');

    useEffect(() => {
        loadJob();
        loadJobCandidates();
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

    const loadJobCandidates = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/jobs/${jobId}/candidates`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setJobCandidates(data || []);
            }
        } catch (error) {
            console.error('Failed to load job candidates:', error);
        }
    };

    const addCandidates = async (candidateIds: string[]) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/jobs/${jobId}/candidates`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ candidateIds }),
            });
            if (response.ok) {
                loadJobCandidates();
            }
        } catch (error) {
            console.error('Failed to add candidates:', error);
        }
    };

    const removeCandidate = async (candidateId: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            await fetch(`/api/jobs/${jobId}/candidates`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ candidateId }),
            });
            loadJobCandidates();
        } catch (error) {
            console.error('Failed to remove candidate:', error);
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
                setActiveTab('matching');
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

    if (!job) return null;

    const excludedCandidateIds = jobCandidates.map(jc => jc.candidate?.id).filter(Boolean);

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
                        onClick={() => setShowSelector(true)}
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
                        <UserPlus size={16} />
                        Ajouter des candidats
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

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button
                        onClick={() => setActiveTab('associated')}
                        style={{
                            padding: '10px 20px',
                            background: activeTab === 'associated' ? '#8B5CF6' : 'white',
                            color: activeTab === 'associated' ? 'white' : '#374151',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        <Users size={16} style={{ marginRight: '8px', display: 'inline' }} />
                        Candidats associés ({jobCandidates.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('matching')}
                        style={{
                            padding: '10px 20px',
                            background: activeTab === 'matching' ? '#8B5CF6' : 'white',
                            color: activeTab === 'matching' ? 'white' : '#374151',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        <Sparkles size={16} style={{ marginRight: '8px', display: 'inline' }} />
                        Matching IA ({matches.length})
                    </button>
                </div>

                {/* Associated Candidates Tab */}
                {activeTab === 'associated' && (
                    <div className="cvp-card">
                        {jobCandidates.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {jobCandidates.map((jc, index) => {
                                    const colors = getScoreColor(jc.match_score || 0);
                                    return (
                                        <div
                                            key={jc.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '14px 16px',
                                                background: '#f8fafc',
                                                borderRadius: '10px',
                                            }}
                                        >
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

                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                                                    {jc.candidate?.name || 'N/A'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {jc.candidate?.email}
                                                </div>
                                            </div>

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
                                                {jc.match_score || 0}%
                                            </div>

                                            <button
                                                onClick={() => removeCandidate(jc.candidate?.id)}
                                                style={{
                                                    padding: '8px',
                                                    background: '#fee2e2',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    color: '#dc2626',
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '48px' }}>
                                <div className="cvp-stat-icon violet" style={{ margin: '0 auto 16px auto' }}>
                                    <Users size={24} />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
                                    Aucun candidat associé
                                </h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
                                    Ajoutez des candidats pour ce poste
                                </p>
                                <button onClick={() => setShowSelector(true)} className="cvp-primary-btn">
                                    <UserPlus size={16} />
                                    Ajouter des candidats
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Matching Tab */}
                {activeTab === 'matching' && (
                    <div className="cvp-card">
                        {matches.length > 0 ? (
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

                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                                                        {match.candidate_name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                        {match.candidate_email}
                                                    </div>
                                                </div>

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
                        ) : (
                            <div style={{ textAlign: 'center', padding: '48px' }}>
                                <div className="cvp-stat-icon violet" style={{ margin: '0 auto 16px auto' }}>
                                    <Sparkles size={24} />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
                                    Aucun résultat de matching
                                </h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
                                    Cliquez sur &quot;Calculer compatibilité&quot; pour analyser tous les candidats
                                </p>
                                <button onClick={calculateMatching} disabled={isCalculating} className="cvp-primary-btn">
                                    <Sparkles size={16} />
                                    Calculer la compatibilité
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Candidate Selector Modal */}
            <CandidateSelector
                isOpen={showSelector}
                onClose={() => setShowSelector(false)}
                onSelect={addCandidates}
                excludeIds={excludedCandidateIds}
                title="Ajouter des candidats à ce poste"
            />
        </div>
    );
}
