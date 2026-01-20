'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Advantages from '@/components/Advantages';
import dynamic from 'next/dynamic';

// Dynamic import for Chatbot to avoid SSR issues
const Chatbot = dynamic(() => import('@/components/Chatbot'), { ssr: false });

import {
  ArrowRight,
  BarChart3,
  Building,
  Calendar,
  Calculator,
  Clipboard,
  FileText,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Smartphone,
  Target,
  Video,
  AlertCircle,
  Clock,
  TrendingDown,
  CheckCircle,
  Zap,
  Users,
  Check,
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

const problems = [
  {
    icon: Clock,
    title: 'Vous perdez des clients car vous ne répondez pas assez vite?',
    description: 'Pendant que vous dormez, vos concurrents capturent VOS clients. Chaque appel manqué = 500€ minimum de CA perdu.',
    stat: '67% des clients contactent un concurrent si pas de réponse en 5 minutes'
  },
  {
    icon: TrendingDown,
    title: 'Vos équipes passent 60% de leur temps sur des tâches répétitives?',
    description: 'Répondre aux mêmes questions, saisir des données, qualifier des leads... Vos talents gaspillent leur potentiel.',
    stat: '15h/semaine perdues par employé sur des tâches automatisables'
  },
  {
    icon: AlertCircle,
    title: 'Vos concurrents utilisent déjà l\'IA pendant que vous réfléchissez?',
    description: 'Ils servent plus de clients, avec moins d\'équipe, en facturant plus cher. L\'écart se creuse chaque jour.',
    stat: '43% de vos concurrents ont déjà adopté l\'IA en 2025'
  }
];

const transformationSteps = [
  {
    phase: 'Semaine 1',
    title: 'Quick Win',
    description: 'Premiers résultats visibles. Votre agent IA répond aux premières demandes.',
    metrics: ['Premier lead qualifié', 'Temps de réponse divisé par 10', 'Équipe libérée'],
    color: 'from-orange-400 to-orange-500'
  },
  {
    phase: 'Mois 1-3',
    title: 'Compound',
    description: 'Optimisation continue. L\'IA apprend de chaque interaction et s\'améliore.',
    metrics: ['30% de productivité en plus', 'ROI positif', 'Processus optimisés'],
    color: 'from-orange-500 to-orange-600'
  },
  {
    phase: 'Mois 3-6',
    title: 'Advantage',
    description: 'Avantage compétitif établi. Vous servez plus de clients que vos concurrents.',
    metrics: ['2x plus de leads', 'Service 24/7', 'Satisfaction client +40%'],
    color: 'from-orange-600 to-red-500'
  },
  {
    phase: 'Mois 6+',
    title: '10x',
    description: 'Transformation complète. Votre business tourne pendant que vous dormez.',
    metrics: ['Croissance exponentielle', 'Équipe concentrée sur valeur', 'Leadership du marché'],
    color: 'from-red-500 to-red-600'
  }
];

const valueStack = [
  { item: 'Développement agents IA sur-mesure', value: '50 000€', included: true },
  { item: 'Intégration à vos outils existants', value: '15 000€', included: true },
  { item: 'Formation complète de vos équipes', value: '8 000€', included: true },
  { item: 'Support prioritaire 24/7 (1 an)', value: '12 000€', included: true },
  { item: 'Optimisations et mises à jour', value: '6 000€', included: true },
];

export default function Home() {
  // Force scroll to top on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Remove any hash from URL
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      // Force scroll to top immediately
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Enable smooth scrolling after page has loaded
      setTimeout(() => {
        document.documentElement.classList.add('loaded');
      }, 100);
    }
  }, []);

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

  const totalValue = valueStack.reduce((sum, item) => sum + parseInt(item.value.replace(/[€\s]/g, '')), 0);

  return (
    <>
      <main className="min-h-screen bg-[rgb(30,30,30)]">
        <Header />

        {/* 1. HERO SECTION */}
        <Hero />

        {/* 2. ADVANTAGES */}
        <Advantages />

        {/* 3. PROBLEM-AGITATE SECTION */}
        <section className="w-full py-32 px-12 bg-[rgb(20,20,22)] text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[150px]" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">La Vérité</span>
              <h2 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                Ces <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">problèmes</span> vous coûtent cher
              </h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Pendant que vous hésitez, vos concurrents automatisent et vous dépassent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {problems.map((problem, i) => {
                const Icon = problem.icon;
                return (
                  <div key={i} className="bg-white/5 border border-red-500/20 rounded-3xl p-8 backdrop-blur-sm hover:border-red-500/40 transition-all">
                    <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl mb-6">
                      <Icon className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{problem.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{problem.description}</p>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <p className="text-red-300 text-sm font-semibold">{problem.stat}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">
                Mais il y a une <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">solution</span>...
              </p>
            </div>
          </div>
        </section>

        {/* 4. SERVICES/SOLUTIONS SECTION */}
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

        {/* 5. PRICING / VALUE STACK */}
        <section className="w-full py-32 px-6 md:px-12 bg-[rgb(30,30,30)] relative">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-[#0F0F10] border border-white/10 rounded-[40px] p-8 md:p-16 overflow-hidden">
              {/* Background Effect */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 blur-[100px] rounded-full pointer-events-none"></div>

              <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                <div className="lg:w-1/2">
                  <h2 className="text-4xl font-bold mb-8">L'offre <span className="text-orange-500">Ultime</span></h2>
                  <div className="space-y-6">
                    {valueStack.map((item, i) => (
                      <div key={i} className="flex items-center justify-between pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          </div>
                          <span className="text-gray-300">{item.item}</span>
                        </div>
                        <span className="text-gray-500 line-through text-sm">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 font-mono text-sm text-orange-400">
                      <span>VALEUR TOTALE</span>
                      <span>{totalValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}€</span>
                    </div>
                  </div>
                </div>

                <div className="lg:w-1/2 flex flex-col justify-center">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>

                    <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">Investissement Annuel</p>
                    <div className="text-6xl font-bold text-white mb-2">12k€</div>
                    <p className="text-gray-500 mb-8 text-sm">soit 1 000€ / mois</p>

                    <a href="#contact" className="block w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-orange-500 hover:text-white transition-all duration-300">
                      Démarrer maintenant
                    </a>

                    <p className="mt-6 text-xs text-gray-500">
                      Garantie de satisfaction 30 jours.
                      Places limitées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. TESTIMONIALS SECTION */}
        <section className="w-full py-32 px-12 bg-white/5 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-orange-500 uppercase tracking-wider text-sm font-semibold">Témoignages</span>
              <h2 className="text-5xl md:text-6xl font-bold mt-4">
                Ils nous font <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">confiance</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  text: '"Nos no-shows ont chuté de 70%. L\'IA filtre parfaitement les vrais patients. Je recommande à 100%."',
                  name: 'Dr. Martin',
                  company: 'Cabinet Dentaire Lyon',
                  result: '-70% no-shows'
                },
                {
                  text: '"Je ne rate plus un seul appel même quand je suis sous une baignoire. Un investissement rentabilisé en 1 mois."',
                  name: 'Jean-Pierre R.',
                  company: 'Plombier Indépendant',
                  result: 'ROI en 30 jours'
                },
                {
                  text: '"40% de temps gagné. Mes agents se concentrent sur les visites, pas les questions basiques."',
                  name: 'Sophie L.',
                  company: 'Agence Immobilière Paris',
                  result: '+40% productivité'
                },
              ].map((testimonial, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative hover:border-orange-500/30 transition-all">
                  <div className="absolute top-6 right-6 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1">
                    <span className="text-orange-300 text-xs font-bold">{testimonial.result}</span>
                  </div>
                  <div className="text-6xl text-orange-500 opacity-20 font-serif mb-4">"</div>
                  <p className="text-white italic mb-6 relative z-10">{testimonial.text}</p>
                  <div>
                    <strong className="text-white">{testimonial.name}</strong>
                    <p className="text-gray-400 text-sm">{testimonial.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. TRANSFORMATION SECTION */}
        <section className="w-full py-32 px-12 bg-[rgb(30,30,30)] text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <span className="text-orange-500 uppercase tracking-wider text-sm font-semibold">Votre Roadmap</span>
              <h2 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                De 0 à <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">10x</span> en 6 mois
              </h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Voici exactement ce qui va se passer après votre décision aujourd'hui
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {transformationSteps.map((step, i) => (
                <div key={i} className="relative">
                  {i < transformationSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-orange-500/50 to-transparent" />
                  )}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-all h-full">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} text-white font-bold text-lg mb-4`}>
                      {i + 1}
                    </div>
                    <div className="text-orange-400 text-sm font-semibold mb-2">{step.phase}</div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{step.description}</p>
                    <ul className="space-y-2">
                      {step.metrics.map((metric, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                          <Zap className="w-4 h-4 text-orange-500" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. CONTACT SECTION - CONVERTING & WELCOMING */}
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

        {/* 10. FOOTER */}
        <Footer />

        {/* Chatbot */}
        <Chatbot />
      </main>
    </>
  );
}


