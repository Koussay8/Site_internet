'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const success = searchParams.get('success') === 'true';
    const [email, setEmail] = useState('');
    const [resubscribed, setResubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResubscribe = async () => {
        if (!email) return;
        setLoading(true);

        try {
            await fetch('/api/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            setResubscribed(true);
        } catch {
            // Ignore errors
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            {success ? (
                <>
                    <div className="icon success">✓</div>
                    <h1>Désabonnement confirmé</h1>
                    <p>Vous ne recevrez plus nos newsletters.</p>

                    {!resubscribed ? (
                        <div className="resubscribe-section">
                            <p className="muted">Vous avez changé d&apos;avis ?</p>
                            <input
                                type="email"
                                placeholder="Votre email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button
                                onClick={handleResubscribe}
                                disabled={loading || !email}
                                className="btn btn-outline"
                            >
                                {loading ? 'Chargement...' : 'Se réabonner'}
                            </button>
                        </div>
                    ) : (
                        <div className="success-message">
                            ✓ Vous êtes de nouveau abonné !
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="icon error">✕</div>
                    <h1>Lien invalide</h1>
                    <p>Ce lien de désabonnement est invalide ou a expiré.</p>
                </>
            )}

            <Link href="/" className="back-link">
                ← Retour au site
            </Link>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <div className="unsubscribe-page">
            <div className="hero-bg"></div>

            <div className="container">
                <Suspense fallback={
                    <div className="card">
                        <div className="loading">Chargement...</div>
                    </div>
                }>
                    <UnsubscribeContent />
                </Suspense>
            </div>

            <style jsx>{`
                .unsubscribe-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .hero-bg {
                    position: fixed;
                    inset: 0;
                    background: linear-gradient(135deg, #0a0118 0%, #1a0f2e 50%, #0a0118 100%);
                    z-index: -1;
                }

                .container {
                    width: 100%;
                    max-width: 450px;
                }

                .card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 3rem;
                    text-align: center;
                }

                .icon {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 1.5rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                }

                .icon.success {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                }

                .icon.error {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                h1 {
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                    color: white;
                }

                p {
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 1.5rem;
                }

                .muted {
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                }

                .resubscribe-section {
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .resubscribe-section input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: white;
                    margin-bottom: 1rem;
                }

                .resubscribe-section input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .success-message {
                    padding: 1rem;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 8px;
                    color: #10b981;
                    margin-top: 1.5rem;
                }

                .back-link {
                    display: inline-block;
                    margin-top: 2rem;
                    color: rgba(255, 255, 255, 0.5);
                    text-decoration: none;
                    transition: color 0.3s;
                }

                .back-link:hover {
                    color: white;
                }

                .loading {
                    color: rgba(255, 255, 255, 0.6);
                    padding: 2rem;
                }
            `}</style>
        </div>
    );
}
