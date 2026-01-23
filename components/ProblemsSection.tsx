'use client';

import { Clock, TrendingDown, AlertCircle } from 'lucide-react';

const problems = [
    {
        icon: Clock,
        title: 'Vous perdez des clients car vous ne répondez pas assez vite?',
        description: 'Pendant que vous dormez, vos concurrents capturent VOS clients. Chaque appel manqué = 500€ minimum de CA perdu.',
        stat: '67% des clients contactent un concurrent si pas de réponse en 5 minutes'
    },
    {
        icon: TrendingDown,
        title: 'Vos équipes passent 60% de leur temps sur des tâches répétitives?',
        description: 'Répondre aux mêmes questions, saisir des données, qualifier des leads... Vos talents gaspillent leur potentiel.',
        stat: '15h/semaine perdues par employé sur des tâches automatisables'
    },
    {
        icon: AlertCircle,
        title: 'Vos concurrents utilisent déjà l\'IA pendant que vous réfléchissez?',
        description: 'Ils servent plus de clients, avec moins d\'équipe, en facturant plus cher. L\'écart se creuse chaque jour.',
        stat: '43% de vos concurrents ont déjà adopté l\'IA en 2025'
    }
];

export default function ProblemsSection() {
    return (
        <section className="w-full py-32 px-12 bg-[rgb(20,20,22)] text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">La Vérité</span>
                    <h2 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                        Ces <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">problèmes</span> vous coûtent cher
                    </h2>
                    <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                        Pendant que vous hésitez, vos concurrents automatisent et vous dépassent.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {problems.map((problem, i) => {
                        const Icon = problem.icon;
                        return (
                            <div key={i} className="bg-white/5 border border-red-500/20 rounded-3xl p-8 backdrop-blur-sm hover:border-red-500/40 transition-all">
                                <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl mb-6">
                                    <Icon className="w-8 h-8 text-red-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{problem.title}</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">{problem.description}</p>
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                    <p className="text-red-300 text-sm font-semibold">{problem.stat}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-2xl md:text-3xl font-bold text-white">
                        Mais il y a une <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">solution</span>...
                    </p>
                </div>
            </div>
        </section>
    );
}
