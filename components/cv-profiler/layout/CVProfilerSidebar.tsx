'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    FolderKanban,
    FileText,
    Home,
    LogOut,
    Upload,
} from 'lucide-react';

interface User {
    email: string;
    company_name?: string;
}

const navigation = [
    { name: 'Dashboard', href: '/cv-profiler', icon: LayoutDashboard },
    { name: 'Candidats', href: '/cv-profiler/candidates', icon: Users },
    { name: 'Postes', href: '/cv-profiler/jobs', icon: Briefcase },
    { name: 'Playgrounds', href: '/cv-profiler/playgrounds', icon: FolderKanban },
    { name: 'Formulaires', href: '/cv-profiler/forms', icon: FileText },
];

export default function CVProfilerSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('user');
            if (stored) setUser(JSON.parse(stored));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const isActive = (href: string) =>
        href === '/cv-profiler' ? pathname === href : pathname?.startsWith(href);

    return (
        <aside className="cvp-sidebar">
            {/* Logo */}
            <div className="cvp-sidebar-logo">
                <div className="cvp-sidebar-logo-icon">
                    <Users size={16} />
                </div>
                <span className="cvp-sidebar-title">CV Profiler</span>
            </div>

            {/* Bouton Import CVs */}
            <Link href="/cv-profiler/upload" className="cvp-import-btn">
                <Upload size={16} />
                Importer des CVs
            </Link>

            {/* Navigation */}
            <nav className="cvp-nav">
                {navigation.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`cvp-nav-item ${active ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}

                <div className="cvp-sidebar-divider" />

                <Link href="/dashboard" className="cvp-nav-item">
                    <Home size={18} />
                    Mes Applications
                </Link>
            </nav>

            {/* User footer */}
            <div className="cvp-user-section">
                <div className="cvp-user-card">
                    <div className="cvp-user-avatar">
                        {user?.company_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="cvp-user-info">
                        <div className="cvp-user-name">
                            {user?.company_name || 'Admin'}
                        </div>
                        <div className="cvp-user-email">{user?.email}</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="cvp-logout-btn"
                        aria-label="Déconnexion"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
