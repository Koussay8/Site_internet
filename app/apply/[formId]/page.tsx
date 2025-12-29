'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Upload, CheckCircle, Loader2, AlertCircle, FileText, Send } from 'lucide-react';

interface FormField {
    id: string;
    type: 'text' | 'email' | 'phone' | 'file' | 'textarea' | 'select';
    label: string;
    required: boolean;
    options?: string[];
}

interface FormData {
    id: string;
    title: string;
    description: string;
    fields: FormField[];
    is_active: boolean;
}

export default function PublicApplyPage() {
    const params = useParams();
    const router = useRouter();
    const formId = params.formId as string;

    const [form, setForm] = useState<FormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [cvFile, setCvFile] = useState<File | null>(null);

    useEffect(() => {
        loadForm();
    }, [formId]);

    const loadForm = async () => {
        try {
            const response = await fetch(`/api/public/apply/${formId}`);
            if (response.ok) {
                const data = await response.json();
                setForm(data);
            } else {
                setError('Ce formulaire n\'existe pas ou n\'est plus disponible.');
            }
        } catch (e) {
            setError('Erreur lors du chargement du formulaire.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const cvFile = files.find(f =>
            f.type === 'application/pdf' ||
            f.name.endsWith('.pdf') ||
            f.name.endsWith('.docx')
        );
        if (cvFile) setCvFile(cvFile);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const submitData = new FormData();

            // Ajouter les champs standards
            submitData.append('name', formValues['name'] || formValues['Nom complet'] || '');
            submitData.append('email', formValues['email'] || formValues['Email'] || '');
            submitData.append('phone', formValues['phone'] || formValues['Téléphone'] || '');

            // Ajouter le CV s'il existe
            if (cvFile) {
                submitData.append('cv', cvFile);
            }

            // Ajouter les autres données personnalisées
            submitData.append('custom_data', JSON.stringify(formValues));

            const response = await fetch(`/api/public/apply/${formId}`, {
                method: 'POST',
                body: submitData,
            });

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                const data = await response.json();
                setError(data.error || 'Erreur lors de l\'envoi');
            }
        } catch (e) {
            setError('Erreur de connexion. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} color="#a855f7" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    // Error state
    if (error && !form) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '48px', textAlign: 'center', maxWidth: '400px' }}>
                    <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
                    <h1 style={{ color: 'white', fontSize: '24px', marginBottom: '16px' }}>Formulaire indisponible</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{error}</p>
                </div>
            </div>
        );
    }

    // Success state
    if (isSubmitted) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '48px', textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <CheckCircle size={40} color="white" />
                    </div>
                    <h1 style={{ color: 'white', fontSize: '28px', marginBottom: '16px' }}>Candidature envoyée !</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: 1.6 }}>
                        Merci pour votre candidature. Nous analysons votre profil et vous recontacterons dans les meilleurs délais.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', padding: '40px 20px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
                        {form?.title}
                    </h1>
                    {form?.description && (
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>
                            {form.description}
                        </p>
                    )}
                </div>

                {/* Form Card */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '32px', backdropFilter: 'blur(10px)' }}>
                    <form onSubmit={handleSubmit}>
                        {/* Dynamic Fields */}
                        {form?.fields.map((field) => (
                            <div key={field.id} style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                                    {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                                </label>

                                {field.type === 'file' ? (
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        style={{
                                            border: '2px dashed rgba(168,85,247,0.5)',
                                            borderRadius: '12px',
                                            padding: '24px',
                                            textAlign: 'center',
                                            background: cvFile ? 'rgba(16,185,129,0.1)' : 'rgba(168,85,247,0.05)',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => document.getElementById('cv-input')?.click()}
                                    >
                                        {cvFile ? (
                                            <>
                                                <FileText size={24} color="#10b981" style={{ marginBottom: '8px' }} />
                                                <p style={{ color: '#10b981', fontSize: '14px', margin: 0 }}>{cvFile.name}</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={24} color="#a855f7" style={{ marginBottom: '8px' }} />
                                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>
                                                    Glissez votre CV ou cliquez pour sélectionner
                                                </p>
                                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '4px 0 0' }}>
                                                    PDF, DOCX acceptés
                                                </p>
                                            </>
                                        )}
                                        <input
                                            id="cv-input"
                                            type="file"
                                            accept=".pdf,.docx"
                                            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        value={formValues[field.label] || ''}
                                        onChange={(e) => setFormValues({ ...formValues, [field.label]: e.target.value })}
                                        required={field.required}
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '14px',
                                            resize: 'vertical',
                                        }}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        value={formValues[field.label] || ''}
                                        onChange={(e) => setFormValues({ ...formValues, [field.label]: e.target.value })}
                                        required={field.required}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'rgba(30,30,50,0.9)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {field.options?.map((opt, i) => (
                                            <option key={i} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        value={formValues[field.label] || ''}
                                        onChange={(e) => setFormValues({ ...formValues, [field.label]: e.target.value })}
                                        required={field.required}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '14px',
                                        }}
                                    />
                                )}
                            </div>
                        ))}

                        {/* Error message */}
                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                                <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                opacity: isSubmitting ? 0.7 : 1,
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Envoyer ma candidature
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '24px' }}>
                    Propulsé par CV Profiler
                </p>
            </div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
