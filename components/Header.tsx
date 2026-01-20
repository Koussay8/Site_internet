"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { memo, useState, useEffect } from "react";

const Header = memo(function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('user');
        if (token && user) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <header className="fixed top-0 left-0 w-full z-50 py-6 px-12 flex justify-between items-center mix-blend-difference text-white bg-transparent">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <Image
                    src="/logo-white.png"
                    alt="Vextra Tech Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                />
                <span className="font-heading font-bold text-lg tracking-tight">Vextra Tech</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
                <Link href="/#services" className="hover:text-gray-300 transition-colors">
                    <span className="text-accent mr-2">•</span>Nos Agents
                </Link>
                <Link href="/#services" className="hover:text-gray-300 transition-colors">
                    <span className="text-accent mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>
                    Services
                </Link>
                <Link href="/#about" className="hover:text-gray-300 transition-colors">
                    <span className="text-accent mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>
                    À propos
                </Link>
                <Link href="/#contact" className="hover:text-gray-300 transition-colors">
                    <span className="text-accent mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>
                    Contact
                </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {isLoggedIn ? (
                    <Link
                        href="/dashboard"
                        className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all font-medium backdrop-blur-sm"
                    >
                        Mon Dashboard
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all font-medium backdrop-blur-sm"
                    >
                        Se Connecter
                    </Link>
                )}
            </div>
        </header>
    );
});

export default Header;
