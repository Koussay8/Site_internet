'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Search,
    Bell,
    Plus,
    Briefcase,
    MoreVertical,
    Users,
    Calendar,
    Edit,
    Trash2,
    Loader2,
} from 'lucide-react';
import type { Job } from '@/types/cv-profiler';

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/jobs', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('Failed to load jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createJob = async (jobData: Partial<Job>) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData),
            });

            if (response.ok) {
                await loadJobs();
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error('Failed to create job:', error);
        }
    };

    const deleteJob = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce poste ?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            await fetch(`/api/jobs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            await loadJobs();
        } catch (error) {
            console.error('Failed to delete job:', error);
        }
    };

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
            {/* Header Bar */}
            <header className="cvp-header">
                <div>
                    <h1 className="cvp-header-title">Postes</h1>
                    <p className="cvp-header-subtitle">{jobs.length} poste{jobs.length > 1 ? 's' : ''}</p>
                </div>

                <div className="cvp-header-actions">
                    <div className="cvp-search">
                        <Search className="cvp-search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher un poste..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="cvp-search-input"
                        />
                    </div>

                    <button className="cvp-notif-btn">
                        <Bell size={20} />
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="cvp-primary-btn"
                    >
                        <Plus size={16} />
                        Nouveau Poste
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="cvp-content">
                {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
                        <Loader2 className="dashboard-loader-icon" />
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                        {filteredJobs.map((job) => (
                            <div key={job.id} className="cvp-card" style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div className="cvp-stat-icon blue">
                                        <Briefcase size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
                                            {job.title}
                                        </h3>
                                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                                            {job.description?.substring(0, 100) || 'Aucune description'}
                                            {job.description && job.description.length > 100 ? '...' : ''}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                                        <Users size={14} />
                                        {job.min_experience || 0} an(s) exp. min
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                                        <Calendar size={14} />
                                        {new Date(job.created_at).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>

                                {/* Skills */}
                                {job.required_skills && job.required_skills.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                                        {job.required_skills.slice(0, 4).map((skill, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    padding: '4px 8px',
                                                    background: '#dbeafe',
                                                    color: '#1d4ed8',
                                                    fontSize: '12px',
                                                    borderRadius: '6px',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {typeof skill === 'object' ? skill.name : skill}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => setEditingJob(job)}
                                        style={{
                                            padding: '6px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b',
                                            borderRadius: '6px',
                                        }}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => deleteJob(job.id)}
                                        style={{
                                            padding: '6px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#ef4444',
                                            borderRadius: '6px',
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="cvp-card" style={{ textAlign: 'center', padding: '64px' }}>
                        <div className="cvp-stat-icon blue" style={{ margin: '0 auto 16px auto' }}>
                            <Briefcase size={24} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
                            Aucun poste
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
                            Créez votre premier poste pour commencer le matching
                        </p>
                        <button onClick={() => setShowCreateModal(true)} className="cvp-primary-btn">
                            <Plus size={16} />
                            Créer un poste
                        </button>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingJob) && (
                <JobModal
                    job={editingJob}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingJob(null);
                    }}
                    onSave={async (data) => {
                        if (editingJob) {
                            const token = localStorage.getItem('auth_token');
                            await fetch(`/api/jobs/${editingJob.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(data),
                            });
                            await loadJobs();
                            setEditingJob(null);
                        } else {
                            await createJob(data);
                        }
                    }}
                />
            )}
        </div>
    );
}

// Modal Component
function JobModal({
    job,
    onClose,
    onSave,
}: {
    job: Job | null;
    onClose: () => void;
    onSave: (data: Partial<Job>) => Promise<void>;
}) {
    const [title, setTitle] = useState(job?.title || '');
    const [description, setDescription] = useState(job?.description || '');
    const [minExperience, setMinExperience] = useState(job?.min_experience || 0);
    const [skills, setSkills] = useState(
        job?.required_skills?.map(s => typeof s === 'object' ? s.name : s).join(', ') || ''
    );
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const skillsList = skills.split(',').map(s => s.trim()).filter(Boolean);

        await onSave({
            title,
            description,
            min_experience: minExperience,
            required_skills: skillsList.map(name => ({ name, importance: 5 })),
        });

        setIsSaving(false);
    };

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
                    padding: '24px',
                    maxWidth: '500px',
                    width: '100%',
                    margin: '16px',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 24px 0', color: '#0f172a' }}>
                    {job ? 'Modifier le poste' : 'Nouveau poste'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Titre du poste
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Expérience minimum (années)
                        </label>
                        <input
                            type="number"
                            value={minExperience}
                            onChange={(e) => setMinExperience(parseInt(e.target.value) || 0)}
                            min={0}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                            Compétences requises (séparées par des virgules)
                        </label>
                        <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="React, Node.js, TypeScript"
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                background: '#f1f5f9',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="cvp-primary-btn"
                        >
                            {isSaving ? 'Enregistrement...' : job ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
