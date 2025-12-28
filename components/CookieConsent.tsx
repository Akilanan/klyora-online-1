import React, { useState, useEffect } from 'react';

export const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('klyora_cookie_consent');
        if (!consent) {
            setTimeout(() => setIsVisible(true), 1000); // Delay for better UX
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('klyora_cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-zinc-900 border-t border-white/10 p-6 md:p-8 animate-fade-in-up">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-xl">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        <strong className="text-white uppercase tracking-widest mr-2">Cookies & Privacy.</strong>
                        We use essential cookies to ensure the integrity of your atelier experience.
                        With your consent, we also use analytical cookies to refine our curation and offer bespoke recommendations.
                    </p>
                </div>
                <div className="flex gap-4 shrink-0">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-[9px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2 bg-white text-black text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-200 transition-colors"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};
