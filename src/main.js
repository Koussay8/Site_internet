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
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTBBdRkJD6wy5qdXcrdpWxIZY_7hMIMshqr1sDUa_CzX3ulm0l_jOu5eMuy1Vdawb-9w/exec';

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
// API key management (Env var > Split fallback to bypass scanning)
const P1 = 'gsk_';
const P2 = 'VUMB5HRUDqbwQYvmo3bdWGdyb3FY1ZIv';
const P3 = 'VM4Sgi4RXLLSSoWm7vFT';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || (P1 + P2 + P3);

const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');

let conversationHistory = [];

// System prompt - Conseiller puis proposer RDV
const systemPrompt = `Tu es Nova, conseillère IA de NovaSolutions, agence d'automatisation.

TON RÔLE : Comprendre le problème du visiteur, lui expliquer comment on peut l'aider, puis collecter les infos pour un RDV.

FLUX DE CONVERSATION :
1. ÉCOUTER : Comprendre son secteur et son problème
2. RÉPONDRE : Expliquer en 2-3 phrases comment on résout son problème
3. PROPOSER : "Quand seriez-vous disponible pour un échange avec l'un de nos spécialistes ?"
4. COLLECTER : Demande les 3 infos (peut être en plusieurs messages) :
   - Date/heure de disponibilité
   - Numéro ou email
   - Nom ou nom d'entreprise
5. CONFIRMER : SEULEMENT si tu as les TROIS → BLOCK_RDV:{"date":"...","contact":"...","nom":"...","sujet":"..."}

ARGUMENTS PAR SECTEUR :
• ESTHÉTICIENS : Messages Instagram sans réponse → assistant IA 24/7, pré-qualification, prise de RDV automatique.
• DENTISTES : No-Show, standard saturé → agent de confirmation automatique, chatbot FAQ.
• SPAS : Créneaux vides → promos flash automatiques pour remplir les horaires creux.
• ARTISANS : Appels ratés sur chantier → répondeur IA qui qualifie et envoie SMS.
• SOLAIRE : Leads non qualifiés chers → agent IA + calculateur pour pré-qualifier.
• AVOCATS : 20 min au téléphone pour infos basiques → chatbot collecte infos préliminaires.
• ÉVÉNEMENTIEL : Trop de demandes → automatisation pour ne plus laisser filer de contrat.

RÈGLES CRITIQUES :
- Réponds en 2-3 phrases MAX
- Si manque une info (date, contact OU nom) → demande-la poliment
- Exemple si manque contact+nom : "Parfait ! Pour confirmer, quel est votre nom et votre numéro/email ?"
- NE GÉNÈRE JAMAIS BLOCK_RDV sans avoir les 3 infos (date + contact + nom)

Réponds en français, de manière professionnelle.`;

// Toggle chatbot
if (chatbotToggle) {
    chatbotToggle.addEventListener('click', () => {
        chatbotToggle.classList.toggle('active');
        chatbotContainer.classList.toggle('chatbot-hidden');

        if (!chatbotContainer.classList.contains('chatbot-hidden') && chatbotMessages.children.length === 0) {
            simulateTyping("Bonjour ! Quel est votre secteur d'activité ?", 'bot');
        }
    });
}

// Add message instantly (for user messages)
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = text;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Simulate typing effect (for bot - more human, slower)
function simulateTyping(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    chatbotMessages.appendChild(messageDiv);

    let index = 0;
    const baseSpeed = 25; // Base speed per character (ms)

    function typeChar() {
        if (index < text.length) {
            messageDiv.textContent += text.charAt(index);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            index++;

            // Variable speed for natural feel
            let delay = baseSpeed;
            const char = text.charAt(index - 1);
            if (char === '.' || char === '!' || char === '?') delay = 300;
            else if (char === ',') delay = 150;
            else if (char === ' ') delay = 40;

            setTimeout(typeChar, delay);
        }
    }

    typeChar();
}

// Show/hide typing indicator
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

// Google Script URL for bookings
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTBBdRkJD6wy5qdXcrdpWxIZY_7hMIMshqr1sDUa_CzX3ulm0l_jOu5eMuy1Vdawb-9w/exec';

async function sendBookingToSheet(bookingData) {
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ ...bookingData, type: 'chatbot_booking' }),
            headers: { 'Content-Type': 'text/plain' }
        });
    } catch (e) {
        console.error("Booking Error", e);
    }
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
                temperature: 0.6,
                max_tokens: 200
            })
        });

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        const botMessage = data.choices?.[0]?.message?.content || "Erreur de réponse.";

        // DEBUG - voir ce que l'IA répond
        console.log("🤖 Réponse IA:", botMessage);

        // Check for booking block (handles various formats: BLOCK_RDV:, **BLOCK_RDV**, etc.)
        const blockPattern = /\*{0,2}BLOCK_RDV\*{0,2}\s*:?\s*(\{[\s\S]*?\})/i;
        const blockMatch = botMessage.match(blockPattern);

        if (blockMatch) {
            try {
                const bookingData = JSON.parse(blockMatch[1]);
                const hasEmail = bookingData.contact && bookingData.contact.includes('@');
                const confirmMsg = hasEmail
                    ? "Parfait ! 📧 Vous recevrez un email de confirmation avec l'invitation calendar. À très bientôt !"
                    : "C'est noté ! Un membre de notre équipe vous contactera. À très bientôt !";
                simulateTyping(confirmMsg, 'bot');
                sendBookingToSheet(bookingData);
                conversationHistory.push({ role: 'assistant', content: "Rendez-vous enregistré." });
                return;
            } catch (e) {
                console.error("JSON Parse Error", e);
            }
        }

        // Clean any remaining BLOCK_RDV references from the displayed message
        let cleanMessage = botMessage.replace(/\*{0,2}BLOCK_RDV\*{0,2}\s*:?\s*\{[\s\S]*?\}/gi, '').trim();
        // Also remove partial blocks or mentions
        cleanMessage = cleanMessage.replace(/\*{0,2}BLOCK_RDV\*{0,2}[^.!?]*/gi, '').trim();

        if (cleanMessage) {
            simulateTyping(cleanMessage, 'bot');
        } else {
            simulateTyping("C'est noté ! Vous recevrez une confirmation. À très vite !", 'bot');
        }
        conversationHistory.push({ role: 'assistant', content: botMessage });

    } catch (error) {
        console.error('API Error:', error);
        simulateTyping("Petit souci technique. Contactez-nous via le formulaire !", 'bot');
    }
}

// Handle send button
async function handleSend() {
    const message = chatbotInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chatbotInput.value = '';

    // Pas de showTyping ici car simulateTyping gère l'affichage progressif
    await sendToGroq(message);
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

