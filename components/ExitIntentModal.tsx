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

                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#8ca67a] mb-4">Wait! A Private Gift</p>
                    <h2 className="text-3xl font-serif italic mb-6">Take $20 Off Your Order</h2>
                    <p className="text-sm text-zinc-600 mb-8 leading-relaxed">
                        Join our Inner Circle now and we'll immediately apply a <strong>$20.00 credit</strong> to your current cart.
                    </p>

                    <button
                        onClick={() => {
                            sessionStorage.setItem('klyora_discount', 'WELCOME20');
                            setIsVisible(false);
                            alert('Credit Applied! Code WELCOME20 will be auto-filled at checkout.');
                        }}
                        className="w-full bg-black text-white py-4 text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-zinc-800 transition-colors mb-4"
                    >
                        Redeem My $20 Credit
                    </button>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-600 underline underline-offset-4"
                    >
                        Continue without credit
                    </button>
                </div>
            </div>
        </div>
    );
};
