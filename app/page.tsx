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

        {/* 5. VALUE STACK SECTION */}
        <section className="w-full py-32 px-12 bg-[rgb(30,30,30)] text-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-orange-500 uppercase tracking-wider text-sm font-semibold">Investissement</span>
              <h2 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                Une valeur de <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">{totalValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}€</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Tout ce dont vous avez besoin pour transformer votre business avec l'IA
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-sm">
              <div className="space-y-6 mb-8">
                {valueStack.map((item, i) => (
                  <div key={i} className="flex items-center justify-between pb-6 border-b border-white/10 last:border-0">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                      <span className="text-white font-medium">{item.item}</span>
                    </div>
                    <span className="text-gray-400 font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-orange-500/30 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-white">Valeur totale:</span>
                  <span className="text-2xl font-bold text-gray-400 line-through">{totalValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}€</span>
                </div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-2xl font-bold text-white">Votre investissement:</span>
                  <span className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    12 000€<span className="text-2xl">/an</span>
                  </span>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6 text-center">
                  <p className="text-orange-300 font-semibold text-lg">
                    Soit seulement 1 000€/mois pour une solution complète qui génère un ROI de 3-5x
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-500 italic">
                La vraie question n'est pas "Puis-je me le permettre?" mais "Puis-je me permettre de ne PAS le faire?"
              </p>
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

        {/* 8. SECONDARY CTA */}
        <section className="w-full py-24 px-12 bg-gradient-to-b from-[rgb(30,30,30)] to-[rgb(20,20,22)] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8 -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-4 border-[rgb(30,30,30)] flex items-center justify-center"
                >
                  <Users className="w-8 h-8 text-white" />
                </div>
              ))}
            </div>
            <div className="inline-block bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-orange-300 text-sm font-semibold">+150 entreprises nous font confiance</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à rejoindre les entreprises qui ont<br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                transformé leur business avec l'IA?
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Chaque jour qui passe est un jour de retard sur vos concurrents.
              Prenez votre décision maintenant.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full font-bold text-white text-xl hover:scale-105 transition-transform shadow-2xl shadow-orange-500/50"
            >
              Oui, je veux transformer mon business
              <ArrowRight className="w-6 h-6" />
            </a>
            <p className="text-gray-500 mt-6 text-sm">
              Consultation stratégique gratuite de 15 minutes · Sans engagement
            </p>
          </div>
        </section>

        {/* 9. CONTACT SECTION */}
        <section id="contact" className="w-full py-32 px-12 bg-[rgb(30,30,30)]">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-sm">
              <h2 className="text-5xl font-bold text-center mb-4 text-white">
                Parlons de votre <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Projet</span>
              </h2>
              <p className="text-center text-gray-400 mb-10">Remplissez ce formulaire pour une consultation gratuite.</p>

              <ContactForm />
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

// Contact Form Component with Backend Integration
function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('nom'),
          email: formData.get('email'),
          message: formData.get('message'),
        }),
      });
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <input
        type="text"
        name="nom"
        placeholder="Nom Complet"
        required
        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
      />
      <input
        type="email"
        name="email"
        placeholder="Email Professionnel"
        required
        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
      />
      <textarea
        name="message"
        placeholder="Votre Message"
        rows={6}
        required
        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
      ></textarea>
      <button
        type="submit"
        className="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full font-semibold text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Envoi...' : status === 'sent' ? '✓ Envoyé !' : 'Envoyer'}
      </button>
      {status === 'error' && (
        <p className="text-red-400 text-center text-sm">Une erreur s'est produite. Veuillez réessayer.</p>
      )}
    </form>
  );
}
