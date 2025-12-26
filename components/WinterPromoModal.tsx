import React, { useState, useEffect } from 'react';

// Hardcoded Expiration: December 31, 2025 23:59:59
const EXPIRATION_DATE = new Date('2025-12-31T23:59:59');

export const WinterPromoModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const now = new Date();
        // 1. Check Expiration
        if (now > EXPIRATION_DATE) return;

        // 2. Check Session (DISABLED FOR DEBUGGING)
        // const hasSeen = sessionStorage.getItem('klyora_winter_promo_seen');
        // if (!hasSeen) {
        // Delay slightly for effect
        const timer = setTimeout(() => {
            setIsOpen(true);
            // sessionStorage.setItem('klyora_winter_promo_seen', 'true');
        }, 1000);
        return () => clearTimeout(timer);
        // }
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md md:max-w-lg bg-white shadow-2xl animate-fade-scale overflow-hidden">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="relative aspect-[3/4] w-full bg-black">
                    {/* Use the generated artifact path - I will replace this with real local path if needed, 
                        but for now I'll use the one I just generated. 
                        Wait, I need to know the path of the generated image. 
                        It is usually saved in the artifacts directory.
                        I'll use a relative path if I move it, or import it.
                        For this environment, I'll assume I need to move it to `assets` or reference it from artifacts if allowed?
                        I should probably move the artifact to the assets folder.
                        I'll do that in a separate step. For now I'll put a placeholder or the artifact URL if I can.
                     */}
                    <img
                        src="https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=989&auto=format&fit=crop"
                        alt="Winter Sale Exclusive"
                        className="w-full h-full object-cover opacity-90"
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 border-4 border-white/10 m-4">
                        <h2 className="text-5xl md:text-6xl font-serif italic text-white mb-2 text-center drop-shadow-lg transform translate-z-40" style={{ transform: 'translateZ(40px)' }}>Winter Sale</h2>
                        <p className="text-sm uppercase tracking-[0.4em] text-white/90 mb-8 font-bold drop-shadow-md transform translate-z-30" style={{ transform: 'translateZ(30px)' }}>Up to 50% Off</p>

                        <div className="absolute bottom-10 left-0 right-0 text-center text-white">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="bg-white text-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-200 transition-colors"
                            >
                                Shop the Collection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
