import React, { useEffect, useState } from 'react';

export const ExitIntentModal: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasTriggered) {
                const alreadyShown = sessionStorage.getItem('klyora_exit_intent');
                if (!alreadyShown) {
                    setIsVisible(true);
                    setHasTriggered(true);
                    sessionStorage.setItem('klyora_exit_intent', 'true');
                }
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [hasTriggered]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white max-w-2xl w-full flex overflow-hidden shadow-2xl relative">
                {/* Image Side */}
                <div className="w-1/2 relative hidden md:block">
                    <img
                        src="https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?q=80&w=2072&auto=format&fit=crop"
                        alt="Before you go"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2 p-12 flex flex-col justify-center text-center relative">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-black"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#8ca67a] mb-4">Maison Klyora</p>
                    <h2 className="text-3xl font-serif italic mb-6">Before You Depart...</h2>
                    <p className="text-sm text-zinc-600 mb-8 leading-relaxed">
                        Become a member of our Inner Circle and receive priority access to the next Atelier release.
                    </p>

                    <button className="w-full bg-black text-white py-4 text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-zinc-800 transition-colors mb-4">
                        Unlock Priority Access
                    </button>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-600 underline underline-offset-4"
                    >
                        No, I prefer standard access
                    </button>
                </div>
            </div>
        </div>
    );
};
