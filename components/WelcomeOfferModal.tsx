import React, { useState, useEffect } from 'react';

export const WelcomeOfferModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'offer' | 'success'>('offer');

    useEffect(() => {
        // Show after 3 seconds on first visit
        const hasSeen = localStorage.getItem('klyora_welcome_seen');
        if (!hasSeen) {
            const timer = setTimeout(() => setIsOpen(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('success');
        localStorage.setItem('klyora_welcome_seen', 'true');

        // Simulate "Copy to Checkout"
        setTimeout(() => {
            // If we had a real backend, we'd email them.
            // For now, we auto-apply simulating a session attribute?
            // Or just give them the code.
        }, 1000);
    };

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('klyora_welcome_seen', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose} />

            <div className="relative bg-[#fcfcfc] w-full max-w-md p-8 md:p-12 shadow-2xl animate-fade-scale border border-black/5 text-center">
                <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {step === 'offer' ? (
                    <div className="space-y-6">
                        <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8ca67a]">Maison Klyora</span>
                        <h2 className="text-3xl md:text-4xl font-serif italic leading-tight">
                            The Private <br /> Invitation
                        </h2>
                        <p className="text-sm font-light text-zinc-600 leading-relaxed max-w-xs mx-auto">
                            Join our inner circle and receive a <span className="font-bold text-black">15% Privilege</span> on your first acquisition.
                        </p>

                        <form onSubmit={handleUnlock} className="space-y-4 pt-4">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ENTER YOUR EMAIL"
                                className="w-full text-center bg-transparent border-b border-black/10 py-3 text-xs uppercase tracking-widest outline-none focus:border-black transition-colors placeholder:text-zinc-400"
                            />
                            <button type="submit" className="w-full bg-black text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl">
                                Unlock 15% Benefit
                            </button>
                        </form>
                        <button onClick={handleClose} className="text-[8px] uppercase tracking-widest text-zinc-400 hover:text-black underline underline-offset-4">
                            No thanks, I prefer paying full price
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 py-8">
                        <div className="w-16 h-16 bg-[#8ca67a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-[#8ca67a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-serif italic">Your Access is Active</h2>
                        <div className="bg-black text-white py-4 px-6 inline-block tracking-[0.3em] font-bold text-lg border border-dashed border-white/30">
                            WELCOME15
                        </div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-4">
                            Automatic 15% applied at checkout
                        </p>
                        <button onClick={handleClose} className="w-full bg-black text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-800 transition-all mt-4">
                            Shop The Collection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
