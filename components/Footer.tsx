import { Phone } from "lucide-react";
import { memo } from "react";

const Footer = memo(function Footer() {
    const marqueeContent = (
        <>
            <span className="text-[12rem] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600">
                CONTACT US
            </span>
            <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center">
                <Phone size={64} className="text-white" />
            </div>
            <span className="text-[12rem] font-bold tracking-tighter text-[#222]">CONTACT US</span>
            <div className="w-32 h-32 rounded-full border-4 border-orange-500/20 flex items-center justify-center bg-orange-500/10">
                <Phone size={64} className="text-orange-500" />
            </div>
        </>
    );

    return (
        <footer className="w-full bg-[rgb(30,30,30)] text-white overflow-hidden py-32 border-t border-white/10">

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden whitespace-nowrap opacity-90">
                <div className="marquee">
                    <div className="marquee__track">
                        <div className="marquee__group">{marqueeContent}</div>
                        <div className="marquee__group" aria-hidden="true">
                            {marqueeContent}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="max-w-7xl mx-auto px-12 mt-32 flex justify-between items-end">
                <div>
                    <p className="text-2xl font-light mb-8">Vextra Tech</p>
                    <div className="flex gap-8 text-gray-400 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                        <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-medium">hello@vextra.tech</p>
                    <p className="text-gray-500">© 2025 Vextra Tech. Tous droits réservés.</p>
                </div>
            </div>

        </footer>
    );
});

export default Footer;
