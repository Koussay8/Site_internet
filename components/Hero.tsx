"use client";

import { useEffect, useRef, useState, useMemo, memo } from "react";

// Animation de compteur
function useCountUp(
    end: number,
    duration: number = 2000,
    suffix: string = "",
    isActive: boolean = true,
    snapOnInactive: boolean = false
) {
    const [count, setCount] = useState(0);
    const lastRendered = useRef<number | null>(null);

    useEffect(() => {
        if (!isActive) {
            const nextValue = snapOnInactive ? end : 0;
            lastRendered.current = nextValue;
            setCount(nextValue);
            return;
        }

        let rafId = 0;
        const startTime = performance.now();
        const precision = suffix === "M" ? 1 : 0;
        lastRendered.current = null;
        setCount(0);

        const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = easeOutQuart * end;
            const rounded =
                precision === 0 ? Math.round(current) : Number(current.toFixed(precision));

            if (lastRendered.current !== rounded) {
                lastRendered.current = rounded;
                setCount(rounded);
            }

            if (progress < 1) {
                rafId = requestAnimationFrame(animate);
            }
        };

        rafId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(rafId);
    }, [duration, end, isActive, snapOnInactive, suffix]);

    if (suffix === "M") {
        return `$${count.toFixed(1)}M`;
    }
    if (suffix === "%") {
        return `${Math.round(count)}%`;
    }
    if (suffix === "/7") {
        return count >= 24 ? "24/7" : `${Math.round(count)}/7`;
    }
    return Math.round(count).toString();
}

function usePrefersReducedMotion() {
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updatePreference = () => setReducedMotion(mediaQuery.matches);

        updatePreference();
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", updatePreference);
        } else {
            mediaQuery.addListener(updatePreference);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener("change", updatePreference);
            } else {
                mediaQuery.removeListener(updatePreference);
            }
        };
    }, []);

    return reducedMotion;
}

