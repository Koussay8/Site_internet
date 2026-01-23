'use client';

import { Zap } from 'lucide-react';

const transformationSteps = [
    {
        phase: 'Semaine 1',
        title: 'Quick Win',
        description: 'Premiers résultats visibles. Votre agent IA répond aux premières demandes.',
        metrics: ['Premier lead qualifié', 'Temps de réponse divisé par 10', 'Équipe libérée'],
        color: 'from-orange-400 to-orange-500'
    },
    {
        phase: 'Mois 1-3',
        title: 'Compound',
        description: 'Optimisation continue. L\'IA apprend de chaque interaction et s\'améliore.',
        metrics: ['30% de productivité en plus', 'ROI positif', 'Processus optimisés'],
        color: 'from-orange-500 to-orange-600'
    },
    {
        phase: 'Mois 3-6',
        title: 'Advantage',
        description: 'Avantage compétitif établi. Vous servez plus de clients que vos concurrents.',
        metrics: ['2x plus de leads', 'Service 24/7', 'Satisfaction client +40%'],
        color: 'from-orange-600 to-red-500'
    },
    {
        phase: 'Mois 6+',
        title: '10x',
        description: 'Transformation complète. Votre business tourne pendant que vous dormez.',
        metrics: ['Croissance exponentielle', 'Équipe concentrée sur valeur', 'Leadership du marché'],
        color: 'from-red-500 to-red-600'
    }
];

export default function RoadmapSection() {
    return (
        <section className="w-full py-32 px-12 bg-[rgb(30,30,30)] text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <span className="text-orange-500 uppercase tracking-wider text-sm font-semibold">Votre Roadmap</span>
                    <h2 className="text-5xl md:text-6xl font-bold mt-4 mb-6">
                        De 0 à <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">10x</span> en 6 mois
                    </h2>
                    <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                        Voici exactement ce qui va se passer après votre décision aujourd'hui
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {transformationSteps.map((step, i) => (
                        <div key={i} className="relative">
                            {i < transformationSteps.length - 1 && (
                                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-orange-500/50 to-transparent" />
                            )}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-all h-full">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} text-white font-bold text-lg mb-4`}>
                                    {i + 1}
                                </div>
                                <div className="text-orange-400 text-sm font-semibold mb-2">{step.phase}</div>
                                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">{step.description}</p>
                                <ul className="space-y-2">
                                    {step.metrics.map((metric, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                                            <Zap className="w-4 h-4 text-orange-500" />
                                            {metric}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
