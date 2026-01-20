'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Bot,
    BarChart3,
    Settings,
    LogOut,
    PlusCircle,
    MessageSquare,
    Bell,
    Menu,
    X,
    Search
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    const navigation = [
        { name: 'Vue d\'ensemble', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Mes Agents IA', href: '/dashboard/agents', icon: Bot },
        { name: 'Analytique', href: '/dashboard/analytics', icon: BarChart3 },
        { name: 'Support & Chat', href: '/dashboard/support', icon: MessageSquare },
        { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex font-sans selection:bg-orange-500/30">

            {/* Mobile Sidebar Overlay */}
            {!isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(true)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#121214] border-r border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
        `}
            >
                {/* Logo Area */}
                <div className={`h-20 flex items-center px-6 border-b border-white/5 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                    {isSidebarOpen ? (
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <span className="font-bold text-white text-sm">V</span>
                            </div>
                            <span className="font-bold text-lg tracking-tight">Vextra Tech</span>
                        </Link>
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                            <span className="font-bold text-white text-sm">V</span>
                        </div>
                    )}

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/10'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white hover:border hover:border-white/5 border border-transparent'
                                    }
                `}
                            >
                                <item.icon size={22} className={isActive ? 'text-orange-500' : 'group-hover:text-white transition-colors'} />
                                {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}

                                {/* Active Indicator Line */}
                                {isActive && isSidebarOpen && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_#F97316]"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Call to Action - New Service */}
                {isSidebarOpen && (
                    <div className="p-4 mx-2 mb-4">
                        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                            <h3 className="font-bold text-sm mb-1 relative z-10">Besoin de plus ?</h3>
                            <p className="text-xs text-gray-500 mb-3 relative z-10">Déployez un nouvel agent IA.</p>
                            <button className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 relative z-10">
                                <PlusCircle size={14} />
                                Nouveau Service
                            </button>
                        </div>
                    </div>
                )}

                {/* User Profile Footer */}
                <div className="p-4 border-t border-white/5">
                    <button className={`flex items-center gap-3 w-full hover:bg-white/5 p-2 rounded-xl transition-colors ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold border border-white/10">
                            JD
                        </div>
                        {isSidebarOpen && (
                            <div className="text-left overflow-hidden">
                                <p className="text-sm font-bold truncate">John Doe</p>
                                <p className="text-xs text-gray-500 truncate">Enterprise Plan</p>
                            </div>
                        )}
                        {isSidebarOpen && <LogOut size={16} className="ml-auto text-gray-500 hover:text-white" />}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Background Ambience */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[100px]"></div>
                </div>

                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:flex items-center text-sm text-gray-500">
                            <span>Dashboard</span>
                            <span className="mx-2">/</span>
                            <span className="text-white">Vue d'ensemble</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search Bar */}
                        <div className="hidden md:flex items-center bg-[#1A1A1C] border border-white/5 rounded-full px-4 py-2 w-64 focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all">
                            <Search size={16} className="text-gray-500 mr-2" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-600 w-full"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border border-[#0a0a0a]"></span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10 scrollbar-hide">
                    {children}
                </div>
            </main>
        </div>
    );
}
