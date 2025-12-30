import React, { useState } from 'react';

interface FooterProps {
    onConciergeClick: () => void;
    onLinkClick: (title: string, type: 'shipping' | 'size-guide' | 'gift-card' | 'fabric-care' | 'track-order' | 'heritage' | 'sustainability' | 'careers' | 'legal' | 'press' | 'return-refund' | 'coming-soon') => void;
    onSubscribe: (email: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onConciergeClick, onLinkClick, onSubscribe }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success'>('idle');
    const [isSubscribed, setIsSubscribed] = useState(false);

    React.useEffect(() => {
        const saved = localStorage.getItem('klyora_newsletter_subscribed');
        if (saved) setIsSubscribed(true);
    }, []);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            localStorage.setItem('klyora_newsletter_subscribed', 'true');
            setStatus('success');
            setIsSubscribed(true);
            onSubscribe(email);
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

                        {status === 'success' || isSubscribed ? (
                            <div className="text-[#8ca67a] text-xs tracking-widest uppercase font-bold animate-fade-in border border-[#8ca67a]/20 bg-[#8ca67a]/5 p-4 text-center">
                                You are on the Guest List.
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
                        <nav aria-label="Client Services">
                            <h4 className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-500 mb-6">Client Services</h4>
                            <ul className="space-y-4">
                                {['Concierge', 'Shipping & Returns', 'Return & Refund Policy', 'Size Guide', 'Track Your Order', 'Gift Cards'].map(link => (
                                    <li key={link}>
                                        {link === 'Concierge' ? (
                                            <button onClick={onConciergeClick} className="text-[10px] uppercase tracking-widest text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all block text-left">
                                                {link}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    if (link === 'Shipping & Returns') onLinkClick(link, 'shipping');
                                                    else if (link === 'Return & Refund Policy') onLinkClick(link, 'return-refund');
                                                    else if (link === 'Size Guide') onLinkClick(link, 'size-guide');
                                                    else if (link === 'Track Your Order') onLinkClick(link, 'track-order');
                                                    else if (link === 'Gift Cards') onLinkClick(link, 'gift-card');
                                                    else if (link === 'Track Order') onLinkClick(link, 'track-order');
                                                    else onLinkClick(link, 'coming-soon');
                                                }}
                                                className="text-[10px] uppercase tracking-widest text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all block text-left"
                                            >
                                                {link}
                                            </button>
                                        )}
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={() => onLinkClick('Fabric Care Guide', 'fabric-care')}
                                        className="text-[10px] uppercase tracking-widest text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all block text-left"
                                    >
                                        Fabric Care Guide
                                    </button>
                                </li>
                            </ul>
                        </nav>
                        <nav aria-label="Company Information">
                            <h4 className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-500 mb-6">The Maison</h4>
                            <ul className="space-y-4">
                                {['Our Heritage', 'Sustainability', 'Careers', 'Press', 'Legal'].map(link => (
                                    <li key={link}>
                                        <button
                                            onClick={() => {
                                                if (link === 'Legal') onLinkClick(link, 'legal');
                                                else if (link === 'Sustainability') onLinkClick(link, 'sustainability');
                                                else onLinkClick(link, 'coming-soon');
                                            }}
                                            className="text-[10px] uppercase tracking-widest text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all block text-left"
                                        >
                                            {link}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/10 gap-6">
                    <div className="flex flex-col gap-4">
                        <h1 className="font-serif text-2xl tracking-[0.2em] italic opacity-50">KLYORA</h1>
                        <div className="flex gap-3 mt-2 opacity-50">
                            {/* Payment Icons (Text Badges) */}
                            {['VISA', 'AMEX', 'PAYPAL', 'RAZORPAY', 'KLARNA'].map(pay => (
                                <div key={pay} className="border border-white/20 px-2 py-1 text-[8px] font-bold tracking-widest">{pay}</div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <div className="flex gap-8">
                            {['Instagram', 'Pinterest', 'TikTok'].map(social => (
                                <a key={social} href="#" className="text-[9px] uppercase tracking-[0.3em] font-bold hover:opacity-50 transition-opacity">
                                    {social}
                                </a>
                            ))}
                        </div>

                        {/* Region Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                                <span>Global (USD $)</span>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div className="absolute bottom-full right-0 mb-2 w-32 bg-zinc-900 border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                {['Global (USD $)', 'Europe (EUR €)', 'UK (GBP £)'].map(curr => (
                                    <button key={curr} className="block w-full text-left px-4 py-2 text-[9px] text-zinc-400 hover:bg-white/5 hover:text-white uppercase tracking-widest">
                                        {curr}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-[9px] uppercase tracking-widest text-zinc-600">
                        © 2025 Maison Klyora. All Rights Reserved.
                    </p>
                </div>

            </div>
        </footer >
    );
};
