import React, { useEffect, useState } from 'react';

export const CinematicPreloader: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(0); // 0: Start, 1: Logo Show, 2: Line Expand, 3: Fade Out

    useEffect(() => {
        const hasSeen = sessionStorage.getItem('klyora_welcome_seen');
        if (!hasSeen) {
            setIsVisible(true);
            sessionStorage.setItem('klyora_welcome_seen', 'true');

            // Sequence
            setTimeout(() => setStep(1), 100); // Trigger Logo
            setTimeout(() => setStep(2), 800); // Trigger Line
            setTimeout(() => setStep(3), 2000); // Trigger Fade Out
            setTimeout(() => setIsVisible(false), 3000); // Remove DOM
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out ${step === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="relative">
                <h1 className={`text-4xl md:text-6xl font-serif italic tracking-widest transition-all duration-1000 transform ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    Maison Klyora
                </h1>

                <div className={`h-[1px] bg-white/50 mt-6 mx-auto transition-all duration-1000 ease-in-out ${step >= 2 ? 'w-full' : 'w-0'}`} />

                <p className={`text-[10px] uppercase tracking-[0.5em] text-center mt-4 text-zinc-500 transition-all duration-1000 delay-500 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                    Paris
                </p>
            </div>
        </div>
    );
};
