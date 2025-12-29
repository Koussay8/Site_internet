'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    Briefcase,
    FolderKanban,
    Target,
    Search,
    Bell,
    Plus,
    Loader2,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

interface DashboardStats {
    totalCandidates: number;
    totalJobs: number;
    totalPlaygrounds: number;
    averageMatchScore: number;
}

interface Candidate {
    id: string;
    name: string;
    skills: string[];
    created_at: string;
}

export default function CVProfilerDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalCandidates: 0,
        totalJobs: 0,
        totalPlaygrounds: 0,
        averageMatchScore: 0,
    });
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Candidate[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [candidatesRes, jobsRes, playgroundsRes] = await Promise.all([
                fetch('/api/candidates', { headers }),
                fetch('/api/jobs', { headers }),
                fetch('/api/playgrounds', { headers }),
            ]);

            const candidatesData = candidatesRes.ok ? await candidatesRes.json() : [];
            const jobsData = jobsRes.ok ? await jobsRes.json() : [];
            const playgroundsData = playgroundsRes.ok ? await playgroundsRes.json() : [];

            setCandidates(candidatesData);

            // Calcul du score moyen
            const matchScores = candidatesData.filter((c: any) => c.match_score).map((c: any) => c.match_score);
            const avgScore = matchScores.length > 0
                ? Math.round(matchScores.reduce((a: number, b: number) => a + b, 0) / matchScores.length)
                : 0;

            setStats({
                totalCandidates: candidatesData.length,
                totalJobs: jobsData.length,
                totalPlaygrounds: playgroundsData.length,
                averageMatchScore: avgScore,
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Recherche IA
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/ai-search', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: searchQuery }),
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.results || []);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Données pour les graphiques
    const getCandidatesByMonth = () => {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const currentMonth = new Date().getMonth();
        const last6Months = [];

        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            const monthName = months[monthIndex];
            const count = candidates.filter(c => {
                const created = new Date(c.created_at);
                return created.getMonth() === monthIndex;
            }).length;
            last6Months.push({ month: monthName, count });
        }

        return last6Months;
    };

    const getTopSkills = () => {
        const skillCounts: Record<string, number> = {};
        candidates.forEach(c => {
            (c.skills || []).forEach(skill => {
                skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
        });

        const colors = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'];
        return Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value], i) => ({ name, value, color: colors[i] }));
    };

    const candidatesData = getCandidatesByMonth();
    const skillsData = getTopSkills();

    const statCards = [
        {
            title: 'Total Candidats',
            value: stats.totalCandidates,
            badge: candidates.length > 0 ? `+${Math.min(candidates.length, 99)}` : '0',
            icon: Users,
            iconClass: 'violet',
        },
        {
            title: 'Postes Actifs',
            value: stats.totalJobs,
            badge: `${stats.totalJobs}`,
            icon: Briefcase,
            iconClass: 'blue',
        },
        {
            title: 'Playgrounds',
            value: stats.totalPlaygrounds,
            badge: `${stats.totalPlaygrounds}`,
            icon: FolderKanban,
            iconClass: 'emerald',
        },
        {
            title: 'Score Moyen',
            value: `${stats.averageMatchScore}%`,
            badge: stats.averageMatchScore > 0 ? `+${stats.averageMatchScore}%` : '-',
            icon: Target,
            iconClass: 'orange',
        },
    ];

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="dashboard-loader-icon" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
            {/* Header Bar */}
            <header className="cvp-header">
                <div>
                    <h1 className="cvp-header-title">Dashboard</h1>
                    <p className="cvp-header-subtitle">Vue d'ensemble de votre recrutement</p>
                </div>

                <div className="cvp-header-actions">
                    {/* Search IA */}
                    <div className="cvp-search" style={{ position: 'relative' }}>
                        <Search className="cvp-search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Recherche IA: 'développeur Python avec 3 ans'"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="cvp-search-input"
                            style={{ width: '320px' }}
                        />
                        {isSearching && (
                            <Loader2 size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} className="dashboard-loader-icon" />
                        )}
                    </div>

                    {/* Notification */}
                    <button className="cvp-notif-btn" aria-label="Notifications">
                        <Bell size={20} />
                        <span className="cvp-notif-dot" />
                    </button>

                    {/* Bouton Import compact */}
                    <Link href="/cv-profiler/upload" className="cvp-primary-btn">
                        <Plus size={16} />
                        Importer des CVs
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="cvp-content">
                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="cvp-card" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                                Résultats de recherche ({searchResults.length})
                            </h3>
                            <button
                                onClick={() => { setSearchResults([]); setSearchQuery(''); }}
                                style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                            >
                                Fermer
                            </button>
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {searchResults.slice(0, 5).map((c: any) => (
                                <Link
                                    key={c.id}
                                    href={`/cv-profiler/candidates`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                    }}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 600 }}>
                                        {c.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{c.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{c.email}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="cvp-stats-grid">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div key={index} className="cvp-stat-card">
                                <div className="cvp-stat-header">
                                    <div className={`cvp-stat-icon ${card.iconClass}`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className="cvp-stat-badge">{card.badge}</span>
                                </div>
                                <div className="cvp-stat-value">{card.value}</div>
                                <div className="cvp-stat-label">{card.title}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts */}
                <div className="cvp-charts-grid">
                    {/* Area Chart */}
                    <div className="cvp-chart-card">
                        <h3 className="cvp-chart-title">Candidats par mois</h3>
                        <p className="cvp-chart-subtitle">Évolution du nombre de candidats</p>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={candidatesData}>
                                <defs>
                                    <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    fill="url(#colorCandidates)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Donut Chart */}
                    <div className="cvp-chart-card">
                        <h3 className="cvp-chart-title">Top Compétences</h3>
                        <p className="cvp-chart-subtitle">Répartition des skills</p>
                        {skillsData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={skillsData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {skillsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="cvp-skills-legend">
                                    {skillsData.map((skill, index) => (
                                        <div key={index} className="cvp-skill-item">
                                            <div className="cvp-skill-name">
                                                <div className="cvp-skill-dot" style={{ backgroundColor: skill.color }} />
                                                {skill.name}
                                            </div>
                                            <span className="cvp-skill-count">{skill.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                Aucune compétence à afficher
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
