'use client';

import {
    FileText, Phone, MessageSquare, Clipboard, Mail, Globe,
    Calendar, Calculator, Building, Video, RefreshCw, Smartphone,
    Target, BarChart3
} from 'lucide-react';

const solutions = [
    { icon: FileText, title: 'CV Profiler', desc: "Recrutez 3x plus vite. L'IA analyse, trie et matche vos CVs." },
    { icon: Phone, title: 'Agent Téléphonique IA 24/7', desc: 'Réceptionniste IA qui qualifie et prend des RDV. Dupliquez votre voix.' },
    { icon: MessageSquare, title: 'Chatbot IA Multi-Canal', desc: 'Sur votre site, Instagram, WhatsApp ou Messenger. 24h/24.' },
    { icon: Clipboard, title: 'Qualification de Dossiers IA', desc: "Qualifiez les dossiers avant la première visite. Vérification d'éligibilité." },
    { icon: Mail, title: 'Emailing IA Personnalisé', desc: 'Emails hyper-personnalisés qui convertissent vraiment.' },
    { icon: Globe, title: 'Site Web Premium', desc: '1ère page Google. SEO optimisé, espace client, e-commerce.' },
    { icon: Calendar, title: 'Automatisation RDV & Tâches', desc: 'Libérez 10h par semaine. RDV, rappels, tâches automatiques.' },
    { icon: Calculator, title: 'Calculateur Éligibilité & Devis', desc: 'Pré-qualifiez et générez des devis en 30 secondes.' },
    { icon: Building, title: 'Visualiseur 3D Architecture', desc: 'Plans en visites virtuelles époustouflantes.' },
    { icon: Video, title: 'Vidéos Marketing IA 4K', desc: 'Pubs virales sans équipe vidéo. Technologies Veo.' },
    { icon: RefreshCw, title: 'Simulation Avant/Après', desc: 'Simulations photo-réalistes. +40% de conversions.' },
    { icon: Smartphone, title: 'Agent WhatsApp B2B', desc: 'Commandes WhatsApp → Bon de commande fournisseur.' },
    { icon: Target, title: 'Génération Leads Ads', desc: 'Leads qualifiés via Meta, TikTok, Google Ads.' },
    { icon: BarChart3, title: 'Analyse Data & IA', desc: 'Analyse poussée de vos données. Amélioration continue.' },
];

export default function ServicesSection() {
    return (
        <section id="services" className="w-full px-6 py-32 md:px-12 bg-[radial-gradient(ellipse_at_top,_rgba(251,146,60,0.18),_transparent_60%)] text-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-orange-300">
                        Nos Solutions IA
                    </span>
                    <h2 className="text-4xl md:text-6xl font-bold mt-6 mb-6">
                        14 Solutions Pour{' '}
                        <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                            Automatiser & Développer
                        </span>
                    </h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        Solutions clé en main, déployées en 2-4 semaines, pour transformer votre activité.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {solutions.map((solution) => {
                        const Icon = solution.icon;
                        return (
                            <div
                                key={solution.title}
                                className="group h-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-white/10"
                            >
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
                                        <Icon className="h-6 w-6 text-orange-300" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{solution.title}</h3>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">{solution.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
