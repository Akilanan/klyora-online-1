import React, { useState } from 'react';

export const Footer: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success'>('idle');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setStatus('success');
            setEmail('');
        }
    };

    return (
        <footer className="bg-black text-white pt-24 pb-12 border-t border-white/10">
            <div className="max-w-[1600px] mx-auto px-10 md:px-16">

                {/* Top Section: Newsletter & Brand */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
                    <div className="max-w-md">
                        <h2 className="text-[10px] uppercase tracking-[0.6em] font-bold text-zinc-500 mb-6">Maison Klyora</h2>
                        <h3 className="text-3xl md:text-4xl font-serif italic mb-6 leading-tight">Join the Atelier</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-8 font-light tracking-wide">
                            Subscribe to receive private invitations to runway shows, bespoke curation alerts, and seasonal lookbooks.
                        </p>

                        {status === 'success' ? (
                            <div className="text-[#8ca67a] text-xs tracking-widest uppercase font-bold animate-fade-in">
                                Welcome to the Inner Circle.
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex gap-4 border-b border-white/20 pb-2 focus-within:border-white transition-colors">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="EMAIL ADDRESS"
                                    className="bg-transparent w-full outline-none text-xs uppercase tracking-[0.2em] placeholder:text-zinc-600"
                                />
                                <button type="submit" className="text-[9px] uppercase tracking-[0.4em] font-bold hover:opacity-50 transition-opacity">
                                    Subscribe
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Links Grid */}
                    <div className="flex gap-16 md:gap-32 flex-wrap">
                        <div>
                            <h4 className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-500 mb-6">Client Services</h4>
                            <ul className="space-y-4">
                                {['Concierge', 'Shipping & Returns', 'Size Guide', 'Track Order', 'Gift Cards'].map(link => (
                                    <li key={link}>
                                        <a href="#" className="text-[10px] uppercase tracking-widest text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all block">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-500 mb-6">The Maison</h4>
                            <ul className="space-y-4">
                                {['Our Heritage', 'Sustainability', 'Careers', 'Press', 'Legal'].map(link => (
                                    <li key={link}>
                                        <a href="#" className="text-[10px] uppercase tracking-widest text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all block">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/10 gap-6">
                    <h1 className="font-serif text-2xl tracking-[0.2em] italic opacity-50">KLYORA</h1>

                    <div className="flex gap-8">
                        {['Instagram', 'Pinterest', 'TikTok'].map(social => (
                            <a key={social} href="#" className="text-[9px] uppercase tracking-[0.3em] font-bold hover:opacity-50 transition-opacity">
                                {social}
                            </a>
                        ))}
                    </div>

                    <p className="text-[9px] uppercase tracking-widest text-zinc-600">
                        © 2025 Maison Klyora. All Rights Reserved.
                    </p>
                </div>

            </div>
        </footer>
    );
};
