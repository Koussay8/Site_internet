import './style.css'
import knowledgeBase from './knowledge-base.json'

console.log('NovaSolutions Loaded ✨');

// ============================================
// 0. SCROLL TO TOP ON REFRESH
// ============================================
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// ============================================
// 1. HEADER SCROLL EFFECT
// ============================================
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ============================================
// 2. MOBILE MENU
// ============================================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });
}

// ============================================
// 3. FAST SCROLL REVEAL ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.05,
    rootMargin: "50px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible-el');
        }
    });
}, observerOptions);

document.querySelectorAll('section, .card, .agent-card, .testimonial-card, .section-title-wrap, .hero-content > *').forEach(el => {
    el.classList.add('hidden-el');
    observer.observe(el);
});

// ============================================
// 4. TYPING EFFECT ON HERO TITLE
// ============================================
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const textToType = "Croissance";
    const spanElement = heroTitle.querySelector('.text-gradient');

    if (spanElement) {
        spanElement.textContent = '';
        let i = 0;
        const typeWriter = () => {
            if (i < textToType.length) {
                spanElement.textContent += textToType.charAt(i);
                i++;
                setTimeout(typeWriter, 80);
            } else {
                spanElement.classList.add('typed');
            }
        };
        setTimeout(typeWriter, 800);
    }
}

// ============================================
// 5. ANIMATED COUNTER FOR STATS
// ============================================
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
                // Add suffix for percentage
                if (counter.closest('.stat-item').querySelector('.stat-label').textContent.includes('%')) {
                    counter.textContent = target + '%';
                }
            }
        };
        updateCounter();
    });
}

// Trigger counter animation when stats section is visible
const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateCounters();
            statsObserver.disconnect();
        }
    }, { threshold: 0.5 });
    statsObserver.observe(statsSection);
}

// ============================================
// 6. FORM SUBMISSION TO GOOGLE SHEETS
// ============================================
const contactForm = document.querySelector('#contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Envoi en cours...';
        submitBtn.disabled = true;

        try {
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwH_W_qlGXxsuCsqLnDq68WueHQOP4cCYEbz6f8n-nx6snKs0bTZaE6e8nppFSXuUSA/exec';

            await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'text/plain' }
            });

            submitBtn.textContent = '✓ Envoyé !';
            contactForm.reset();

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 3000);

        } catch (error) {
            submitBtn.textContent = 'Erreur - Réessayer';
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// ============================================
// 7. CHATBOT WITH GROQ API (LLAMA3)
// ============================================
// API key from .env file (VITE_GROQ_API_KEY)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');

let conversationHistory = [];

// System prompt - flexible and can handle any question
const systemPrompt = `Tu es l'assistant commercial de NovaSolutions, une agence spécialisée en automatisation IA pour les entreprises.

CONTEXTE ENTREPRISE:
- Nom: NovaSolutions
- Clients aidés: 47+ entreprises
- Taux de satisfaction: 98%
- ROI moyen: 300%
- Délai de mise en place: 2-4 semaines

NOS 8 PRODUITS (avec résultats clients réels):
1. Agent de Qualification & RDV 24/7 - Pour Santé/Immobilier/Services - Résultat: -70% no-shows (cabinet dentaire Lyon)
2. Assistant Vocal Mains Libres - Pour Artisans/Couvreurs/Plombiers - Un chantier sauvé = rentabilisé
3. Calculateur Éligibilité & Devis IA - Pour Solaire/Rénovation - Coût lead: 45€→18€
4. Agent WhatsApp Commande B2B - Pour Grossistes/Logistique - 3h/jour économisées
5. Assistant Immo/Locataire IA - Pour Agences/Syndics - +40% temps gagné
6. Générateur Contenu & SEO Local - Pour Avocats/Notaires/Instituts - +180% trafic en 4 mois
7. Module Simulation Immersive IA - Pour Paysagistes/Piscinistes - +35% conversion devis
8. Prospecteur Automatisé B2B - Pour Nettoyage/BTP - 12 contrats en 3 mois

COMMENT RÉPONDRE:
- Sois chaleureux, professionnel et concis (2-4 phrases max)
- Si le visiteur décrit son activité ou problème → recommande LE produit le plus adapté avec une stat réelle
- Si le visiteur pose une question générale → réponds de manière utile et oriente vers nos solutions
- Si le visiteur demande quelque chose hors sujet → redirige poliment vers nos services
- Cite toujours un résultat client réel pour crédibilité
- Propose un appel gratuit si le prospect semble intéressé
- Réponds TOUJOURS en français`;

// Toggle chatbot
if (chatbotToggle) {
    chatbotToggle.addEventListener('click', () => {
        chatbotToggle.classList.toggle('active');
        chatbotContainer.classList.toggle('chatbot-hidden');

        // Send welcome message on first open
        if (!chatbotContainer.classList.contains('chatbot-hidden') && chatbotMessages.children.length === 0) {
            addMessage("Bonjour ! 👋 Je suis l'assistant NovaSolutions. Dites-moi votre secteur d'activité ou votre problème actuel, et je vous proposerai la solution IA idéale.", 'bot');
        }
    });
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = text;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Show typing indicator
function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    typingDiv.id = 'typing-indicator';
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

// Send message to Groq API
async function sendToGroq(userMessage) {
    conversationHistory.push({ role: 'user', content: userMessage });

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...conversationHistory
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Groq API Error Response:', errorData);
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0]) {
            throw new Error('Invalid API response');
        }

        const botMessage = data.choices[0].message.content;
        conversationHistory.push({ role: 'assistant', content: botMessage });
        return botMessage;

    } catch (error) {
        console.error('Groq API Error:', error);
        return `Je suis là pour vous aider ! En attendant, voici ce que nous proposons : automatisation des RDV, assistants vocaux, chatbots, et plus encore. Contactez-nous via le formulaire pour un audit gratuit ! 🚀`;
    }
}

// Handle send
async function handleSend() {
    const message = chatbotInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chatbotInput.value = '';

    showTyping();
    const response = await sendToGroq(message);
    removeTyping();

    addMessage(response, 'bot');
}

if (chatbotSend) {
    chatbotSend.addEventListener('click', handleSend);
}

if (chatbotInput) {
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}

console.log('Site ready with AI chatbot! 🚀');
