import './style.css'

console.log('NovaSolutions Loaded ✨');

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
    threshold: 0.05, // Trigger earlier
    rootMargin: "50px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible-el');
        }
    });
}, observerOptions);

document.querySelectorAll('section, .card, .section-title-wrap, .hero-content > *').forEach(el => {
    el.classList.add('hidden-el');
    observer.observe(el);
});

// ============================================
// 4. TYPING EFFECT ON HERO TITLE (KEPT)
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
                setTimeout(typeWriter, 80); // Faster typing
            } else {
                spanElement.classList.add('typed');
            }
        };
        setTimeout(typeWriter, 800);
    }
}

// ============================================
// 5. FORM SUBMISSION TO GOOGLE SHEETS
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

console.log('Site ready! 🚀');
