'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, Check, Eye, EyeOff, Loader2, AlertCircle, Phone } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmail, sendPhoneOTP, verifyPhoneOTP } from '@/lib/auth-helpers';

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Phone auth state
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [mockCode, setMockCode] = useState<string | null>(null);

    // Check for OAuth errors in URL
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(decodeURIComponent(errorParam));
        }
    }, [searchParams]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await signInWithEmail(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Erreur de connexion');
            setIsLoading(false);
        }
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (!otpSent) {
                // Step 1: Send OTP
                const result = await sendPhoneOTP(phone);
                setOtpSent(true);
                if (result.mockCode) {
                    setMockCode(result.mockCode);
                }
                setIsLoading(false);
            } else {
                // Step 2: Verify OTP
                await verifyPhoneOTP(phone, otp);
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'authentification');
            setIsLoading(false);
        }
    };

    const resetPhoneAuth = () => {
        setOtpSent(false);
        setOtp('');
        setMockCode(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500/30 flex flex-col relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
            </div>

            {/* Header */}
            <header className="absolute top-0 left-0 w-full z-50 p-6 md:px-12 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3 group">
                    <Image
                        src="/logo-white.png"
                        alt="Vextra Tech Logo"
                        width={32}
                        height={32}
                        className="object-contain group-hover:scale-105 transition-transform"
                    />
                    <span className="font-bold text-lg tracking-tight group-hover:text-orange-100 transition-colors">Vextra Tech</span>
                </Link>
            </header>

            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">

                    {/* Left Side */}
                    <div className="hidden md:flex flex-col justify-center space-y-8 pr-12">
                        <div>
                            <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in-up">
                                Espace Client
                            </span>
                            <h1 className="text-5xl font-bold leading-tight mb-6 animate-fade-in-up delay-100">
                                Ravi de vous <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-100">revoir.</span>
                            </h1>
                            <p className="text-gray-400 text-lg leading-relaxed animate-fade-in-up delay-200">
                                Votre tableau de bord intelligent vous attend. Connectez-vous pour suivre vos performances et gérer vos assistants IA.
                            </p>
                        </div>

                        <div className="space-y-4 animate-fade-in-up delay-300">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                    <Check className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Sécurité Maximale</p>
                                    <p className="text-sm text-gray-500">Chiffrement de bout en bout</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <Zap className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Temps Réel</p>
                                    <p className="text-sm text-gray-500">Données mises à jour à la seconde</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="relative animate-fade-in-up delay-200">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-[30px] blur-xl transform scale-105"></div>

                        <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[30px] shadow-2xl relative">
                            <div className="mb-8 text-center md:text-left">
                                <h2 className="text-2xl font-bold mb-2">Connexion</h2>
                                <p className="text-gray-500 text-sm">Entrez vos identifiants pour accéder à votre espace.</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-300">{error}</p>
                                </div>
                            )}

                            {mockCode && (
                                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                                    <p className="text-sm text-orange-300">
                                        <span className="font-bold">Code OTP (DEV):</span> {mockCode}
                                    </p>
                                </div>
                            )}

                            {/* Method Tabs */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    type="button"
                                    onClick={() => { setAuthMethod('email'); resetPhoneAuth(); }}
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${authMethod === 'email'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    Email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setAuthMethod('phone'); setError(null); }}
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${authMethod === 'phone'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    Téléphone
                                </button>
                            </div>

                            {/* Email Form */}
                            {authMethod === 'email' && (
                                <form onSubmit={handleEmailSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ml-1 ${focusedField === 'email' ? 'text-orange-500' : 'text-gray-500'}`}>
                                            Email
                                        </label>
                                        <div className={`relative flex items-center bg-[#1A1A1C] border rounded-xl transition-all duration-300 ${focusedField === 'email' ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-white/5 hover:border-white/10'}`}>
                                            <div className="pl-4 text-gray-500">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="email"
                                                placeholder="nom@entreprise.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-transparent p-4 text-white placeholder:text-gray-600 focus:outline-none"
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField(null)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${focusedField === 'password' ? 'text-orange-500' : 'text-gray-500'}`}>
                                                Mot de passe
                                            </label>
                                            <Link href="#" className="text-xs text-gray-500 hover:text-white transition-colors">
                                                Oublié ?
                                            </Link>
                                        </div>
                                        <div className={`relative flex items-center bg-[#1A1A1C] border rounded-xl transition-all duration-300 ${focusedField === 'password' ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-white/5 hover:border-white/10'}`}>
                                            <div className="pl-4 text-gray-500">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-transparent p-4 text-white placeholder:text-gray-600 focus:outline-none"
                                                onFocus={() => setFocusedField('password')}
                                                onBlur={() => setFocusedField(null)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="pr-4 text-gray-500 hover:text-white transition-colors focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 transform transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Connexion...
                                            </>
                                        ) : (
                                            <>
                                                Accéder au Dashboard
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Phone Form */}
                            {authMethod === 'phone' && (
                                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                                    {!otpSent ? (
                                        <>
                                            <div className="space-y-2">
                                                <label className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ml-1 ${focusedField === 'phone' ? 'text-orange-500' : 'text-gray-500'}`}>
                                                    Numéro de téléphone
                                                </label>
                                                <div className={`relative flex items-center bg-[#1A1A1C] border rounded-xl transition-all duration-300 ${focusedField === 'phone' ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-white/5 hover:border-white/10'}`}>
                                                    <div className="pl-4 text-gray-500">
                                                        <Phone className="w-5 h-5" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        placeholder="+33 6 12 34 56 78"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        className="w-full bg-transparent p-4 text-white placeholder:text-gray-600 focus:outline-none"
                                                        onFocus={() => setFocusedField('phone')}
                                                        onBlur={() => setFocusedField(null)}
                                                        required
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 ml-1">Format international: +33...</p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 transform transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Envoi...
                                                    </>
                                                ) : (
                                                    <>
                                                        Envoyer le code
                                                        <ArrowRight className="w-5 h-5" />
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <label className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ml-1 ${focusedField === 'otp' ? 'text-orange-500' : 'text-gray-500'}`}>
                                                    Code de vérification
                                                </label>
                                                <div className={`relative flex items-center bg-[#1A1A1C] border rounded-xl transition-all duration-300 ${focusedField === 'otp' ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-white/5 hover:border-white/10'}`}>
                                                    <input
                                                        type="text"
                                                        placeholder="123456"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        className="w-full bg-transparent p-4 text-white placeholder:text-gray-600 focus:outline-none text-center text-2xl tracking-widest"
                                                        onFocus={() => setFocusedField('otp')}
                                                        onBlur={() => setFocusedField(null)}
                                                        maxLength={6}
                                                        required
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 ml-1">Code envoyé à {phone}</p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 transform transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Vérification...
                                                    </>
                                                ) : (
                                                    <>
                                                        Vérifier et se connecter
                                                        <ArrowRight className="w-5 h-5" />
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={resetPhoneAuth}
                                                className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                                            >
                                                ← Modifier le numéro
                                            </button>
                                        </>
                                    )}
                                </form>
                            )}

                            {/* Footer */}
                            <p className="text-center text-gray-500 text-sm mt-6">
                                Pas encore de compte ?{' '}
                                <Link href="/register" className="text-white font-semibold hover:text-orange-400 transition-colors">
                                    Créer un compte
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Wrapper with Suspense boundary
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}

// Helper components
function Zap({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}
