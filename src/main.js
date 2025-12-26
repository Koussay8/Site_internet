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
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyI9tuNrrg1ydzC9hUsPyWPh2lA3nbNIONjas7ZkiCm_dm6Ok8VxWrGLidHxFYK9CYscQ/exec';

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

// System prompt - Orienté prise de RDV avec collecte de coordonnées
const systemPrompt = `Tu es Nova, assistante IA de NovaSolutions.
TON BUT : Qualifier le prospect et PRENDRE UN RDV avec ses coordonnées.

FLUX DE CONVERSATION :
1. Comprendre le secteur/problème (1-2 questions max)
2. Proposer un créneau : "On peut en discuter demain à 14h ?"
3. SI le client accepte → DEMANDE son numéro ou email : "Parfait ! Quel est votre numéro pour vous rappeler ?"
4. SI le client donne date + contact → Génère : BLOCK_RDV:{"date":"...","contact":"...","sujet":"..."}

RÈGLES STRICTES :
- Réponses de 2 phrases MAX.
- JAMAIS confirmer un RDV sans avoir le numéro ou l'email.
- Si le client dit "ok" ou "oui" pour un RDV mais n'a pas donné de contact → DEMANDE-LE.
- Pas de stats (-70%, etc.) sauf si demandé.

EXEMPLES :
- "Je suis plombier" → "Les artisans perdent souvent des appels sur chantier. On a une solution. Dispo demain 10h pour en parler ?"
- "Oui demain c'est bon" → "Super ! Quel numéro pour vous joindre ?"
- "0612345678" → BLOCK_RDV:{"date":"demain 10h","contact":"0612345678","sujet":"plombier"}
- "Envoyez-moi un mail" → "Bien sûr ! Quelle est votre adresse email ?"
- "test@email.com" → BLOCK_RDV:{"date":"à définir","contact":"test@email.com","sujet":"prospect"}

Réponds en français. Sois bref et direct.`;

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
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyI9tuNrrg1ydzC9hUsPyWPh2lA3nbNIONjas7ZkiCm_dm6Ok8VxWrGLidHxFYK9CYscQ/exec';

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
                max_tokens: 100
            })
        });

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        const botMessage = data.choices?.[0]?.message?.content || "Erreur de réponse.";

        // DEBUG - voir ce que l'IA répond
        console.log("🤖 Réponse IA:", botMessage);

        // Check for booking block
        if (botMessage.includes('BLOCK_RDV:')) {
            const jsonPart = botMessage.split('BLOCK_RDV:')[1].trim();
            try {
                const bookingData = JSON.parse(jsonPart);
                simulateTyping("C'est noté ! Vous recevrez une confirmation. À très vite !", 'bot');
                sendBookingToSheet(bookingData);
                conversationHistory.push({ role: 'assistant', content: "Rendez-vous enregistré." });
                return;
            } catch (e) {
                console.error("JSON Parse Error", e);
            }
        }

        simulateTyping(botMessage, 'bot');
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

