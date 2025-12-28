'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Upload,
    FileText,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    ArrowLeft,
} from 'lucide-react';

interface UploadFile {
    file: File;
    id: string;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    progress: number;
    error?: string;
    candidateId?: string;
}

export default function UploadPage() {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    };

    const addFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(f => {
            const ext = f.name.toLowerCase();
            return ext.endsWith('.pdf') || ext.endsWith('.docx') || ext.endsWith('.doc') || ext.endsWith('.txt');
        });

        const uploadFiles: UploadFile[] = validFiles.map(file => ({
            file,
            id: Math.random().toString(36).substring(7),
            status: 'pending',
            progress: 0,
        }));

        setFiles(prev => [...prev, ...uploadFiles]);
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const uploadFiles = async () => {
        if (files.length === 0 || isUploading) return;

        setIsUploading(true);

        const pendingFiles = files.filter(f => f.status === 'pending');

        for (const uploadFile of pendingFiles) {
            // Mettre à jour le statut
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 10 } : f
            ));

            try {
                const formData = new FormData();
                formData.append('files', uploadFile.file);

                const token = localStorage.getItem('auth_token');
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    const result = data.results?.[0];

                    setFiles(prev => prev.map(f =>
                        f.id === uploadFile.id
                            ? {
                                ...f,
                                status: result?.status === 'completed' ? 'completed' : 'error',
                                progress: 100,
                                candidateId: result?.candidate_id,
                                error: result?.error,
                            }
                            : f
                    ));
                } else {
                    throw new Error('Upload failed');
                }
            } catch (error) {
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'error', error: 'Erreur lors de l\'upload' }
                        : f
                ));
            }
        }

        setIsUploading(false);
    };

    const completedCount = files.filter(f => f.status === 'completed').length;
    const errorCount = files.filter(f => f.status === 'error').length;

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
            {/* Header Bar */}
            <header className="cvp-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/cv-profiler" style={{ color: '#64748b', display: 'flex' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="cvp-header-title">Importer des CVs</h1>
                        <p className="cvp-header-subtitle">Glissez-déposez vos fichiers ou cliquez pour sélectionner</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="cvp-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Drop Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                        border: isDragging ? '2px dashed #8B5CF6' : '2px dashed #e2e8f0',
                        borderRadius: '16px',
                        padding: '48px',
                        textAlign: 'center',
                        background: isDragging ? '#faf5ff' : 'white',
                        transition: 'all 0.2s',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: '#ede9fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px auto',
                        }}
                    >
                        <Upload size={28} color="#8B5CF6" />
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
                        Glissez vos CVs ici
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
                        Formats acceptés: PDF, DOCX, DOC, TXT
                    </p>

                    <label
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: '#8B5CF6',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        <FileText size={16} />
                        Sélectionner des fichiers
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>

                {/* Files List */}
                {files.length > 0 && (
                    <div className="cvp-card" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                                Fichiers ({files.length})
                            </h3>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {completedCount > 0 && (
                                    <span style={{ fontSize: '13px', color: '#059669' }}>
                                        ✓ {completedCount} traité{completedCount > 1 ? 's' : ''}
                                    </span>
                                )}
                                {errorCount > 0 && (
                                    <span style={{ fontSize: '13px', color: '#ef4444' }}>
                                        ✗ {errorCount} erreur{errorCount > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            background: file.status === 'completed' ? '#d1fae5' : file.status === 'error' ? '#fee2e2' : '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {file.status === 'uploading' ? (
                                            <Loader2 size={18} color="#8B5CF6" className="dashboard-loader-icon" />
                                        ) : file.status === 'completed' ? (
                                            <CheckCircle size={18} color="#059669" />
                                        ) : file.status === 'error' ? (
                                            <AlertCircle size={18} color="#ef4444" />
                                        ) : (
                                            <FileText size={18} color="#64748b" />
                                        )}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                                            {file.file.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            {file.status === 'pending' && 'En attente'}
                                            {file.status === 'uploading' && 'Traitement en cours...'}
                                            {file.status === 'completed' && 'CV importé avec succès'}
                                            {file.status === 'error' && (file.error || 'Erreur')}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {file.status === 'completed' && file.candidateId && (
                                            <Link
                                                href={`/cv-profiler/candidates/${file.candidateId}`}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#ede9fe',
                                                    color: '#7c3aed',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                Voir
                                            </Link>
                                        )}
                                        {file.status === 'pending' && (
                                            <button
                                                onClick={() => removeFile(file.id)}
                                                style={{
                                                    padding: '6px',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#64748b',
                                                }}
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Upload Button */}
                        {files.some(f => f.status === 'pending') && (
                            <button
                                onClick={uploadFiles}
                                disabled={isUploading}
                                className="cvp-primary-btn"
                                style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={16} className="dashboard-loader-icon" />
                                        Traitement en cours...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} />
                                        Importer {files.filter(f => f.status === 'pending').length} fichier{files.filter(f => f.status === 'pending').length > 1 ? 's' : ''}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Tips */}
                <div className="cvp-card" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#92400e', margin: '0 0 8px 0' }}>
                        💡 Conseils
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#92400e', lineHeight: 1.6 }}>
                        <li>Les CVs au format PDF sont recommandés pour une meilleure extraction</li>
                        <li>L'IA extrait automatiquement les compétences, expériences et coordonnées</li>
                        <li>Vous pouvez importer plusieurs fichiers à la fois</li>
                        <li>Les candidats créés sont immédiatement disponibles dans votre liste</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
