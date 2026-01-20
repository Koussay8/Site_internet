'use client';

import {
    ArrowUpRight,
    MessageSquare,
    Clock,
    Users,
    MoreHorizontal,
    Play,
    Pause,
    Zap,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Mock Data for the chart
const data = [
    { name: 'Lun', leads: 400, conversations: 240 },
    { name: 'Mar', leads: 300, conversations: 139 },
    { name: 'Mer', leads: 500, conversations: 380 },
    { name: 'Jeu', leads: 280, conversations: 390 },
    { name: 'Ven', leads: 590, conversations: 480 },
    { name: 'Sam', leads: 430, conversations: 300 },
    { name: 'Dim', leads: 450, conversations: 430 },
];

// Mock Data for services
const services = [
    {
        id: 1,
        name: "Chatbot Support Client",
        type: "Customer Service",
        status: "active",
        metrics: "240 conv/jour",
        lastActive: "À l'instant",
        icon: MessageSquare,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        id: 2,
        name: "Générateur de Leads",
        type: "Sales Automation",
        status: "active",
        metrics: "45 leads/semaine",
        lastActive: "Il y a 2m",
        icon: Users,
        color: "text-orange-500",
        bg: "bg-orange-500/10"
    },
    {
        id: 3,
        name: "Analyseur de Données",
        type: "Data Processing",
        status: "paused",
        metrics: "En attente",
        lastActive: "Il y a 2j",
        icon: Sparkles,
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    }
];

export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="animate-fade-in-up">
                    <h1 className="text-3xl font-bold font-outfit mb-2">Bonjour, Alex 👋</h1>
                    <p className="text-gray-400">Voici ce qui se passe avec vos assistants IA aujourd'hui.</p>
                </div>
                <div className="flex gap-3 animate-fade-in-up delay-100">
                    <button className="px-4 py-2 bg-[#1A1A1C] hover:bg-[#252528] border border-white/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                        <Clock size={16} />
                        Historique
                    </button>
                    <button className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-xl text-sm font-bold transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2">
                        <Zap size={16} className="fill-black" />
                        Nouvelle Action
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up delay-200">
                {/* Stat Card 1 */}
                <div className="bg-[#121214]/50 backdrop-blur-md border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-500/10 rounded-2xl">
                            <MessageSquare className="text-orange-500" size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                            +12.5% <ArrowUpRight size={12} />
                        </span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Conversations gérées</h3>
                    <p className="text-3xl font-bold font-outfit mt-1 group-hover:text-orange-400 transition-colors">12,450</p>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-[#121214]/50 backdrop-blur-md border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <Clock className="text-blue-500" size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                            +5h 20m <ArrowUpRight size={12} />
                        </span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Temps humain économisé</h3>
                    <p className="text-3xl font-bold font-outfit mt-1 group-hover:text-blue-400 transition-colors">840 h</p>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-[#121214]/50 backdrop-blur-md border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-2xl">
                            <Sparkles className="text-purple-500" size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                            98% Score
                        </span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Satisfaction IA</h3>
                    <p className="text-3xl font-bold font-outfit mt-1 group-hover:text-purple-400 transition-colors">4.9/5</p>
                </div>
            </div>

            {/* Chart Section */}
            <div className="grid lg:grid-cols-3 gap-6 animate-fade-in-up delay-300">
                <div className="lg:col-span-2 bg-[#121214]/50 backdrop-blur-md border border-white/5 p-6 rounded-3xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-lg">Performance des Agents</h3>
                        <select className="bg-white/5 border border-white/10 rounded-lg text-xs p-2 outline-none text-gray-400">
                            <option>7 derniers jours</option>
                            <option>30 derniers jours</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A1A1C', borderColor: '#333', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="leads" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                                <Area type="monotone" dataKey="conversations" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorConv)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Assistant Quick Chat */}
                <div className="bg-gradient-to-b from-[#1A1A1C] to-[#0a0a0a] border border-white/5 p-6 rounded-3xl flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold">Vextra Assistant</h3>
                            <p className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                En ligne
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[200px] scrollbar-hide relative z-10">
                        <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-gray-300">
                            Bonjour ! Je peux vous aider à configurer un nouveau service ou analyser vos stats.
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl rounded-tr-none p-3 text-sm text-white ml-auto max-w-[80%]">
                            Comment augmenter mes leads cette semaine ?
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Posez une question..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm focus:border-orange-500/50 focus:outline-none transition-colors"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">
                                <ArrowRight size={14} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Services List */}
            <div className="animate-fade-in-up delay-400">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Vos Services Actifs</h3>
                    <button className="text-sm text-orange-500 hover:text-orange-400 transition-colors">Voir tout</button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div key={service.id} className="bg-[#121214]/50 backdrop-blur-md border border-white/5 p-5 rounded-2xl hover:border-white/20 transition-all hover:-translate-y-1 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${service.bg}`}>
                                    <service.icon className={service.color} size={20} />
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${service.status === 'active'
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }`}>
                                    {service.status === 'active' ? 'Actif' : 'En pause'}
                                </div>
                            </div>

                            <h4 className="font-bold mb-1">{service.name}</h4>
                            <p className="text-xs text-gray-500 mb-4">{service.type}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Performance</p>
                                    <p className="text-sm font-medium">{service.metrics}</p>
                                </div>
                                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                                    {service.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
