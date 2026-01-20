import { memo } from "react";

const Advantages = memo(function Advantages() {
    return (
        <section className="w-full py-32 px-12 bg-[rgb(30,30,30)] text-white relative overflow-hidden">

            {/* Background Glows (Simulating 3D environment) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header */}
                <div className="mb-24">
                    <h2 className="text-6xl font-bold tracking-tight max-w-xl">
                        Ce que Vextra Tech peut faire pour vous
                    </h2>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Card 1 */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-sm group hover:bg-white/10 transition-colors">
                        <div className="h-40 mb-8 flex items-center justify-center relative">
                            {/* Simulated 3D Shape - Two Spheres */}
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-300 to-orange-600 rounded-full shadow-[0_0_30px_rgba(255,107,0,0.5)] group-hover:scale-110 transition-transform duration-500" />
                            <div className="w-12 h-12 bg-gradient-to-tl from-white to-orange-200 rounded-full absolute ml-12 mt-8 shadow-lg group-hover:translate-x-2 transition-transform duration-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Précision et Constance</h3>
                        <p className="text-gray-400 leading-relaxed">
                            L'assistant virtuel maintient un haut niveau de précision et de constance dans l'exécution des tâches.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white/10 border border-white/20 p-10 rounded-3xl text-white transform scale-105 shadow-2xl shadow-orange-900/10 backdrop-blur-md">
                        <div className="h-40 mb-8 flex items-center justify-center">
                            {/* Simulated 3D Shape - Half Sphere */}
                            <div className="w-24 h-12 bg-gradient-to-b from-orange-400 to-orange-600 rounded-b-full shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-4 bg-orange-300/50 blur-sm" />
                            </div>
                            <div className="w-8 h-8 bg-orange-200 rounded-full absolute mb-16 ml-12 blur-sm" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Économies</h3>
                        <p className="text-gray-300 leading-relaxed">
                            Les entreprises peuvent réduire leurs coûts opérationnels en automatisant les tâches et en améliorant l'efficacité.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-sm group hover:bg-white/10 transition-colors">
                        <div className="h-40 mb-8 flex items-center justify-center">
                            {/* Simulated 3D Shape - Pill capsule */}
                            <div className="flex gap-2">
                                <div className="w-10 h-20 bg-gradient-to-r from-orange-300 to-white rounded-l-full opacity-80" />
                                <div className="w-10 h-20 bg-gradient-to-l from-orange-600 to-orange-400 rounded-r-full shadow-[0_0_20px_rgba(255,107,0,0.3)]" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Personnalisation</h3>
                        <p className="text-gray-400 leading-relaxed">
                            L'assistant virtuel offre des recommandations et services personnalisés, adaptés à vos besoins spécifiques.
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
});

export default Advantages;
