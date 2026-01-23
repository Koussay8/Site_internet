'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function ContactSection() {
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('sending');

        const form = e.currentTarget;
        const formData = new FormData(form);
        const firstName = formData.get('firstname') as string;
        const lastName = formData.get('lastname') as string;

        try {
            await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${firstName} ${lastName}`.trim(),
                    email: formData.get('email'),
                    message: formData.get('project'),
                }),
            });
            setStatus('sent');
            form.reset();
        } catch {
            setStatus('error');
        }
    };

    return (
        <section id="contact" className="w-full py-24 px-6 md:px-12 relative bg-[#0F0F10] border-t border-white/5">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none opacity-40"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">

                    {/* Left Side: Persuasive Copy */}
                    <div className="space-y-8">
                        <div>
                            <span className="inline-block py-1 px-3 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6">
                                Consultation Offerte
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                                Prêt à passer à la <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">vitesse supérieure ?</span>
                            </h2>
                            <p className="text-lg text-gray-400 leading-relaxed">
                                Ne laissez pas vos questions sans réponse. Discutons de vos objectifs et voyons comment l'IA peut concrètement transformer votre activité dès ce mois-ci.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/20 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                    <Check className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Réponse sous 24h</p>
                                    <p className="text-sm text-gray-500">Une équipe réactive à votre écoute</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/20 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <Check className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Audit gratuit</p>
                                    <p className="text-sm text-gray-500">Analyse rapide de votre potentiel IA</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-white/10">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0F0F10] bg-gray-700"></div>
                                ))}
                            </div>
                            <p>Déjà <span className="text-white font-bold">150+ entreprises</span> accompagnées</p>
                        </div>
                    </div>

                    {/* Right Side: High Converting Form */}
                    <div className="bg-[#1A1A1C] p-8 md:p-10 rounded-[30px] border border-white/10 shadow-2xl relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>

                        <form className="relative space-y-5" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Prénom</label>
                                    <input
                                        type="text"
                                        name="firstname"
                                        placeholder="Jean"
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-orange-500 focus:bg-black/50 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Nom</label>
                                    <input
                                        type="text"
                                        name="lastname"
                                        placeholder="Dupont"
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-orange-500 focus:bg-black/50 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Email Professionnel</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="jean@entreprise.com"
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-orange-500 focus:bg-black/50 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Projet</label>
                                <textarea
                                    name="project"
                                    rows={3}
                                    placeholder="Je souhaite automatiser..."
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-orange-500 focus:bg-black/50 outline-none transition-all resize-none"
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 transform transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 mt-2"
                            >
                                {status === 'sending' ? 'Envoi...' : status === 'sent' ? '✓ Envoyé !' : 'Demander mon audit gratuit'}
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-4">
                                Sans engagement. Vos données sont sécurisées.
                            </p>
                            {status === 'error' && (
                                <p className="text-red-400 text-center text-sm mt-2">Une erreur s'est produite.</p>
                            )}
                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
}
