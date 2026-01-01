'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Chatbot from '@/components/Chatbot';
import Typewriter from '@/components/Typewriter';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
    }
  }, []);

  // Scroll to top on page load/refresh
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '') {
      window.scrollTo(0, 0);
    }
  }, []);

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stats counter animation
  useEffect(() => {
    const animateCounters = () => {
      const counters = document.querySelectorAll('.stat-number');
      counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute('data-target') || '0');
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
          current += step;
          if (current < target) {
            counter.textContent = Math.floor(current).toString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toString();
          }
        };
        updateCounter();
      });
    };

    const timer = setTimeout(animateCounters, 500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible-el');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.hidden-el').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container navbar">
          <a href="#" className="logo">Nova<span className="text-gradient">Solutions</span></a>
          <nav>
            <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
              <li><a href="#agents" onClick={() => setMobileMenuOpen(false)}>Nos Agents</a></li>
              <li><a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a></li>
              <li><a href="#about" onClick={() => setMobileMenuOpen(false)}>À propos</a></li>
              <li><a href="#contact" className="btn btn-outline nav-btn" onClick={() => setMobileMenuOpen(false)}>Contact</a></li>
              <li>
                {isLoggedIn ? (
                  <Link href="/dashboard" className="btn btn-primary nav-btn" onClick={() => setMobileMenuOpen(false)}>Mon Dashboard</Link>
                ) : (
                  <Link href="/login" className="btn btn-primary nav-btn" onClick={() => setMobileMenuOpen(false)}>Se Connecter</Link>
                )}
              </li>
            </ul>
          </nav>
          <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <span className="badge">🚀 Déjà 47+ entreprises accompagnées</span>
          <h1 className="hero-title">L&apos;IA au service de votre <br /><Typewriter text="Croissance" className="text-gradient" /></h1>

          {/* AIVoiceAgent Promo Banner */}
          <a
            href="https://aivoicedemo.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="voice-agent-promo"
          >
            <div className="promo-glow"></div>
            <div className="promo-content">
              <div className="promo-icon-wrapper">
                <span className="promo-icon">📞</span>
                <span className="promo-pulse"></span>
              </div>
              <div className="promo-text">
                <span className="promo-badge">🔥 Notre Best-Seller</span>
                <p className="promo-title">
                  <strong>Assistante Vocale IA 24h/7</strong> — Une voix chaleureuse qui ne dort jamais
                </p>
                <p className="promo-features">
                  <span className="highlight">Déployée sur votre numéro en quelques minutes</span> • Aucune configuration de votre part • On s'occupe de tout
                </p>
              </div>
              <span className="promo-cta">
                Essayer la Démo <span className="arrow">→</span>
              </span>
            </div>
          </a>

          <p className="hero-subtitle">Transformez vos opérations avec des automatisations intelligentes. Nous construisons le futur de votre entreprise, aujourd&apos;hui.</p>
          <div className="hero-btns">
            <a href="#contact" className="btn btn-primary">Démarrer le Projet</a>
            <a href="#agents" className="btn btn-outline">Voir nos Agents IA</a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stat-item">
            <span className="stat-number" data-target="47">0</span>
            <span className="stat-label">Entreprises Accompagnées</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" data-target="12500">0</span>
            <span className="stat-label">Heures Économisées</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" data-target="98">0</span>
            <span className="stat-label">% Satisfaction Client</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" data-target="300">0</span>
            <span className="stat-label">% ROI Moyen</span>
          </div>
        </div>
      </section>

      {/* Services IA Section */}
      <section id="agents" className="section-padding">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-subtitle">Nos Solutions IA</span>
            <h2 className="section-title">Automatisez & <span className="text-gradient">Développez</span></h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>14 solutions clé en main, déployées en 2-4 semaines, pour transformer votre activité.</p>
          </div>

          <div className="agents-grid">
            {[
              { icon: '👥', title: 'CV Profiler', desc: 'Recrutez 3x plus vite. L\'IA analyse, trie et matche vos CVs.' },
              { icon: '📞', title: 'Agent Téléphonique IA 24/7', desc: 'Réceptionniste IA qui qualifie et prend des RDV. Dupliquez votre voix.' },
              { icon: '💬', title: 'Chatbot IA Multi-Canal', desc: 'Sur votre site, Instagram, WhatsApp ou Messenger. 24h/24.' },
              { icon: '📋', title: 'Qualification de Dossiers IA', desc: 'Qualifiez les dossiers avant la première visite. Vérification d\'éligibilité.' },
              { icon: '📧', title: 'Emailing IA Personnalisé', desc: 'Emails hyper-personnalisés qui convertissent vraiment.' },
              { icon: '🌐', title: 'Site Web Premium', desc: '1ère page Google. SEO optimisé, espace client, e-commerce.' },
              { icon: '📅', title: 'Automatisation RDV & Tâches', desc: 'Libérez 10h par semaine. RDV, rappels, tâches automatiques.' },
              { icon: '💰', title: 'Calculateur Éligibilité & Devis', desc: 'Pré-qualifiez et générez des devis en 30 secondes.' },
              { icon: '🏠', title: 'Visualiseur 3D Architecture', desc: 'Plans en visites virtuelles époustouflantes.' },
              { icon: '🎬', title: 'Vidéos Marketing IA 4K', desc: 'Pubs virales sans équipe vidéo. Technologies Veo.' },
              { icon: '🔄', title: 'Simulation Avant/Après', desc: 'Simulations photo-réalistes. +40% de conversions.' },
              { icon: '📱', title: 'Agent WhatsApp B2B', desc: 'Commandes WhatsApp → Bon de commande fournisseur.' },
              { icon: '🎯', title: 'Génération Leads Ads', desc: 'Leads qualifiés via Meta, TikTok, Google Ads.' },
              { icon: '📊', title: 'Analyse Data & IA', desc: 'Analyse poussée de vos données. Amélioration continue.' },
            ].map((agent, i) => (
              <div key={i} className="agent-card hidden-el">
                <div className="agent-icon">{agent.icon}</div>
                <h3>{agent.title}</h3>
                <p className="agent-desc">{agent.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <a href="#contact" className="btn btn-primary" style={{ fontSize: '18px', padding: '16px 32px' }}>
              🚀 Débloquer ces solutions
            </a>
            <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '14px' }}>Réservez un appel stratégique gratuit de 15 minutes</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-subtitle">Notre Approche</span>
            <h2 className="section-title">Comment nous <span className="text-gradient">travaillons</span></h2>
          </div>

          <div className="cards-grid">
            {[
              { icon: '🔍', title: '1. Audit Gratuit', desc: 'Nous analysons vos processus actuels et identifions les opportunités d\'automatisation à fort ROI.' },
              { icon: '⚙️', title: '2. Déploiement Rapide', desc: 'En 2-4 semaines, votre agent IA est opérationnel et intégré à vos outils existants.' },
              { icon: '📈', title: '3. Optimisation Continue', desc: 'Nous mesurons les résultats et améliorons l\'IA en continu pour maximiser votre ROI.' },
            ].map((service, i) => (
              <div key={i} className="card hidden-el">
                <div className="card-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-subtitle">Témoignages</span>
            <h2 className="section-title">Ils nous font <span className="text-gradient">confiance</span></h2>
          </div>

          <div className="testimonials-grid">
            {[
              { text: '"Nos no-shows ont chuté de 70%. L\'IA filtre parfaitement les vrais patients. Je recommande à 100%."', name: 'Dr. Martin', company: 'Cabinet Dentaire Lyon' },
              { text: '"Je ne rate plus un seul appel même quand je suis sous une baignoire. Un investissement rentabilisé en 1 mois."', name: 'Jean-Pierre R.', company: 'Plombier Indépendant' },
              { text: '"40% de temps gagné. Mes agents se concentrent sur les visites, pas les questions basiques."', name: 'Sophie L.', company: 'Agence Immobilière Paris' },
            ].map((testimonial, i) => (
              <div key={i} className="testimonial-card hidden-el">
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.company}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container about-grid">
          <div className="about-img"></div>
          <div className="about-content">
            <span className="section-subtitle">À Propos de NovaSolutions</span>
            <h2 className="section-title">L&apos;Intelligence <br />au service de l&apos;Humain</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Chez NovaSolutions, nous croyons que la technologie ne doit pas remplacer l&apos;humain, mais l&apos;augmenter. Notre mission est de démocratiser l&apos;accès aux outils d&apos;IA les plus puissants pour les entreprises ambitieuses.
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Une approche ouverte, transparente et résolument tournée vers l&apos;avenir.
            </p>
            <a href="#contact" className="btn btn-primary">Discutons de votre projet</a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding">
        <div className="container">
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
            <h2 className="section-title" style={{ textAlign: 'center', fontSize: '2.5rem' }}>Parlons de votre <span className="text-gradient">Projet</span></h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Remplissez ce formulaire pour une consultation gratuite.</p>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div>
              <h3 className="logo">Nova<span className="text-gradient">Solutions</span></h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '300px', fontSize: '0.9rem', marginTop: '1rem' }}>
                Agence d&apos;intelligence artificielle et d&apos;automatisation.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '3rem' }}>
              <ul style={{ color: 'var(--text-muted)', lineHeight: 2 }}>
                <li style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>Menu</li>
                <li><a href="#agents">Nos Agents</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
              <ul style={{ color: 'var(--text-muted)', lineHeight: 2 }}>
                <li style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>Légal</li>
                <li><a href="#">Confidentialité</a></li>
                <li><a href="#">Mentions Légales</a></li>
              </ul>
            </div>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid #222', paddingTop: '2rem' }}>
            © 2025 NovaSolutions. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </>
  );
}

// Contact Form Component
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input type="text" name="nom" placeholder="Nom Complet" required style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '1rem', color: 'white', borderRadius: '8px' }} />
      <input type="email" name="email" placeholder="Email Professionnel" required style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '1rem', color: 'white', borderRadius: '8px' }} />
      <textarea name="message" placeholder="Votre Message" rows={4} required style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '1rem', color: 'white', borderRadius: '8px' }}></textarea>
      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={status === 'sending'}>
        {status === 'sending' ? 'Envoi...' : status === 'sent' ? '✓ Envoyé !' : 'Envoyer'}
      </button>
    </form>
  );
}
