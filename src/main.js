import './style.css'

console.log('NovaSolutions Loaded');

// --- Interactions Header ---
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// --- Mobile Menu ---
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });
}


// --- Scroll Animations ---
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible-el');
        }
    });
}, observerOptions);

// Target all major sections and cards
document.querySelectorAll('section, .card, .section-title-wrap, .hero-content > *').forEach(el => {
    el.classList.add('hidden-el');
    observer.observe(el);
});

// --- Mouse Glow Effect on Hero ---
const hero = document.querySelector('.hero');
const heroBg = document.querySelector('.hero-bg');

document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    // Move the background slightly based on mouse position
    heroBg.style.transform = `translate(-${x * 20}px, -${y * 20}px)`;
});

