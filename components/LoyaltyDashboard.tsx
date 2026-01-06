import React from 'react';
import { leadService } from '../services/leadService';

interface LoyaltyDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    points: number;
    customerName: string | null;
}

export const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({ isOpen, onClose, points, customerName }) => {
    if (!isOpen) return null;

    const [referralEmail, setReferralEmail] = React.useState('');

    const handleReferral = () => {
        if (!referralEmail) return;
        leadService.saveLead('referral', { email: referralEmail, referrer: customerName });
        alert("Invitation Sent. If they accept, you receive 500 Loyalty Points.");
        setReferralEmail('');
    };

    const tiers = [
        { name: 'Concierge', min: 0, benefits: ['Standard Shipping', 'Access to Sale'] },
        { name: 'Atelier', min: 1000, benefits: ['Priority Handling', 'Early Access', 'Birthday Gift'] },
        { name: 'Collector', min: 5000, benefits: ['Complimentary Global Shipping', 'Vip Concierge', 'Private Showings'] }
    ];

    const currentTier = tiers.reverse().find(t => points >= t.min) || tiers[0];
    const nextTier = tiers.slice().reverse().find(t => t.min > points);
    const progress = nextTier ? Math.min((points / nextTier.min) * 100, 100) : 100;

    return (
        <div className="fixed inset-0 z-[500] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-[500px] bg-zinc-950 text-white h-full flex flex-col shadow-2xl animate-slide-left overflow-hidden">

                {/* Header */}
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-zinc-950 z-10 relative">
                    <h2 className="text-xl font-serif italic">The Inner Circle</h2>
                    <button onClick={onClose} className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Close</button>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-12 relative">
                    {/* Status Card */}
                    <div className="text-center space-y-6 relative">
                        <div className="w-32 h-32 mx-auto rounded-full border border-white/20 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border border-white/40 animate-pulse-slow"></div>
                            <span className="text-4xl font-serif italic">{points}</span>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Current Status</p>
                            <h3 className="text-2xl font-bold uppercase tracking-[0.2em] text-[#8ca67a]">{currentTier.name}</h3>
                        </div>

                        {nextTier && (
                            <div className="max-w-xs mx-auto space-y-2">
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#8ca67a]" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">
                                    {nextTier.min - points} points to {nextTier.name}
                                </p>
                            </div>
                        )}

                        {/* Black Key Referral */}
                        <div className="pt-6 border-t border-white/5 mt-6">
                            <h4 className="text-[9px] uppercase tracking-[0.2em] text-[#8ca67a] mb-4">The Black Key</h4>
                            <div className="bg-white/5 p-4 rounded border border-white/10">
                                <p className="text-[10px] text-zinc-400 mb-3 italic">"The circle is closed, but you have 1 invitation remaining."</p>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Friend's Email"
                                        value={referralEmail}
                                        onChange={(e) => setReferralEmail(e.target.value)}
                                        className="w-full bg-black border border-white/20 px-3 py-2 text-[10px] text-white focus:border-white transition-colors"
                                    />
                                    <button
                                        onClick={handleReferral}
                                        className="bg-white text-black px-4 text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-200"
                                    >
                                        Grant
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Metal Card Request */}
                        <div className="pt-6">
                            <button
                                onClick={() => alert("Your request for the Titanium Membership Card has been sent to our Paris concierge. Expect dispatch within 3 business weeks.")}
                                className="w-full border border-white/20 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 group"
                            >
                                <svg className="w-4 h-4 text-zinc-500 group-hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                Request Physical Card
                            </button>
                            <p className="text-[8px] text-zinc-600 mt-2 uppercase tracking-widest">Available for {currentTier.name} Status</p>
                        </div>
                    </div>

                    {/* Digital Wardrobe (Mock for now, normally would fetch from orders) */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-4">Digital Wardrobe</h4>
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="aspect-[3/4] bg-white/5 relative group cursor-pointer overflow-hidden border border-white/5 hover:border-white/20 transition-colors">
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-[9px] uppercase tracking-widest group-hover:text-zinc-400">
                                        Acquired Piece {i}
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-[8px] uppercase tracking-widest font-bold">View</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] text-zinc-600 text-center italic">Your acquired collection will appear here.</p>
                    </div>

                    {/* Benefits Grid */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-4">Your Privileges</h4>
                        <div className="grid grid-cols-1 gap-4">
                            {currentTier.benefits.map(benefit => (
                                <div key={benefit} className="flex items-center gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#8ca67a] transition-colors">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-sm font-serif italic text-zinc-300">{benefit}</span>
                                </div>
                            ))}
                            {nextTier && (
                                <div className="mt-4 pt-4 border-t border-dashed border-white/10 opacity-50">
                                    <p className="text-[9px] uppercase tracking-widest mb-4">Unlock Next:</p>
                                    {nextTier.benefits.map(benefit => (
                                        <div key={benefit} className="flex items-center gap-4 mb-3">
                                            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                                                <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                            </div>
                                            <span className="text-sm font-serif italic text-zinc-500">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sign Out Action */}
                    <div className="pt-12 pb-8 border-t border-white/5">
                        <button
                            onClick={() => {
                                if (confirm("Are you sure you wish to sign out?")) {
                                    localStorage.removeItem('klyora_user');
                                    // Optional: Clear other personal data if desired, but keeping wishlist might be nice
                                    window.location.reload();
                                }
                            }}
                            className="w-full text-[9px] uppercase tracking-widest text-red-400 hover:text-white transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