const Hero = memo(function Hero() {
    const containerRef = useRef<HTMLElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(true); // Default to mobile to avoid iframe flash
    const prefersReducedMotion = usePrefersReducedMotion();
    const shouldAnimate = isVisible && !prefersReducedMotion;

    // Detect mobile devices - disable heavy 3D iframe on mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Compteurs animés
    const count1 = useCountUp(2.7, 2000, "M", shouldAnimate, prefersReducedMotion);
    const count2 = useCountUp(54, 2000, "%", shouldAnimate, prefersReducedMotion);
    const count3 = useCountUp(70, 2000, "%", shouldAnimate, prefersReducedMotion);
    const count4 = useCountUp(25, 2000, "%", shouldAnimate, prefersReducedMotion);
    const count5 = useCountUp(24, 2000, "/7", shouldAnimate, prefersReducedMotion);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    // Memoize animation styles to prevent unnecessary recalculations
    const fadeInStyle = useMemo(
        () => (delay: number) =>
            shouldAnimate ? { animation: `fadeIn 0.8s ease-out ${delay}s forwards` } : undefined,
        [shouldAnimate]
    );
    const fadeClass = prefersReducedMotion ? "opacity-100" : "opacity-0";

    return (
        <section ref={containerRef} className="relative min-h-screen w-full flex flex-col pt-24 px-6 md:px-12 bg-background text-white overflow-hidden">

            {/* Main Content */}
            <div className="w-full max-w-7xl mx-auto z-10">

                {/* Title Section */}
                <div className="mb-8 relative min-h-[400px]">

                    {/* Title - Left Side */}
                    <div className="relative z-20 max-w-2xl">
                        {/* Decorative Element */}
                        <div
                            className={`${fadeClass} absolute -left-4 top-0 w-1 h-24 bg-gradient-to-b from-accent to-transparent rounded-full`}
                            style={fadeInStyle(0.3)}
                        />

                        <h1
                            className={`${fadeClass} text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-[1.1] relative`}
                            style={fadeInStyle(0.2)}
                        >
                            <span className="relative inline-block">
                                Vextra Tech : Votre
                                <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-accent to-transparent animate-pulse" />
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                                Assistant Virtuel
                            </span>
                            <br />
                            <span className="relative">
                                de Choix
                                <span className="absolute -top-2 -right-8 text-accent text-2xl opacity-80">✦</span>
                            </span>
                        </h1>

                        <p
                            className={`${fadeClass} mt-6 text-gray-400 text-base md:text-lg max-w-md leading-relaxed`}
                            style={fadeInStyle(0.4)}
                        >
                            Transformez votre entreprise avec l'intelligence artificielle.
                            Des résultats mesurables, une disponibilité 24/7.
                        </p>
                    </div>

                    {/* 3D Embed in Background - Right Side - DISABLED on mobile for performance */}
                    {!isMobile && (
                        <div className="absolute right-0 top-0 w-[450px] h-[350px] z-0 hidden md:block opacity-60 mix-blend-screen">
                            <iframe
                                title="3D Spinning Cube"
                                src="https://v0-3-d-spinning-cube.vercel.app"
                                className="w-full h-full border-0 bg-transparent"
                                loading="lazy"
                                allow="fullscreen"
                            />
                        </div>
                    )}
                    {/* Mobile: Light gradient replacement */}
                    {isMobile && (
                        <div className="absolute right-0 top-0 w-[200px] h-[200px] z-0 opacity-40 bg-gradient-to-br from-orange-500/30 to-transparent rounded-full blur-3xl" />
                    )}

                </div>

                {/* Stats Grid - Glass Morphism Style */}
                <div className="backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-gray-800/50 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-orange-500/20 transition-shadow duration-500">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
                        <div
                            className={`stat-item ${fadeClass} flex flex-col gap-2 group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all duration-300`}
                            style={fadeInStyle(0.3)}
                        >
                            <span className="text-3xl lg:text-4xl font-heading font-bold text-accent group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                                {count1}
                            </span>
                            <span className="text-xs lg:text-sm text-gray-300 font-medium leading-tight">Valeur des activités</span>
                        </div>
                        <div
                            className={`stat-item ${fadeClass} flex flex-col gap-2 group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all duration-300`}
                            style={fadeInStyle(0.4)}
                        >
                            <span className="text-3xl lg:text-4xl font-heading font-bold text-blue-500 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                {count2}
                            </span>
                            <span className="text-xs lg:text-sm text-gray-300 font-medium leading-tight">Augmentation de productivité</span>
                        </div>
                        <div
                            className={`stat-item ${fadeClass} flex flex-col gap-2 group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all duration-300`}
                            style={fadeInStyle(0.5)}
                        >
                            <span className="text-3xl lg:text-4xl font-heading font-bold text-green-500 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                                {count3}
                            </span>
                            <span className="text-xs lg:text-sm text-gray-300 font-medium leading-tight">Amélioration de la précision</span>
                        </div>
                        <div
                            className={`stat-item ${fadeClass} flex flex-col gap-2 group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all duration-300`}
                            style={fadeInStyle(0.6)}
                        >
                            <span className="text-3xl lg:text-4xl font-heading font-bold text-purple-500 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                                {count4}
                            </span>
                            <span className="text-xs lg:text-sm text-gray-300 font-medium leading-tight">Économies réalisées</span>
                        </div>
                        <div
                            className={`stat-item ${fadeClass} flex flex-col gap-2 group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all duration-300`}
                            style={fadeInStyle(0.7)}
                        >
                            <span className="text-3xl lg:text-4xl font-heading font-bold text-pink-500 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                                {count5}
                            </span>
                            <span className="text-xs lg:text-sm text-gray-300 font-medium leading-tight">Disponibilité</span>
                        </div>
                    </div>
                </div>

            </div>

        </section>
    );
});

export default Hero;
