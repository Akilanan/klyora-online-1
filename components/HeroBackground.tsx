import React, { useEffect, useRef, useState } from 'react';

interface HeroBackgroundProps {
    t: {
        heroTitle: string;
        heroSubtitle: string;
        collection: string;
        concierge: string;
    };
    onConciergeClick: () => void;
    onStyleQuizClick: () => void;
}

export const HeroBackground: React.FC<{ t: any, onConciergeClick: () => void, onStyleQuizClick: () => void }> = ({ t, onConciergeClick, onStyleQuizClick }) => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            // Use requestAnimationFrame for smoother performance if needed, 
            // but purely local state here is much better than App-level state.
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className="relative h-[100vh] w-full overflow-hidden flex items-center justify-center">
            {/* Cinematic Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-[3000ms] ease-in-out"
                style={{ transform: `scale(${1 + scrollY * 0.0001})` }}
            >
                <source src="https://videos.pexels.com/video-files/5709669/5709669-uhd_2560_1440_25fps.mp4" type="video/mp4" />
                {/* Fallback could be added here */}
            </video>

            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
            <div className="relative z-10 text-center px-6">
                <span className="text-[9px] uppercase tracking-[1.2em] text-white/30 block mb-12 animate-fade-in-up">{t.collection.toUpperCase()}</span>
                <h1 className="editorial-heading font-serif tracking-tighter mb-16 animate-fade-scale text-white/90 text-4xl md:text-6xl lg:text-7xl">
                    {t.heroTitle} <br /> <span className="italic">{t.heroSubtitle}</span>
                </h1>
                <div className="flex flex-col md:flex-row justify-center items-center gap-12">
                    <button
                        onClick={onConciergeClick}
                        className="group relative px-20 py-7 bg-white text-black text-[9px] font-bold uppercase tracking-[0.5em] hover:bg-zinc-200 transition-all"
                    >
                        {t.concierge}
                    </button>
                    <button
                        onClick={onStyleQuizClick}
                        className="text-white text-[8px] uppercase tracking-[0.6em] font-bold border-b border-white/10 pb-2 hover:border-white transition-all flex items-center gap-2"
                    >
                        <span className="w-2 h-2 rounded-full bg-[#8ca67a] animate-pulse"></span>
                        Style DNA
                    </button>
                </div>
            </div>
        </section>
    );
};
