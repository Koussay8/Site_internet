// Server Component - contenu statique uniquement

export default function TestimonialsSection() {
    return (
        <section className="w-full py-32 px-12 bg-white/5 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-orange-500 uppercase tracking-wider text-sm font-semibold">Témoignages</span>
                    <h2 className="text-5xl md:text-6xl font-bold mt-4">
                        Ils nous font <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">confiance</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            text: '"Nos no-shows ont chuté de 70%. L\'IA filtre parfaitement les vrais patients. Je recommande à 100%."',
                            name: 'Dr. Martin',
                            company: 'Cabinet Dentaire Lyon',
                            result: '-70% no-shows'
                        },
                        {
                            text: '"Je ne rate plus un seul appel même quand je suis sous une baignoire. Un investissement rentabilisé en 1 mois."',
                            name: 'Jean-Pierre R.',
                            company: 'Plombier Indépendant',
                            result: 'ROI en 30 jours'
                        },
                        {
                            text: '"40% de temps gagné. Mes agents se concentrent sur les visites, pas les questions basiques."',
                            name: 'Sophie L.',
                            company: 'Agence Immobilière Paris',
                            result: '+40% productivité'
                        },
                    ].map((testimonial, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative hover:border-orange-500/30 transition-all">
                            <div className="absolute top-6 right-6 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1">
                                <span className="text-orange-300 text-xs font-bold">{testimonial.result}</span>
                            </div>
                            <div className="text-6xl text-orange-500 opacity-20 font-serif mb-4">"</div>
                            <p className="text-white italic mb-6 relative z-10">{testimonial.text}</p>
                            <div>
                                <strong className="text-white">{testimonial.name}</strong>
                                <p className="text-gray-400 text-sm">{testimonial.company}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
