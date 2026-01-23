import { CheckCircle } from 'lucide-react';

// Server Component - calcul côté serveur, pas d'interactivité

const valueStack = [
    { item: 'Développement agents IA sur-mesure', value: '50 000€', included: true },
    { item: 'Intégration à vos outils existants', value: '15 000€', included: true },
    { item: 'Formation complète de vos équipes', value: '8 000€', included: true },
    { item: 'Support prioritaire 24/7 (1 an)', value: '12 000€', included: true },
    { item: 'Optimisations et mises à jour', value: '6 000€', included: true },
];

export default function PricingSection() {
    const totalValue = valueStack.reduce((sum, item) => sum + parseInt(item.value.replace(/[€\s]/g, '')), 0);

    return (
        <section className="w-full py-32 px-6 md:px-12 bg-[rgb(30,30,30)] relative">
            <div className="max-w-5xl mx-auto">
                <div className="relative bg-[#0F0F10] border border-white/10 rounded-[40px] p-8 md:p-16 overflow-hidden">
                    {/* Background Effect */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl font-bold mb-8">L'offre <span className="text-orange-500">Ultime</span></h2>
                            <div className="space-y-6">
                                {valueStack.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between pb-4 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                            </div>
                                            <span className="text-gray-300">{item.item}</span>
                                        </div>
                                        <span className="text-gray-500 line-through text-sm">{item.value}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center pt-4 font-mono text-sm text-orange-400">
                                    <span>VALEUR TOTALE</span>
                                    <span>{totalValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}€</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 flex flex-col justify-center">
                            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>

                                <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">Investissement Annuel</p>
                                <div className="text-6xl font-bold text-white mb-2">12k€</div>
                                <p className="text-gray-500 mb-8 text-sm">soit 1 000€ / mois</p>

                                <a href="#contact" className="block w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-orange-500 hover:text-white transition-all duration-300">
                                    Démarrer maintenant
                                </a>

                                <p className="mt-6 text-xs text-gray-500">
                                    Garantie de satisfaction 30 jours.
                                    Places limitées.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
