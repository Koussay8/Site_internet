'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Loader2,
    Sparkles,
    Zap,
    Users,
    Briefcase,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';

interface Job {
    id: string;
    title: string;
}

interface Candidate {
    id: string;
    name: string;
}

interface Assignment {
    candidate_id: string;
    candidate_name: string;
    job_id: string;
    job_title: string;
    score: number;
}

interface OptimalResult {
    assignments: Assignment[];
    total_score: number;
    average_score: number;
    unassigned_candidates: { id: string; name: string }[];
    unfilled_jobs: { id: string; title: string }[];
}

export default function PlaygroundDetailPage() {
    const params = useParams();
    const router = useRouter();
    const playgroundId = params.id as string;

    const [playground, setPlayground] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const [matrix, setMatrix] = useState<number[][]>([]);
    const [details, setDetails] = useState<any[][]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [optimalResult, setOptimalResult] = useState<OptimalResult | null>(null);
    const [showOptimalView, setShowOptimalView] = useState(false);

    useEffect(() => {
        loadPlayground();
    }, [playgroundId]);

    const loadPlayground = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/playgrounds/${playgroundId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setPlayground(data);
            } else {
                router.push('/cv-profiler/playgrounds');
            }
        } catch (error) {
            console.error('Failed to load playground:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateMatrix = async (optimize = false) => {
        if (optimize) {
            setIsOptimizing(true);
        } else {
            setIsCalculating(true);
        }

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/matching/matrix', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playground_id: playgroundId,
                    optimize,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMatrix(data.matrix || []);
                setDetails(data.details || []);
                setJobs(data.jobs || []);
                setCandidates(data.candidates || []);
                if (data.optimal_assignment) {
                    setOptimalResult(data.optimal_assignment);
                    setShowOptimalView(true);
                }
            }
        } catch (error) {
            console.error('Failed to calculate matrix:', error);
        } finally {
            setIsCalculating(false);
            setIsOptimizing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return { bg: '#dcfce7', text: '#166534' };
        if (score >= 60) return { bg: '#dbeafe', text: '#1e40af' };
        if (score >= 40) return { bg: '#fef3c7', text: '#92400e' };
        return { bg: '#fee2e2', text: '#991b1b' };
    };

    const isOptimalCell = (candidateId: string, jobId: string) => {
        if (!optimalResult) return false;
        return optimalResult.assignments.some(
            a => a.candidate_id === candidateId && a.job_id === jobId
        );
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="dashboard-loader-icon" />
            </div>
        );
    }

    if (!playground) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
            {/* Header */}
            <header className="cvp-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/cv-profiler/playgrounds" style={{ color: '#64748b', display: 'flex' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="cvp-header-title">{playground.name}</h1>
                        <p className="cvp-header-subtitle">
                            {candidates.length || '?'} candidats • {jobs.length || '?'} postes
                        </p>
                    </div>
                </div>

                <div className="cvp-header-actions">
                    <button
                        onClick={() => calculateMatrix(false)}
                        disabled={isCalculating || isOptimizing}
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
                            cursor: 'pointer',
                        }}
                    >
                        {isCalculating ? (
                            <Loader2 size={16} className="dashboard-loader-icon" />
                        ) : (
                            <Sparkles size={16} />
                        )}
                        Calculer matrice
                    </button>

                    <button
                        onClick={() => calculateMatrix(true)}
                        disabled={isCalculating || isOptimizing}
                        className="cvp-primary-btn"
                    >
                        {isOptimizing ? (
                            <>
                                <Loader2 size={16} className="dashboard-loader-icon" />
                                Optimisation...
                            </>
                        ) : (
                            <>
                                <Zap size={16} />
                                Meilleure disposition
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="cvp-content">
                {/* Optimal Assignment Result */}
                {showOptimalView && optimalResult && (
                    <div className="cvp-card" style={{ marginBottom: '24px', background: '#f0fdf4', border: '1px solid #86efac' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={20} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#166534', margin: 0 }}>
                                        Disposition Optimale
                                    </h3>
                                    <p style={{ fontSize: '13px', color: '#059669', margin: 0 }}>
                                        Score moyen: {optimalResult.average_score}%
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowOptimalView(false)}
                                style={{ padding: '6px 12px', background: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                            >
                                Masquer
                            </button>
                        </div>

                        {/* Assignments */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                            {optimalResult.assignments.map((assignment, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid #86efac',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}
                                >
                                    <CheckCircle size={18} color="#10b981" />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                                            {assignment.candidate_name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            → {assignment.job_title}
                                        </div>
                                    </div>
                                    <span style={{ padding: '4px 8px', background: '#dcfce7', color: '#166534', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                                        {assignment.score}%
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Warnings */}
                        {(optimalResult.unassigned_candidates.length > 0 || optimalResult.unfilled_jobs.length > 0) && (
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                {optimalResult.unassigned_candidates.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#92400e' }}>
                                        <AlertTriangle size={14} />
                                        <span>
                                            {optimalResult.unassigned_candidates.length} candidat(s) non assigné(s)
                                        </span>
                                    </div>
                                )}
                                {optimalResult.unfilled_jobs.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#92400e' }}>
                                        <AlertTriangle size={14} />
                                        <span>
                                            {optimalResult.unfilled_jobs.length} poste(s) non rempli(s)
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Matrix */}
                {matrix.length > 0 && jobs.length > 0 && candidates.length > 0 ? (
                    <div className="cvp-card" style={{ overflowX: 'auto' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>
                            Matrice de Compatibilité
                        </h3>

                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', textAlign: 'left', minWidth: '150px' }}>
                                        Candidat / Poste
                                    </th>
                                    {jobs.map(job => (
                                        <th key={job.id} style={{ padding: '12px', background: '#ede9fe', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#7c3aed', textAlign: 'center', minWidth: '120px' }}>
                                            <Briefcase size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                            {job.title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.map((candidate, rowIndex) => (
                                    <tr key={candidate.id}>
                                        <td style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: '#0f172a' }}>
                                            <Users size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: '#64748b' }} />
                                            {candidate.name}
                                        </td>
                                        {jobs.map((job, colIndex) => {
                                            const score = matrix[rowIndex]?.[colIndex] || 0;
                                            const colors = getScoreColor(score);
                                            const isOptimal = isOptimalCell(candidate.id, job.id);

                                            return (
                                                <td
                                                    key={job.id}
                                                    style={{
                                                        padding: '12px',
                                                        background: colors.bg,
                                                        borderRadius: '8px',
                                                        textAlign: 'center',
                                                        fontSize: '14px',
                                                        fontWeight: 700,
                                                        color: colors.text,
                                                        position: 'relative',
                                                        border: isOptimal ? '3px solid #10b981' : 'none',
                                                        boxShadow: isOptimal ? '0 0 0 2px #dcfce7' : 'none',
                                                    }}
                                                    title={details[rowIndex]?.[colIndex]?.explanation || ''}
                                                >
                                                    {score}%
                                                    {isOptimal && (
                                                        <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <CheckCircle size={10} color="white" />
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Légende:</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                <span style={{ width: '12px', height: '12px', background: '#dcfce7', borderRadius: '2px' }} />
                                80%+ Excellent
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                <span style={{ width: '12px', height: '12px', background: '#dbeafe', borderRadius: '2px' }} />
                                60%+ Bon
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                <span style={{ width: '12px', height: '12px', background: '#fef3c7', borderRadius: '2px' }} />
                                40%+ Moyen
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                <span style={{ width: '12px', height: '12px', background: '#fee2e2', borderRadius: '2px' }} />
                                &lt;40% Faible
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="cvp-card" style={{ textAlign: 'center', padding: '48px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div className="cvp-stat-icon violet">
                                <Users size={24} />
                            </div>
                            <div className="cvp-stat-icon blue">
                                <Briefcase size={24} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
                            Prêt à analyser
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
                            Ajoutez des candidats et des postes à ce playground, puis calculez la matrice de compatibilité
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => calculateMatrix(false)} disabled={isCalculating} className="cvp-primary-btn">
                                <Sparkles size={16} />
                                Calculer la matrice
                            </button>
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="cvp-card" style={{ marginTop: '24px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af', margin: '0 0 8px 0' }}>
                        ℹ️ Comment utiliser ce playground
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1e40af', lineHeight: 1.8 }}>
                        <li><strong>Matrice:</strong> Affiche le score de compatibilité entre chaque candidat et chaque poste</li>
                        <li><strong>Meilleure disposition:</strong> L'IA trouve l'assignation optimale où chaque candidat a un seul poste</li>
                        <li><strong>Contrainte:</strong> Un candidat ne peut être assigné qu'à un seul poste à la fois</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
