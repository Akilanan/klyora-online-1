
import React, { useState, useEffect } from 'react';
import { shopifyService } from '../services/shopifyService';
import { leadService } from '../services/leadService';

export const NewsletterModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // ... existing code ...
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Save locally
        leadService.saveLead('newsletter', { email });

        await shopifyService.subscribeToNewsletter(email);

        setIsSubmitting(false);
        setSubmitted(true);
        setTimeout(() => {
            handleClose();
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={handleClose} />

            <div className="relative w-full max-w-lg bg-[#fcfcfc] overflow-hidden shadow-2xl animate-fade-in-up">
                <button onClick={handleClose} className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-black transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="flex flex-col md:flex-row">
                    <div className="hidden md:block w-2/5 relative">
                        <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000"
                            alt="Maison Klyora Muse"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                    </div>

                    <div className="w-full md:w-3/5 p-8 md:p-12 text-center md:text-left">
                        {!submitted ? (
                            <>
                                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#8ca67a] block mb-3">The Atelier List</span>
                                <h2 className="font-serif italic text-3xl mb-4 text-black">Unlock 10% Off</h2>
                                <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                                    Join our inner circle for first access to new silhouettes and private salon events.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input
                                        type="email"
                                        required
                                        placeholder="EMAIL ADDRESS"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-white border border-zinc-200 py-3 px-4 text-[10px] tracking-widest placeholder:text-zinc-400 focus:border-black outline-none transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-black text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Joining...' : 'Join & Unlock'}
                                    </button>
                                </form>
                                <p className="text-[8px] text-zinc-400 mt-4 uppercase tracking-widest cursor-pointer hover:text-zinc-600" onClick={handleClose}>
                                    No thanks, I prefer paying full price
                                </p>
                            </>
                        ) : (
                            <div className="py-12 text-center">
                                <h3 className="font-serif italic text-2xl mb-2 text-black">Welcome.</h3>
                                <p className="text-xs text-zinc-500 uppercase tracking-widest">Your code: <strong className="text-black">MAISON10</strong></p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
